/* File: utils.js
/* Provides functions and tools to be used by various other classes.
 */


/* Generates a preallocated array of size n filled with zeros. */
function zeros(n) {
    return Array.apply(null, new Array(n)).map(Number.prototype.valueOf, 0);
}


/* Generates a preallocated 2D array of size n by m filled with zeros. */
function zeros2d(n, m) {
    var arr = new Array();
    for(var i=0; i<n; i++)
        arr.push(zeros(m));
    return arr;
}


/* Generates a preallocated 3D array of size n by m by l filled with zeros. */
function zeros3d(n, m, l) {
    var arr = new Array();
    for(var i=0; i<n; i++)
        arr.push(zeros2d(m, l));
    return arr;
}


/* Generates a preallocated 4D zero-array of size n by m by l by k. */
function zeros4d(n, m, l, k) {
    var arr = new Array();
    for(var i=0; i<n; i++)
        arr.push(zeros3d(m, l, k));
    return arr;
}

function elem(X, i, j) {
    //return X[i][j][1];
    return X[i][j];
}

function elem3(X, i, j, k) {
    //return X[i][j][k][1];
    return X[i][j][k];//[1];
}

function setElem(X, i, j, val) {
    //X[i][j][1] = val;
    X[i][j] = val;
}

function subElem3(X, dim, i, j, val) {
    //X[dim][i][j][1] -= val;
    X[dim][i][j] -= val;
}

function xDim(X) {
    return X.length - 2;
}

function yDim(X) {
    return X[0].length - 2;
}

