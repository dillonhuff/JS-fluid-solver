/* File: simulator.js
 * The Simulator object maintains the Grid object and all of the
 * simulation values, as well as the main algorithm steps.
 */


BOUNDARY_MIRROR = 0;
BOUNDARY_OPPOSE_X = 1;
BOUNDARY_OPPOSE_Y = 2;


/* The Simulator object provides an API for running the simulation using
 * the resources made available by the Grid data structure.
 * Parameters:
 *      ui - a UI object that keeps track of the GUI and user interaction,
 *           and also provides all of the sim parameters.
 */
function Simulator(ui) {
    this.ui = ui;
    this.timeStep = this.ui.dT;
    // TODO - change ui.___ to getter functions.
    this.grid = new Grid([this.ui.grid_cols, this.ui.grid_rows],
                         [this.ui.width, this.ui.height], ui);

    // NOTE ON BCS: Maybe boundary conditions should be passed in as a lambda?
    // This would allow for more flexibility in the use of diffuse, project, and
    // advect

    
    // Sets the values of vector cur to the "diffused" values.
    // That is, the values of cur "leak in" to and "leak out" of all
    // neighboring cells.
    // k is the diffusion constant (diff or visc, depending)
    // bMode is the boundary mode for setBoundary().
    //this.diffuse = function(cur, prev, k, bMode) {
    this.diffuse = function(cur, prev, k, boundaryCondition) {
        //var a = this.timeStep * k * this.grid.N[X_DIM] * this.grid.N[Y_DIM];
        var a = this.timeStep * k * Math.sqrt(this.ui.width * this.ui.height);
        for(var iter=0; iter<this.ui.solver_iters; iter++) {
            for(var i = 1; i <= xDim(cur); i++) {
                for(var j = 1; j <= yDim(cur); j++) {

		    setElem(cur, i, j, (elem(prev, i, j)
					+ a*(elem(cur, i-1, j) + elem(cur, i+1, j) +
                                             elem(cur, i, j-1) + elem(cur, i, j+1))
				       ) / (1 + 4*a))
                }
            }
            //setBoundary(cur, bMode);
	    boundaryCondition(cur);
        }
    }

    // Sets the fields in cur to be the values of prev flowing in the
    // direction given by velocity vel (a multi-dimensional velocity field).
    // bMode is the boundary mode for setBoundary().
    this.advect = function(cur, prev, vel, boundaryCondition) {//bMode) {
        var lX = this.grid.len_cells[X_DIM];
        var lY = this.grid.len_cells[Y_DIM];

	for(var i = 1; i <= xDim(cur); i++) {
            for(var j = 1; j <= yDim(cur); j++) {
        		
                // get resulting x coordinate cell after backtracking by vel
                var start_x = i * lX;
                var end_x = start_x - this.timeStep * elem3(vel, X_DIM, i, j);
                if(end_x < 0)
                    end_x = 0;
                if(end_x > this.grid.N[X_DIM] * lX)
                    end_x = this.grid.N[X_DIM] * lX;
                var i0 = Math.floor(end_x / lX + 0.000001); // NOTE - rounding error
                var i1 = i0 + 1;
                // get resulting y coodinate cell after backtracking by vel
                var start_y = j * lY;
                var end_y = start_y - this.timeStep * elem3(vel, Y_DIM, i, j);
                if(end_y < 0)
                    end_y = 0;
                if(end_y > this.grid.N[Y_DIM] * lY)
                    end_y = this.grid.N[Y_DIM] * lY;
                var j0 = Math.floor(end_y / lY + 0.000001); // NOTE - rounding error
                var j1 = j0 + 1;
                // bilinear interopolation:
                var s1 = (end_x - start_x)/lX;
                var s0 = 1 - s1;
                var t1 = (end_y - start_y)/lY;
                var t0 = 1 - t1;

                setElem(cur, i, j,
			s0*(t0*elem(prev, i0, j0) + t1*elem(prev, i0, j1)) +
			s1*(t0*elem(prev, i1, j0) + t1*elem(prev, i1, j1)));

	    }
        }
        boundaryCondition(cur);//, bMode);
    }

    // Project step forces velocities to be mass-conserving.
    this.project = function(vel, buf,
			    pressureBC, velBC) {
        var Lx = 1.0 / this.ui.width;
        var Ly = 1.0 / this.ui.height;
        var p = buf[X_DIM];
        var div = buf[Y_DIM];
        for(var i=1; i<=this.grid.N[X_DIM]; i++) {
            for(var j=1; j<=this.grid.N[Y_DIM]; j++) {
                setElem(div, i, j, -0.5*(Lx*(elem3(vel, X_DIM, i+1, j) - elem3(vel, X_DIM, i-1, j)) +
					 Ly*(elem3(vel, Y_DIM, i, j+1) - elem3(vel, Y_DIM, i, j-1))));
		setElem(p, i, j, 0);
            }
        }

        // setBoundary(div, BOUNDARY_MIRROR);
        // setBoundary(p, BOUNDARY_MIRROR);

	pressureBC(div);
	pressureBC(p);

        // setBoundary(div, BOUNDARY_MIRROR);
        // setBoundary(p, BOUNDARY_MIRROR);

	// TODO - move to a separate function (shared w/ diffuse)
        for(var iter = 0; iter < this.ui.solver_iters; iter++) {
            for(var i = 1; i <= this.grid.N[X_DIM]; i++) {
                for(var j = 1; j <= this.grid.N[Y_DIM]; j++) {
                    setElem(p, i, j, (elem(div, i, j)
                                      + elem(p, i-1, j) + elem(p, i+1, j)
                                      + elem(p, i, j-1) + elem(p, i, j+1)
                                     ) / 4);
                }
            }
            //setBoundary(p, BOUNDARY_MIRROR);
	    pressureBC(p);
        }
        for(var i=1; i<=this.grid.N[X_DIM]; i++) {
            for(var j=1; j<=this.grid.N[Y_DIM]; j++) {
		subElem3(vel, X_DIM, i, j, 0.5*(elem(p, i + 1, j) - elem(p, i-1, j)) / Lx);
		subElem3(vel, Y_DIM, i, j, 0.5*(elem(p, i, j + 1) - elem(p, i, j-1)) / Ly);
            }
        }

	velBC(vel);
	//setVelBoundary(vel);
    }

    // Does one velocity field update.
    this.vStep = function() {
        for(var dim = 0; dim < N_DIMS; dim++) {

            addSource(this.timeStep, this.grid.vel[dim], this.grid.prev_vel[dim]);
            addSource(this.timeStep, this.grid.vel[dim], this.grid.src_vel[dim]);

	}

	this.grid.swapV();

	for(var dim = 0; dim < N_DIMS; dim++) {
	    if (dim == X_DIM) {
		this.diffuse(this.grid.vel[dim], this.grid.prev_vel[dim],
                             this.ui.visc, setBoundaryOpposeX);
	    } else if (dim == Y_DIM) {
		this.diffuse(this.grid.vel[dim], this.grid.prev_vel[dim],
                             this.ui.visc, setBoundaryOpposeY);
		
	    } else {
		alert('BAD BC in vSTep');
	    }
	}

        this.project(this.grid.vel, this.grid.prev_vel,
		     setBoundaryMirror, setVelBoundaryWrapY);

        this.grid.swapV();

        for(var dim = 0; dim < N_DIMS; dim++) {
	    if (dim == X_DIM) {
		this.advect(this.grid.vel[dim], this.grid.prev_vel[dim],
                            this.grid.vel, setBoundaryOpposeX);
	    } else if (dim == Y_DIM) {
		this.advect(this.grid.vel[dim], this.grid.prev_vel[dim],
                            this.grid.vel, setBoundaryOpposeY);

	    } else {
		alert('Bad BC in advect!');
	    }
	}

        this.project(this.grid.vel, this.grid.prev_vel,
		     setBoundaryMirror, setVelBoundaryWrapY);
    }

    // Does one scalar field update.
    this.dStep = function() {

        addSource(this.timeStep, this.grid.dens, this.grid.prev_dens);
        addSource(this.timeStep, this.grid.dens, this.grid.src_dens);

	this.grid.swapD();
        this.diffuse(this.grid.dens, this.grid.prev_dens,
                     this.ui.diff, setBoundaryYWrapXSink); //setBoundaryMirror); //BOUNDARY_MIRROR);
        this.grid.swapD();
        this.advect(this.grid.dens, this.grid.prev_dens,
                    this.grid.vel, setBoundaryYWrapXSink); //setBoundaryMirror); //BOUNDARY_MIRROR);
        
    }
    
    // Take one step in the simulation.
    this.step = function(ctx) {
        //this.grid.clearCurrent();
        this.grid.clearPrev();
        this.grid.clearSources();
        var src_point = this.ui.getSource();
        if (src_point) {
            if (this.ui.getActionType() == ACT_DENSITY_SRC) {
                this.grid.addDensSource(src_point.x, src_point.y, 1);
            } else if (this.ui.getActionType() == ACT_VELOCITY_SRC) {
                var vX = this.ui.getDragX();
                var vY = this.ui.getDragY();

		console.log('vX = ' + vX + '\nvY = ' + vY);

                this.grid.addVelSource(src_point.x, src_point.y, vX, vY);
            } else if (this.ui.getActionType() == ACT_ADD_MATERIAL_SRC) {
		var idx = this.grid.getContainerCell(src_point.x, src_point.y);
		this.grid.solid_cells_x.push(idx.i);
		this.grid.solid_cells_y.push(idx.j);
	    } else {
		alert('No action in simulator!');
	    }
        }
        this.vStep();
        this.dStep();
        this.grid.render(ui.ctx, ui.show_grid, ui.show_vels);
    }

    // Adds gravity to the simulation. Pass negative g-force value to
    // remove the gravity component again.
    // The gravity is added as a gravity current.
    this.addGravity = function(g) {
        for(var i=0; i<this.grid.N[X_DIM]+2; i++) {
            for(var j=0; j<this.grid.N[Y_DIM]+2; j++) {
		this.grid.src_vel[Y_DIM][i][j] = g;
	    }
	}
    }
}
