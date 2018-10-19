---
layout: post
title:  "Particle filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
Particle filter are an extremly helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding equations and look at an interactive example on the way. In order to follow the steps in this post you should bring some basic knowledge of math and probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/particle_filter.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/race_car.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/race_track.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/util.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/plot.js"></script>


<script type="text/javascript">


	// SITE NOT LOADED!!!

	// add loaded listener
	window.addEventListener("load", function(event) {
		finished_loading();
	});

	function race_track_radius(rad){
		function deviation(x){
			return 10.0*Math.cos(8*x) + 290*gaussian(x,Math.PI-0.4,0.5) - 30*gaussian(x,Math.PI-0.0,0.2) + 330*gaussian(x,Math.PI+0.3,0.4);
		}
		return r = this.base_radius + deviation(rad);
	}


	// define race track
	var w = 800;
	var h = 500;
	var base_radius = 180;
	var base_x = w - base_radius - 80;
	var base_y = 250;

	race_track = new RadialRaceTrack(w, h, base_x, base_y, base_radius, race_track_radius);
	race_track.add_tree(base_x, base_y);

	// define race car
	rc = new RaceCar(race_track,"{{ base.url | prepend: site.url }}");

	// define particle filter 

	var N = 100; //no. of particles

	function observe_dist(distance, state){
		return rc.output_dist_single(distance, state, 0);
	}
	pf = new ParticleFilter(N, rc.system_dist_single.bind(rc), rc.system_dist_sample.bind(rc), [observe_dist], rc.initial_dist_sample.bind(rc), race_track.draw_points.bind(race_track));


	var aa = 0;
	var dur = 500;


	// initialize prob_strip
	var prob_strip_n = 1000;

	var prob_strip_pos = [...Array(prob_strip_n)].map((e,i)=>{return race_track.track_length*i/(prob_strip_n-1)});
	var prob_strip_data;
	var prob_strip_color = d3.interpolateOranges;

function finished_loading(){

	// SITE LOADED!

	// init track and car
	var svg = document.getElementById("race_track");

	race_track.draw_race_track(svg);
	pf.init_samples();
	rc.reset();


	// initialize prob_strip
	//var path = d3.select("#probability_strip").remove();
	var sam = prob_strip_pos.map((e,i)=>{return race_track.race_track_pos_abs(race_track.get_rad(e),0.0)});
	//var sam = prob_strip_pos.map((e,i)=>{console.log(race_track.get_rad(e));return race_track.get_rad(e)});

	sam.push(sam[1])



	prob_strip_data = quads(sam)
	var dist = rc.system_dist_array(prob_strip_pos, rc.state, 1.0);

	dist = dist.map((e)=>{return Math.pow(e,0.1);})

	dist = normalize_vector(dist);


d3.select("#prob_strip_group").selectAll("path")
    .data(prob_strip_data)
  .enter().append("path")
	.style("fill", function(d, i) { return prob_strip_color(dist[i])})
	.style("stroke", function(d, i) { 	return prob_strip_color(dist[i]) })
    .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 50); });
    


	var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(rc.state), 0.0);
	distance = rc.distance(L, this.race_track.trees[0]);
	
	//var out_dist = prob_strip_pos.map((e)=>{return rc.output_dist(distance, e, 0);})
	var out_dist = prob_strip_pos.map((e)=>{return rc.output_dist_single(distance, e, 0);})

	out_dist = normalize_vector(out_dist);


d3.select("#ob_strip_group").selectAll("path")
    .data(prob_strip_data)
  .enter().append("path")
	.style("fill", function(d, i) { return prob_strip_color(out_dist[i])})
	.style("stroke", function(d, i) { 	return prob_strip_color(out_dist[i]) })
    .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 50); });
    

    //plot_curvature(this);
	//plot_pdf("system_dist_approx", transpose(rc.system_dist_approx(1000, 1.0)));
	//plot_pdf("output_dist_approx", transpose(rc.output_dist_approx(1000,1000, 0)));








	
}

// animation

function ani(){

	var inter = setInterval(function() {

	if (aa % 3 == 0){
		output = rc.output_dist_sample(0);
	    pf.update(output, 0);
	}else if (aa % 3 == 1){
	    pf.ancestor_sampling();
	}else{
		input=1.0;

		var dist = rc.system_dist_array(prob_strip_pos, rc.state, input);

		dist = dist.map((e)=>{return Math.pow(e,0.1);})

		dist = normalize_vector(dist);
		d3.select("#prob_strip_group").selectAll("path")
		    .data(prob_strip_data)
		    .style("fill", function(d, i) { return prob_strip_color(dist[i]); })
		    .style("stroke", function(d, i) { return prob_strip_color(dist[i]); })

	    rc.step(input);
	    pf.predict(input);

	    // update prob_strip
	


	var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(rc.state), 0.0);
	distance = rc.distance(L, this.race_track.trees[0]);
	
	//var out_dist = prob_strip_pos.map((e)=>{return rc.output_dist(distance, e, 0);})
	var out_dist = prob_strip_pos.map((e)=>{return rc.output_dist_single(distance, e, 0);})
	out_dist = normalize_vector(out_dist);


d3.select("#ob_strip_group").selectAll("path")
    .data(prob_strip_data)
	.style("fill", function(d, i) { return prob_strip_color(out_dist[i])})
	.style("stroke", function(d, i) { 	return prob_strip_color(out_dist[i]) })
    



	}

	aa++;
        }, dur);

}
	

</script>



<div id="rad_to_s" style="width:100px"></div>
<div id="div1"></div>
<div id="div2"></div>



From the statistical and probabilistic point of view, particle filters can be interpreted as mean field particle interpretations of Feynman-Kac probability measures.

To design a particle filter we simply need to assume that we can sample the transitions \\(X_{k-1}\to X_{k} \\) of the Markov chain \\(X_{k}\\) , and to compute the likelihood function \\(x_{k}\mapsto p(y_{k}\|x_{k})\\) 


1. Sample \\(N\\) samples from \\(p(x_0)\\)

2. Selection-updating transition

$$ \sum _{i=1}^{N}{\frac {p(y_{k}|\xi _{k}^{i})}{\sum _{j=1}^{N}p(y_{k}|\xi _{k}^{j})}}\delta _{\xi _{k}^{i}}(dx_{k}) $$

3. mutation-prediction transition

$$ {\widehat {\xi }} _ {k}^{i}\longrightarrow \xi _ {k+1}^{i}\sim p(x _ {k+1}\|{\widehat {\xi }} _ {k}^{i}) ,\qquad i=1,\cdots ,N. $$


1. Initialize the distribution. The initial distribution can be anything. In this demo, a uniform distribution over a predefined range is used.
2. Observe the system and find a (proportional) probability for each particle that the particle is an accurate representation of the system based on that observation. We refer to this value as a particle's importance weight. In this demo, the selected function calculates the particle weight directly from
3. Normalize the particle weights.
4. Resample the distribution to get a new distribution. A particle is selected at a frequency proportional to its importance weight.
5. Add noise to the filter. Because a particle may be resampled multiple times, we need to move some of the particles slightly make the distribution cover the space better. Add small random values to each parameter of each filter.
6. If you have a prediction on how the system changes between time steps, you can update each particle in the filter according to the prediction.
7. Repeat from step 2.





Fall 1 ich kann von \\(X_{k-1}\to X_{k} \\) samplen
Fall 2 ich kann es nicht


# Bayes filter

# Monte Carlo

# Genetic Algorithms

# Particle filter SMC

# Example

The current state \\(x_t)\\) is defined as the current distance from the starting point. To obtain the position of the car in \\((x,y)\\) coordinates you have the mapping 

$$     L(x_t) =  \begin{pmatrix}
    L_x(x_t) \\
    L_y(x_t) \\
    \end{pmatrix} $$

To infer the position of the car, we will measure the distance to tree. The position of the tree is defined as \\(T = (T_x, T_y)\\)


$$ p(y_t|x_t) = \mathcal{N}(y_t| \mu_o(x_t), \sigma_o^2(x_t)) $$

with 


$$ \mu_o(x_t) = d(L(x_t),T) = \sqrt{(L_x(x_t)-T_x)^2 + (L_y(x_t)-T_y)^2} $$

$$  \sigma_o(x_t) = ad(L(x_t),T) $$



$$ p(x_{t+1}|x_t,u_t) = \mathcal{N}(x_{t+1}|\mu_s(x_t, u_t) ,\sigma_s^2(x_t) ) $$

$$ \kappa(x_t) ={\frac {|L_x'(x_t)L_y''(x_t)-L_y'(x_t)L_x''(x_t)|}{\left(L_x'^2(x_t)+L_y'^2(x_t)\right)^{\frac {3}{2}}}} $$


$$ \mu_s(x_t, u_t) = x_t + b(\kappa)u_t $$

$$ b(\kappa) = \max\{l, 1 - c\kappa\} $$

$$  \sigma_s(x_t, u_t) = db(\kappa)u_t $$ 



<div id="system_dist_approx"  style="width: 600px; height: 600px;"></div>
<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>

<svg id="race_track" style="background-color:#fff5eb;width:100%"  onclick="ani()"></svg>




<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>

<script type="text/javascript">




        
    </script>
