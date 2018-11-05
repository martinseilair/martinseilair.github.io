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


function isDescendantOrSelf(parent, child) {
    var node = child;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}


function categorial(p,n) {
    var samples = [];
    var rans = [];
    for (var i=0; i<n; i++){
        rans.push(Math.random());
    }
    rans.sort();

    var s = 0;

    for (var i = 0; i < n; i++) {
        s += p[i];

        while(rans[0] < s){
            samples.push(i)
            rans.shift();
        }
    }
    return samples;
}


function sample_gmm(mix, gs, n, dom){

    var latent = categorial(mix,n);
    var samples = []

    var x = 0;
    for (var i = 0; i < n; i++) {

        do{
            x = gs[latent[i]][0] + gs[latent[i]][1]*randn_bm();

        }while(x<dom[0]||x>dom[1])

        samples.push(x);
    }  
    return samples; 
}

function mean(v){
    return v.reduce((total,e)=>total+e)/v.length;
}


function gmm(x,mix, gs){
    var y = 0;
    for (var j = 0; j < mix.length; j++) {
        y+=mix[j]*gaussian(x,gs[j][0],gs[j][1]);
    }   
    return y;
}
