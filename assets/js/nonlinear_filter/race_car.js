class RaceCar {

	constructor(radial_race_track, base_url){

		this.state = 0.0;
		this.race_track = radial_race_track;

		// parameters of dynamics
		this.min_b = 0.0;
		this.a = 0.15; //output
		this.kth = 0.00;
		this.c = 50.0;
		this.d = 0.1; //system

		this.u_abs = 80.0; //system

		this.base_url = base_url;


	}



	init(){
		this.state = this.initial_dist_sample();
		this.race_track.init_car(this.state, this.base_url);
	}

	reset(){
		this.state = this.initial_dist_sample();
		this.race_track.update_car(this.state,0, 0);
	}

	initial_dist_sample(){
		// uniform distribution

		return this.race_track.track_length*Math.random();

	}

	b(state){
		var kappa = this.race_track.get_curvature_pos(state);
		//return Math.max(this.l, 1.0 - this.c*kappa);
		//return 1.0;

		return Math.max(this.min_b, Math.exp(-kappa*this.c));
	}

	mu_s(state, input){
		return state + this.b_cache*this.u_abs*(input-1.0);

	}

	sigma_s(input){
		return this.d*this.b_cache*this.u_abs;
	}

	mu_s_no_cache(state, input){
		this.b_cache = this.b(state);
		return this.mu_s(state, input);

	}

	sigma_s_no_cache(state, input){
		this.b_cache = this.b(state);
		return this.sigma_s(input);
	}

	system_dist(state_p, state, input){
		return gaussian(state_p, this.mu_s(state, input), this.sigma_s(input)) + gaussian(state_p+this.race_track.track_length, this.mu_s(state, input), this.sigma_s(input)) + gaussian(state_p-this.race_track.track_length, this.mu_s(state, input), this.sigma_s(input));
	}

	system_dist_single(state_p, state, input){
		this.b_cache = this.b(state);
		return this.system_dist(state_p, state, input);
	}

	system_dist_array(state_p, state, input){
		// get system dynamics distribution
		var p = [];
		this.b_cache = this.b(state);

		for (var i=0;i<state_p.length;i++){

			p.push(this.system_dist(state_p[i], state, input));
		}

		return p;
	}

	system_dist_approx(n, input){
		var pdf = [];
		var states = [...Array(n)].map((e,i)=>{return this.race_track.track_length*i/n});
    	return [...Array(n)].map((e,i)=>{return this.system_dist_array(states, states[i], input);});
	}

	system_dist_sample(state, input){
		this.b_cache = this.b(state);
		var sample = (this.mu_s(state, input) + randn_bm()*this.sigma_s(input))  

		this.overflow = (sample - (sample % this.race_track.track_length))/this.race_track.track_length;

		if(sample <0){
			this.overflow=-1.0;
			sample +=this.race_track.track_length;
		}

		return sample % this.race_track.track_length;
	}

	step(input){
		// perform step corresponding to system dynamics
		this.state = this.system_dist_sample(this.state, input);
		this.race_track.update_car(this.state,scene.dur, this.overflow);
	}



	mu_o(){
		return this.dist_cache;
	}

	sigma_o(){
		//return this.a*100.0;
		return this.a*this.dist_cache;
	}

	mu_o_no_cache(state){
		var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(state), 0.0);
		this.dist_cache = distance_xy(L, this.race_track.trees[0]);
		return this.mu_o();
	}

	sigma_o_no_cache(state){
		var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(state), 0.0);
		this.dist_cache = distance_xy(L, this.race_track.trees[0]);
		return this.sigma_o();
	}



	output_dist(distance, state, tree_id){
		return gaussian(distance, this.mu_o(), this.sigma_o());
	}

	output_dist_single(distance, state, tree_id){
		// get output distribution
		var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(state), 0.0);

		this.dist_cache = distance_xy(L, this.race_track.trees[tree_id]);
		return this.output_dist(distance, state, tree_id);
	}

	output_dist_array(distance, state, tree_id){
		// get output distribution
		var p = [];
		var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(state), 0.0);
		this.dist_cache = distance_xy(L, this.race_track.trees[tree_id]);
		for (var i=0;i<distance.length;i++){
			p.push(this.output_dist(distance[i], state, tree_id));
		}
		return p;

	}

	output_dist_approx(n,m,tree_id){
		var pdf = [];
		var md = this.race_track.w + this.race_track.h;
		var states = [...Array(n)].map((e,i)=>{return this.race_track.track_length*i/n});
		var distances = [...Array(n)].map((e,i)=>{return md*i/m});
    	return [...Array(n)].map((e,i)=>{return this.output_dist_array(distances, states[i], tree_id);});
	}

	output_dist_sample(tree_id){
		// sample a measurement
		var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(this.state), 0.0);
		this.dist_cache = distance_xy(L, this.race_track.trees[tree_id]);
		return this.mu_o() + randn_bm()*this.sigma_o(); 
	}




}