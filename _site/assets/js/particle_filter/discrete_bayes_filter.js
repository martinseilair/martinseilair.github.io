class DiscreteBayesFilter {

	constructor(system_dist, output_dist, initial_dist){
		this.system_dist = system_dist;		// u_t x_t x_t+1
		this.output_dist = output_dist;		// x_t, y_t
		this.initial_dist = initial_dist;	// x_t
		this.posterior = initial_dist;		// x_t
	}

	update(y){
		this.posterior = norm_vector(this.posterior.map((e,i)=>{return this.output_dist[i][y]*e;}));
	}

	predict(u){
		var np = [];
		var sum= 0;
		for (var xtp=0; xtp<this.posterior.length; xtp++){
			sum = 0
			for (var xt=0; xt<this.posterior.length; xt++){
				sum+=this.system_dist[u][xt][xtp]*this.posterior[xt];
			}
			np.push(sum);
		}
		this.posterior = Array.from(np)
	}


}