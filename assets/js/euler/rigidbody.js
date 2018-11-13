class RigidBody extends MechanicalSystem{

	state_to_points(state){

		var points = [];

		for (var i=0; i<this.N;i++){ 
			points.push([
				state._data[0] - Math.cos(this.pp[i].phi + state._data[2])*this.pp[i].r,
				state._data[1] - Math.sin(this.pp[i].phi + state._data[2])*this.pp[i].r])
		}

		return points;
	}

	state_to_vel(state){

		var vel = [];

		for (var i=0; i<this.N;i++){ 
			vel.push([
				state._data[3] + state._data[5]*Math.sin(this.pp[i].phi + state._data[2])*this.pp[i].r,
				state._data[4] - state._data[5]*Math.sin(this.pp[i].phi + state._data[2])*this.pp[i].r])
		}

		return vel;
	}


	init(){
		// calculate total mass 

		this.tm = 0;
		for (var i=0; i<this.N;i++){ 
			this.tm+=this.points[i][2];
		}

		// center of mass
		this.com = math.zeros(2)
		for (var i=0; i<this.N;i++){ 
			this.com._data[0]+=this.points[i][0]*this.points[i][2];
			this.com._data[1]+=this.points[i][1]*this.points[i][2];
		}

		this.com = math.multiply(1.0/this.tm, this.com);

	
		// calculate point coordinates in polar coordinates with respect to com
		this.pp = [];
		for (var i=0; i<this.N;i++){ 
			var relx = [[this.com._data[0] - this.points[i][0]],[this.com._data[1] - this.points[i][1]]];
			this.pp.push({r: norm(relx), phi: Math.atan2(relx[1],relx[0])})
		}

		// calculate momentum of inertia
		this.I = 0;
		for (var i=0; i<this.N;i++){ 
			this.I+=this.points[i][2]*this.pp[i].r*this.pp[i].r;
		}


		this.state = math.matrix([this.com._data[0], this.com._data[1], 0.0, 0.0, 0.0, 0.0])

	}



	dxdt(x, u){
		var F = [0.0, 0.0];
		var M = 0.0;


		var p = this.state_to_points(x);
		var v = this.state_to_vel(x);


		var dx, dxd;
		var fk,fb;


		var dist;


		// Wall collision
		var kw = 100000;
		var bw = 1000;
		var s;
		var ft = 0;
		for (var i=0; i<this.N;i++){ 			// points
			for (var j=0; j<2;j++){			// dimensions (=2)
				var op = [p[i][0] - x._data[0], p[i][1] - x._data[1]]

				if(p[i][j]<this.box[j][0]+radius){
					ft=-kw*(-p[i][j] + radius + this.box[j][0]);
					ft+=-bw*(-v[i][j]);
					F[j]+=ft;
					M+=Math.pow(-1.0,j+1)*ft*op[(j+1)%2];
				}
				if(p[i][j]>this.box[j][1]-radius){
					ft=kw*(p[i][j] + radius - this.box[j][1]);
					ft+=bw*(v[i][j]);
					F[j]+=ft;
					M+=Math.pow(-1.0,j+1)*ft*op[(j+1)%2];
				}
				

			}
		}

		var km = 50000;
		var bm = 10000;




		function dist_point_line(o,r,p){

			h = [p[0]-o[0], p[1]-o[1]];
			f =  (r[0]*r[0] + r[1]*r[1])/(h[0]*r[0] + h[1]*r[1]);
			rs = [f*r[0], f*r[1]];
			r = dist(rs, p)


		}

		if(this.pr.mouse_is_down){
			// add spring and damper to drag point
			dx = [p[this.pr.drag_i][0] - this.pr.mouse_coords._data[0], p[this.pr.drag_i][1] - this.pr.mouse_coords._data[1]]
			dxd = [v[this.pr.drag_i][0] - this.pr.mouse_coords_d._data[0], v[this.pr.drag_i][1] - this.pr.mouse_coords_d._data[1]]

			// distance between points
			dist = norm(dx);

			var dxm = math.matrix(dx)
			var dxdm = math.matrix(dxd)
			// factors for springs and damper
			fk = km*(dist-0)/dist;
			fb = bm*math.multiply(dxm,dxdm)/(dist*dist);
			var op = [this.pr.mouse_coords._data[0] - x._data[0], this.pr.mouse_coords._data[1] - x._data[1]]

			for (var j=0; j<2;j++){ // for x and y	
				// spring 
				ft=fk*dx[j]

				// damper
				ft+=fb*dx[j]
				F[j]+=ft;
				M+=Math.pow(-1.0,j+1)*ft*op[(j+1)%2];
			}


			



		}

		var x_out = math.matrix([x._data[3], x._data[4], x._data[5], -F[0]/this.tm,-F[1]/this.tm,-M/this.I]);
		//var x_out = math.matrix([x._data[3], x._data[4], x._data[5], 0,0,0]);

		return x_out;	
	}





}
