class ParticleFilter {

	constructor(N, system_dist, system_dist_sample, observe_dist, initial_dist_sample, draw_particles){
		this.particles = [];
		this.N = N;
		this.system_dist = system_dist;
		this.system_dist_sample = system_dist_sample;
		this.observe_dist = observe_dist;
		this.initial_dist_sample = initial_dist_sample;
		this.draw_particles = draw_particles;

	}

	init_samples(){
		this.points = [];
		for (var i=0; i<this.N; i++){
			this.particles.push({x: this.initial_dist_sample(), w:1.0/this.N})	
		}

		this.draw_particles(this.particles);
	}


	normalize_weights(){
		var sum = 0;
	    for (var i = 0; i < this.particles.length; i++) {
	    	sum+=this.particles[i].w;
	    }
	    for (var i = 0; i < this.particles.length; i++) {
	    	this.particles[i].w/=sum;
	    }

	}

	ancestor_sampling() {
		var particles_new = [];
		var rans = [];
		for (var i=0; i<this.N; i++){
			rans.push(Math.random());
		}
		rans.sort();

	    var s = 0;

	    for (var i = 0; i < this.particles.length; i++) {
	        s += this.particles[i].w;

        	while(rans[0] < s){
        		particles_new.push({x: this.particles[i].x, w:1.0/this.N})
        		rans.shift();
        	}
	    }
	    this.particles = particles_new;
	    this.draw_particles(this.particles);
	}


	update(y, output_index){

		for (var i = 0; i < this.particles.length; i++) {
				this.particles[i].w = this.observe_dist[output_index](y, this.particles[i].x);
        }
        this.normalize_weights();
        this.draw_particles(this.particles);

	}

	predict(u){
		for (var i = 0; i < this.particles.length; i++) {
				this.particles[i].x = this.system_dist_sample(this.particles[i].x, u);
        }
        this.draw_particles(this.particles);
	}

}