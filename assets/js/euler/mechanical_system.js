
class MechanicalSystem{
	constructor(points, edges, radius, width, height){
		this.points = points;
		this.edges = edges;
		this.pr = [];
		this.last_time = new Date().getTime();
		this.d_dt  = 0.005;
		this.T = 10;
		this.mouse_coords_old =  math.matrix([0.0, 0.0]);
		this.mouse_coords_d = math.matrix([0.0, 0.0]);
		this.width = width;
		this.height = height;
		this.radius = radius;
		this.box = [[0,this.width],[0,this.height]];
		this.N = state._data.length/4;
		this.init();
	}

	init(){

	}

	init_renderer(div){
		this.pr = new PointRenderer(div, this.points, this.edges, this.width, this.height, this.radius);
	}

	start(state){
		this.state = state;
		setInterval(this.update.bind(this), this.T);
	}

	update(){

		// get time difference
		var this_time = new Date().getTime();
		var dt = (this_time-this.last_time)/1000.0;
		this.last_time = this_time;

		// calculate mouse speed
		if(!this.pr.mouse_has_left){
			var alpha = 0.8;
			this.mouse_coords_d = math.add(
				math.multiply(alpha,		this.mouse_coords_d), 
				math.multiply(1.0-alpha,	math.multiply(1/dt,math.subtract(this.pr.mouse_coords,this.mouse_coords_old))))
			this.mouse_coords_old = math.clone(this.pr.mouse_coords);
		}

		// how many should rk4 be run?
		var n=3

		for(var i=0;i<n;i++){
			u = math.zeros(2*this.N);
			this.state = rk4(this.state, u, this.dxdt.bind(this), this.d_dt)
		}



		// draw
		this.pr.update(this.state_to_points(this.state))

	}
}