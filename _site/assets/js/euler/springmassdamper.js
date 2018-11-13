class SpringMassDamper extends MechanicalSystem{


	state_to_points(state){
		return [...Array(this.N)].map((e,i)=>{return [state._data[2*i],state._data[2*i+1]] ;});
	}

	init(){

		this.m_vec = math.zeros(2*this.N);
		for (var i=0; i<this.N;i++){ 
			this.m_vec._data[2*i]=1.0/this.points[i][2];
			this.m_vec._data[2*i+1]=1.0/this.points[i][2];
		}


	}


	dxdt(x, u){
		var F = math.zeros(2*this.N);

		var k = 100000;

		var b = 1000;

		var M = math.multiply(m, math.identity(2*this.N));

		var dx, dxd;
		var fk,fb;


		var dist;
		for (var i=0; i<this.edges.length;i++){
			p0 = this.edges[i][0];
			p1 = this.edges[i][1];
			// difference of positions
			dx = math.subtract(math.subset(x, math.index(math.range(2*p0,2*p0+2))),math.subset(x, math.index(math.range(2*p1,2*p1+2))))
			// difference of velocity
			dxd = math.subtract(math.subset(x, math.index(math.range(2*this.N + 2*p0,2*this.N + 2*p0+2))),math.subset(x, math.index(math.range(2*this.N + 2*p1,2*this.N + 2*p1+2))))
			// distance between points
			dist = norm(dx._data);

			// factors for springs and damper
			fk = k*(dist-this.edges[i][2])/dist;
			fb = b*math.multiply(dx,dxd)/(dist*dist);

			for (var j=0; j<2;j++){ // for x and y	
				// spring 
				F._data[2*p0+j]+=fk*dx._data[j]
				F._data[2*p1+j]+=-fk*dx._data[j]
				// damper
				F._data[2*p0+j]+=fb*dx._data[j]
				F._data[2*p1+j]+=-fb*dx._data[j]
			}
		}

		// Wall collision
		var kw = 80000;
		var bw = 1000;
		var s;
		for (var i=0; i<this.N;i++){ 			// points
			for (var j=0; j<2;j++){			// dimensions (=2)
				if(x._data[2*i+j]<this.box[j][0]+radius){
					F._data[2*i+j]+=-kw*(-x._data[2*i+j] + radius + this.box[j][0]);
					F._data[2*i+j]+=-bw*(-x._data[2*this.N + 2*i+j]);
				}
				if(x._data[2*i+j]>this.box[j][1]-radius){
					F._data[2*i+j]+=kw*(x._data[2*i+j] + radius - this.box[j][1]);
					F._data[2*i+j]+=bw*(x._data[2*this.N + 2*i+j]);
				}
			}
		}


		function far(p1, p2, dist) {
			return(p2 - p1 > dist || p1 - p2 > dist);
		}


		// collision with other balls

		var kb = 100000;
		var bb = 1000;
		for (var i=0; i<this.N;i++){ 			// first point
			for (var j=i+1; j<this.N;j++){ 			// second point
				if(far(x._data[2*i], x._data[2*j], 2 * radius) && far(x._data[2*i+1], x._data[2*j+1], 2 * radius)) continue;


				dx = math.subtract(math.subset(x, math.index(math.range(2*i,2*i+2))),math.subset(x, math.index(math.range(2*j,2*j+2))))
				dxd = math.subtract(math.subset(x, math.index(math.range(2*this.N + 2*i,2*this.N + 2*i+2))),math.subset(x, math.index(math.range(2*this.N + 2*j,2*this.N + 2*j+2))))
			
				dist = norm(dx._data);

				if(dist < 2*radius){
					// factors for springs and damper
					fk = kb*(2*radius-dist)/dist;
					fb = bb*math.multiply(dx,dxd)/(dist*dist);

					for (var l=0; l<2;l++){ // for x and y	
						// spring 

						F._data[2*i+l]+=-fk*dx._data[l]
						F._data[2*j+l]+=fk*dx._data[l]
						// damper
						F._data[2*i+l]+=fb*dx._data[l]
						F._data[2*j+l]+=-fb*dx._data[l]
					}

				}

			}
		}
		var km = 50000;
		var bm = 10000;
		if(this.pr.mouse_is_down){

			// add spring and damper to drag point

			dx = math.subtract(math.subset(x, math.index(math.range(2*this.pr.drag_i,2*this.pr.drag_i+2))),this.pr.mouse_coords)
			dxd = math.subtract(math.subset(x, math.index(math.range(2*this.N + 2*this.pr.drag_i,2*this.N + 2*this.pr.drag_i+2))), this.mouse_coords_d)
			// distance between points
			dist = norm(dx._data);

			// factors for springs and damper
			fk = km*(dist-0)/dist;
			fb = bm*math.multiply(dx,dxd)/(dist*dist);


			for (var j=0; j<2;j++){ // for x and y	
				// spring 
				F._data[2*this.pr.drag_i+j]+=fk*dx._data[j]

				// damper
				F._data[2*this.pr.drag_i+j]+=fb*dx._data[j]

			}


		}
		var x_out = math.zeros(4*this.N);


		var MF = math.dotMultiply(this.m_vec,math.subtract(u,F));
		x_out.subset(math.index(math.range(0,2*this.N))		, math.subset(x, math.index(math.range(2*this.N,4*this.N))))
		x_out.subset(math.index(math.range(2*this.N,4*this.N)) , MF)
		return x_out;	
	}



}
