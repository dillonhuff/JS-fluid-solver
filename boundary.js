this.setBoundaryMirror = function(X) {
    // index 1 and "last" are the endpoints of the active grid
    // var lastX = this.grid.N[X_DIM];
    // var lastY = this.grid.N[Y_DIM];

    var lastX = X.length - 2;
    var lastY = X[0].length - 2;

    //alert('lastX = ' + lastX + ', lastY = ' + lastY + ', xLen = ' + xLen + ', yLen = ' + yLen);
    
    // index 0 and "edge" are the border cells we're updating
    var edgeX = lastX + 1;
    var edgeY = lastY + 1;
    // update left and right edges
    for(var j=1; j<=lastY; j++) {
        setElem(X, 0, j, elem(X, 1, j));
        setElem(X, edgeX, j, elem(X, lastX, j));
    }
    // update top and bottom edges
    for(var i=1; i<=lastX; i++) {
        setElem(X, i, 0, elem(X, i, 1));
        setElem(X, i, edgeY, elem(X, i, lastY));
    }
    // update corners to be averages of their nearest edge neighbors
    setElem(X, 0, 0,         0.5*(elem(X, 1, 0) + elem(X, 0, 1)));
    setElem(X, 0, edgeY,     0.5*(elem(X, 1, edgeY) + elem(X, 0, lastY)));
    setElem(X, edgeX, 0,     0.5*(elem(X, lastX, 0) + elem(X, edgeX, 1)));
    setElem(X, edgeX, edgeY, 0.5*(elem(X, lastX, edgeY) + elem(X, edgeX, lastY)));

}


this.setBoundaryOpposeX = function(X) {
    // index 1 and "last" are the endpoints of the active grid
    // var lastX = this.grid.N[X_DIM];
    // var lastY = this.grid.N[Y_DIM];

    var lastX = X.length - 2;
    var lastY = X[0].length - 2;
    
    // index 0 and "edge" are the border cells we're updating
    var edgeX = lastX + 1;
    var edgeY = lastY + 1;
    // update left and right edges
    for(var j=1; j<=lastY; j++) {
        setElem(X, 0, j, -elem(X, 1, j));
        setElem(X, edgeX, j, -elem(X, lastX, j));

    }
    // update top and bottom edges
    for(var i=1; i<=lastX; i++) {
        setElem(X, i, 0, elem(X, i, 1));
        setElem(X, i, edgeY, elem(X, i, lastY));
    }
    // update corners to be averages of their nearest edge neighbors
    setElem(X, 0, 0,         0.5*(elem(X, 1, 0) + elem(X, 0, 1)));
    setElem(X, 0, edgeY,     0.5*(elem(X, 1, edgeY) + elem(X, 0, lastY)));
    setElem(X, edgeX, 0,     0.5*(elem(X, lastX, 0) + elem(X, edgeX, 1)));
    setElem(X, edgeX, edgeY, 0.5*(elem(X, lastX, edgeY) + elem(X, edgeX, lastY)));
}

this.setBoundaryOpposeY = function(X) {
    // index 1 and "last" are the endpoints of the active grid
    // var lastX = this.grid.N[X_DIM];
    // var lastY = this.grid.N[Y_DIM];

    var lastX = X.length - 2;
    var lastY = X[0].length - 2;

    // index 0 and "edge" are the border cells we're updating
    var edgeX = lastX + 1;
    var edgeY = lastY + 1;
    // update left and right edges
    for(var j = 1; j <= lastY; j++) {
        setElem(X, 0, j, elem(X, 1, j));
        setElem(X, edgeX, j, elem(X, lastX, j));
    }
    // update top and bottom edges
    for(var i=1; i<=lastX; i++) {
        setElem(X, i, 0, -elem(X, i, 1));
        setElem(X, i, edgeY, -elem(X, i, lastY));
    }
    // update corners to be averages of their nearest edge neighbors
    setElem(X, 0, 0,         0.5*(elem(X, 1, 0) + elem(X, 0, 1)));
    setElem(X, 0, edgeY,     0.5*(elem(X, 1, edgeY) + elem(X, 0, lastY)));
    setElem(X, edgeX, 0,     0.5*(elem(X, lastX, 0) + elem(X, edgeX, 1)));
    setElem(X, edgeX, edgeY, 0.5*(elem(X, lastX, edgeY) + elem(X, edgeX, lastY)));
}

