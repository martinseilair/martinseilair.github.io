class ExtendedKalmanFilter_1D {

	constructor(system_mu, output_mu,system_sigma, output_sigma, initial_mu, initial_sigma){
		this.system_mu = system_mu;			
		this.output_mu = output_mu;			
		this.system_sigma = system_sigma;			
		this.output_sigma = output_sigma;	
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	
	}

	finite_diff(func, value){
		var grad = [...Array(func.length)].map(()=> 0);
		var eps = 0.000001;
		var vm, vc, vp, vt;
		for(var i=0;i<func.length;i++){
			vt = value.slice(0);
			vt[i] -=eps;
			vm = func(...vt);
			vt[i] +=2*eps;
			vp = func(...vt);
			grad[i] = (vp - vm)/(2*eps);
		}
		return grad;
	}

	update(y){

		var grad = this.finite_diff(this.output_mu, [this.posterior_mu]);
		var mean = this.output_mu(this.posterior_mu);

		var z = y - mean;
		var S = this.output_sigma(this.posterior_mu) + grad[0]*this.posterior_sigma*grad[0];
		var K = this.posterior_sigma*grad[0]/S;
		this.posterior_mu += K*z;
		this.posterior_sigma = (1-K*grad[0])*this.posterior_sigma;

	}

	predict(u){

		var grad = this.finite_diff(this.system_mu, [this.posterior_mu,u]);
		this.posterior_sigma = grad[0]*this.system_sigma(this.posterior_mu,u)*grad[0];
		this.posterior_mu = this.system_mu(this.posterior_mu,u);

	}

	reset(initial_mu, initial_sigma){
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	
	}

}