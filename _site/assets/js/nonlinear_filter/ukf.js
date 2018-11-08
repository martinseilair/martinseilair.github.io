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

	dot_product(a,b){
		var r = 0;
		for (var i = 0; i < a.length; i++) r += a[i]*b[i];
		return r;
	}

	unscented_joint_probability(mu, sigma, model_mu, model_sigma){

		var spw = this.get_sigma_points_and_weights_joint(this.alpha, this.kappa, this.beta, mu, sigma);
		var sigma_points = spw.sigma_points;
		var weights_s = spw.weights_s;
		var weights_c = spw.weights_c;
		// transform sigma points
		var sigma_points_transformed = sigma_points.map((e)=>{return model_mu(e)});

		// transformed mean
		var mu_transformed = 0;

		for (var i = 0; i < sigma_points_transformed.length; i++) mu_transformed += sigma_points_transformed[i]*weights_s[i];
		//for (var i = 0; i < sigma_points_transformed.length; i++) mu_transformed += sigma_points_transformed[i]*;


		// variance

		var auto = model_sigma;
		for (var i = 0; i < sigma_points_transformed.length; i++) auto += weights_c[i]*(sigma_points_transformed[i] - mu_transformed)*(sigma_points_transformed[i] - mu_transformed);

		var cross = 0;
		for (var i = 0; i < sigma_points_transformed.length; i++) cross += weights_c[i]*(sigma_points_transformed[i] - mu_transformed)*(sigma_points[i] - mu);
		var ret = {mu: [mu, mu_transformed], sigma:[[sigma, cross],[cross, auto]]}
		return ret
	}

	get_sigma_points_and_weights_joint(alpha, kappa, beta, mean, sigma){
		var n = 1;
		//var lambda = alpha*alpha*(n+kappa) - n;
		var a = 1.2;



		// calculate weights
		var weights_s = [];
		var weights_c = [];

		weights_s.push(1-1/(a*a));
		weights_c.push(1-1/(a*a));

		var sp = [...Array(2*n)].map(()=>{return 1/(2*a*a);})
		weights_s.push(...sp);
		weights_c.push(...sp);

		// calculate sigma points
		var sp = [];
		sp.push(mean);
		sp.push(mean + a*Math.sqrt(sigma));
		sp.push(mean - a*Math.sqrt(sigma));

		return {sigma_points:sp, weights_s:weights_s, weights_c:weights_c}
	}

	get_sigma_points_and_weights(alpha, kappa, beta, mean, sigma){
		var n = 1;
		var lambda = alpha*alpha*(n+kappa) - n;
		//var lambda = 0.1;

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
		sp.push(mean);
		sp.push(mean + Math.sqrt((n + lambda)*sigma));
		sp.push(mean - Math.sqrt((n + lambda)*sigma));


		return {sigma_points:sp, weights_s:weights_s, weights_c:weights_c}
	}

	reset(initial_mu, initial_sigma){
		this.posterior_mu = initial_mu;			
		this.posterior_sigma = initial_sigma;	
	}

}