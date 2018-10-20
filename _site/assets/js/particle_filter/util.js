function gaussian(x, mu, sigma){
	return 1/(2*Math.PI*sigma*sigma)*Math.exp(-(x-mu)*(x-mu)/(sigma*sigma));
}


function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}


function normalize_vector(u){
    var v = Array.from(u);
    var max = v[0];
    for (var i = 0; i < v.length; i++) {
        max = Math.max(v[i],max);
    }
    for (var i = 0; i < v.length; i++) {
        v[i]/=max;
    }
    return v;
}

function norm_vector(u){
    var sum = 0;
    var v = Array.from(u);
    for (var i = 0; i < v.length; i++) {
        sum += v[i];
    }
    for (var i = 0; i < v.length; i++) {
        v[i]/=sum;
    }
    return v;
}

function distance_xy(a,b){
        return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y))
    }
