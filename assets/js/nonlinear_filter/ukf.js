class UnscentedKalmanFilter_1D {

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

		this.alpha = 0.001;
		this.beta = 2;
		this.kappa = 0;


	}

	calculate_C(state){
		var grad = this.finite_diff(this.output_mu, [state]);
		return grad[0];
	}

	get_likelihood(y,x){
		var joint = this.unscented_joint_probability(x, this.output_sigma(x), this.output_mu, this.output_sigma(this.posterior_mu))

		var mu = x + joint.sigma[1][0]/joint.sigma[0][0]*(y-joint.mu[1]); 


		var sigma = joint.sigma[0][0]*joint.sigma[1][1]/joint.sigma[0][1] - joint.sigma[0][0];
		return {mu:mu, sigma:sigma};
	}


	update(y){

		var joint = this.unscented_joint_probability(this.posterior_mu, this.posterior_sigma, this.output_mu, this.output_sigma(this.posterior_mu))


		var z = y - joint.mu[1];

		var S = joint.sigma[1][1];
		var K = joint.sigma[1][0]/S;

		this.posterior_mu += K*z;
		this.posterior_sigma = this.posterior_sigma - K*S*K;

	}

	predict(u){

		var joint = this.unscented_joint_probability(this.posterior_mu, this.posterior_sigma, function(x){return this.system_mu(x,u)}.bind(this), this.system_sigma(this.posterior_mu, u))
		this.posterior_mu = joint.mu[1];
		this.posterior_sigma = joint.sigma[1][1];
	}

	unscented_joint_probability(mu, sigma, model_mu, model_sigma){

		var spw = this.get_sigma_points_and_weights(this.alpha, this.kappa, this.beta, mu, sigma);
		console.log(spw)
		var sigma_points = spw.sigma_points;
		var weights_s = spw.weights_s;
		var weights_c = spw.weights_c;

		console.log(sigma_points)

		console.log(model_mu(sigma_points[0]))
		console.log(model_mu(sigma_points[1]))
		console.log(model_mu(sigma_points[2]))
		// transform sigma points
		var sigma_points_transformed = sigma_points.map((e)=>{return model_mu(e)});

		console.log(sigma_points_transformed)

		// transformed mean
		var mu_transformed = sigma_points_transformed.reduce((total, e, i)=>{return total+e*weights_s[i]})

		console.log(weights_c)

		// variance
		var auto = model_sigma + sigma_points_transformed.reduce((total, e, i)=>{console.log(i);return total+weights_c[i]*(e - mu_transformed)*(e - mu_transformed)})
		var cross = sigma_points_transformed.reduce((total, e, i)=>{return total+weights_c[i]*(e - mu_transformed)*(sigma_points[i] - mu)})

		return {mu: [mu, mu_transformed], sigma:[[sigma, cross],[cross, auto]]}
	}

	get_sigma_points_and_weights(alpha, kappa, beta, mean, sigma){
		var n = 1;
		//var lambda = alpha*alpha*(n+kappa) - n;
		var lambda = 0.1;

		console.log(lambda)
		console.log(n)
		console.log(lambda/(lambda + n))
		// calculate weights
		var weights_s = [];
		var weights_c = [];

		weights_s.push(lambda/(lambda + n));
		weights_c.push(lambda/(lambda + n)+(1-alpha*alpha+beta));

		var sp = [...Array(2*n)].map(()=>{return lambda/(2*(lambda + n));})
		weights_s.push(...sp);
		weights_c.push(...sp);

		console.log(weights_s)
		console.log(weights_c)

		// calculate sigma points
		var sp = [];
		console.log("g",(n + lambda)*sigma);
		sp.push(mean);
		sp.push(mean + Math.sqrt((n + lambda)*sigma));
		sp.push(mean - Math.sqrt((n + lambda)*sigma));
		console.log(sp)

		return {sigma_points:sp, weights_s:weights_s, weights_c:weights_c}
	}

	reset(initial_mu, initial_sigma){
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	
	}

}