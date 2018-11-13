function dist(p,q){
	return Math.sqrt((p[0]-q[0])*(p[0]-q[0]) + (p[1]-q[1])*(p[1]-q[1]));
}

function norm(p){
	return Math.sqrt(p[0]*p[0]+ p[1]*p[1]);
}

function rk4(x, u, f, h){
	k1 = math.multiply(h,f(x,u));
	k2 = math.multiply(h,f(math.add(x, math.multiply(0.5,k1)),u));
	k3 = math.multiply(h,f(math.add(x, math.multiply(0.5,k2)),u));
	k4 = math.multiply(h,f(math.add(x, k3),u));

	return math.add(x, math.multiply(1.0/6.0,math.add(k1,math.multiply(2,k2),math.multiply(2,k3),k4)))
}

function nextHalfedge(e) { return (e % 3 === 2) ? e - 2 : e + 1; }
