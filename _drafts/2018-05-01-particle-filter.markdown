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

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/discrete_bayes_filter.js"></script>


<script type="text/javascript">

// mit keys oder button steuerbar
// strips ein und ausblendbar
// weights ein und ausblendbar
// update resample predict manuell oder langsam automatisch (weiter button)
// update resample predict button (hier macht input keinen sinn, außer man hat 3 button für predict)
// mit maus car position festlegen (geringster abstand)


// herangehensweise

// 1. auto fährt 
// 2. Vorstellung der system und beobachtungsfunktion (plot)
// 3. mit maus car position festlegen, entsprechende verteilung innen und außen anzeigen
// 3a. Bayes filter approximierung außen posterior innen beobachtung (update prediction weiter)
// 4. standbild: particle anzeigen
// 5. standbild: update step (5 sek vorher 5 sek nachher) (prob strip innen anzeigen)
// 6. standbild: resampling (5 sek vorher 5 sek nachher)
// 7. standbild: predict (5 sek vorher 5 sek nachher)
// 8. update resample predict manuell (weiter button)
// 9. update resample predict automatisch (geschwindigkeit einstellbar) (steuerung über pfeiltasten)
// 10. zwei trees

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

	var strip_n = 1000;


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



		var use_particle_filter = false;
		var ani_step;

	race_track.set_strip_domain(strip_n);
	strip_pos = race_track.strip_pos;





	if(use_particle_filter){
		function observe_dist(distance, state){
			return rc.output_dist_single(distance, state, 0);
		}
		pf = new ParticleFilter(N, rc.system_dist_single.bind(rc), rc.system_dist_sample.bind(rc), [observe_dist], rc.initial_dist_sample.bind(rc), race_track.draw_points.bind(race_track));
		ani_step = 3;
	}else{



		state_n = strip_n;
		output_n = strip_n;

		console.log(strip_n)

		// define domains

		bf_x_map = strip_pos;

		bf_u_map = [0, 1, 2];

		max_dist = race_track.w;
		bf_y_map = [...Array(output_n)].map((e,i)=>{return max_dist*i/output_n;});


		// discretize pdf

		//bf_initial_dist = norm_vector([...Array(state_n)].map((e,i)=>{return (i>500 && i<550)?1.0:0.0;}));

		bf_initial_dist = norm_vector([...Array(state_n)].map((e,i)=>{return 1.0;}));

		

		bf_system_dist = bf_u_map.map((u)=>{
			return bf_x_map.map((x)=>{
				return norm_vector(rc.system_dist_array(bf_x_map,x,u));
			});
		});

		bf_output_dist = bf_x_map.map((x)=>{
				return norm_vector(rc.output_dist_array(bf_y_map,x,0));
		});

		function cont_2_disc_output(output){
			output = Math.abs(output);

			return Math.floor(output_n*output/max_dist);
		}

		
		bf = new DiscreteBayesFilter(bf_system_dist, bf_output_dist, bf_initial_dist);
		ani_step = 3;
	}


	var aa = 0;

	var dur = 1000;





function get_system_dist_normalized(pos, input) {
	var dist = rc.system_dist_array(strip_pos, pos, input);
	dist = dist.map((e)=>{return Math.pow(e,0.1);})
	return normalize_vector(dist);
}

function get_output_dist_normalized(pos){
	var L = this.race_track.race_track_pos_abs(this.race_track.get_rad(pos), 0.0);
	distance = distance_xy(L, this.race_track.trees[0]);
	var out_dist = strip_pos.map((e)=>{return rc.output_dist_single(distance, e, 0);})
	return normalize_vector(out_dist);
}

function mouse_move(){

	var coords = d3.mouse(this);


	var min_dist = 50.0;
	var nearest = race_track.get_nearest_pos(coords);
	if(nearest.distance < min_dist){
		race_track.show_strip("inner");
		race_track.show_strip("outer");
		race_track.update_car(nearest.pos,dur, 0);
		race_track.update_strip("outer", get_system_dist_normalized(nearest.pos, 2));
		race_track.update_strip("inner", get_output_dist_normalized(nearest.pos));
	}else{
		race_track.hide_strip("inner");
		race_track.hide_strip("outer");
	}

}


function finished_loading(){

	// SITE LOADED!


		//plot_pdf("output_dist_approx", bf_output_dist);
		//plot_pdf("system_dist_approx", bf_system_dist[2]);

	race_track.set_mouse_move(mouse_move)
	// init track and car
	var svg = document.getElementById("race_track");
	svg_bg = "#fff5eb";
	svg.style.backgroundColor = svg_bg;

	race_track.draw_race_track(svg);

	rc.reset();


	// initialize strips


	

	outer_color = d3.interpolateRgb(d3.rgb(svg_bg), d3.rgb('#00028e'))
	inner_color = d3.interpolateOranges;

	if(use_particle_filter){
		// particle
		pf.init_samples();	
		race_track.init_strip("outer", get_system_dist_normalized(rc.state), outer_color, 60);
		race_track.init_strip("inner", get_output_dist_normalized(rc.state), inner_color, 60);
	}else{
		// bayes


		race_track.init_strip("outer", normalize_vector(bf.posterior), outer_color, 60);
		race_track.init_strip("inner", get_output_dist_normalized(rc.state), inner_color, 60);




		
	}




}
// animation

function ani(){

	var inter = setInterval(function() {

	if (aa % ani_step == 0){
		input=2;

	    rc.step(input);

	    if(use_particle_filter){
	    	pf.predict(input);
			race_track.update_strip("outer", get_system_dist_normalized(rc.state));
			race_track.update_strip("inner", get_output_dist_normalized(rc.state));
		}else{
			//bayes

			bf.predict(input);
			race_track.hide_strip("inner");
			race_track.update_strip("outer", normalize_vector(bf.posterior));
			

		}



	}else if (aa % ani_step == 1){
		output = rc.output_dist_sample(0);
		if(use_particle_filter){
	    	pf.update(output, 0);
		}else{
			//bayes
			race_track.show_strip("inner");
			race_track.update_strip("inner", get_output_dist_normalized(rc.state));

		}
	}else{
		if(use_particle_filter){
	    	pf.ancestor_sampling();
	    }else{
			//bayes
	    	y = cont_2_disc_output(output);
			bf.update(y);

			race_track.update_strip("outer", normalize_vector(bf.posterior));
	    }
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
