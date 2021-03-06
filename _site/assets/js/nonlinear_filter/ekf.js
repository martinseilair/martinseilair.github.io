class ExtendedKalmanFilter_1D {

	constructor(system_mu, system_sigma, output_mu, output_sigma, initial_mu, initial_sigma){
		this.system_mu = system_mu;			
		this.output_mu = output_mu;			
		this.system_sigma = system_sigma;			
		this.output_sigma = output_sigma;	
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	

		this.A = 0;
		this.B = 0;
		this.C = 0;


	}

	finite_diff(func, value){
		var grad = [...Array(func.length)].map(()=> 0);
		var eps = 0.001;
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

	calculate_C(state){
		var grad = this.finite_diff(this.output_mu, [state]);
		return grad[0];
	}

	get_likelihood(y,x){
		var C = this.calculate_C(x);

		var mu = x + (y - this.output_mu(x))/C; 

		var sigma = this.output_sigma(x)/(C*C)
		return {mu:mu, sigma:sigma};
	}


	update(y){

		var grad = this.finite_diff(this.output_mu, [this.posterior_mu]);
		var h = this.output_mu(this.posterior_mu);

		this.C = grad[0];

		var z = y - h;

		var S = this.output_sigma(this.posterior_mu) + this.C*this.posterior_sigma*this.C;
		var K = this.posterior_sigma*this.C/S;
		this.posterior_mu += K*z;
		this.posterior_sigma = (1-K*this.C)*this.posterior_sigma;

	}

	predict(u){

		var grad = this.finite_diff(this.system_mu, [this.posterior_mu,u]);

		this.A = grad[0];
		this.B = grad[1];


		this.posterior_sigma = this.system_sigma(this.posterior_mu,u) + this.A*this.posterior_sigma*this.A;
		this.posterior_mu = this.system_mu(this.posterior_mu,u);


	}

	reset(initial_mu, initial_sigma){
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	
	}

}