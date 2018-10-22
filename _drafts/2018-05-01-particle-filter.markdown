---
layout: post
title:  "Particle filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
A particle filter is a very helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding algorithm and play around with examples on the way. In order to follow the steps in this post you should bring some basic knowledge of math, probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/particle_filter.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/race_car.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/race_track.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/util.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/plot.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/scene.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/discrete_bayes_filter.js"></script>


<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />


<style type="text/css">


.bt{
  background: #f0f0f0;
  color: #666666;
  min-height: 35px;
  margin: 0;
  border-radius: 6px;
  border: 0;
  line-height: 35px;
  text-align: center;
  display:inline-block;
  width:100%;
  padding: 0;
  cursor: default;
  height:45px;
  line-height:45px;
  font-size:120%;
  text-transform: uppercase;
  font-weight:500;
  font-family: 'Roboto', sans-serif;
  transition: 1.0s;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}


.bt:hover{
	  background: #e9e9e9;
  color: #444444;
} 

.bt3{
  width:32%;
}

.bt1{
  width:100%;
}



.button_set {
  /*border: 2px dashed #444;*/
  text-align: justify;
  -ms-text-justify: distribute-all-lines;
  text-justify: distribute-all-lines;
  /* just for demo */
  width: 100%;
  margin-bottom:-10px;
  margin-top:10px;
  cursor: default;
  display:none;
}



.stretch {
  width: 100%;
  display: inline-block;
  font-size: 0;
  line-height: 0
  height:0px;

}
</style>





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

	// input modes
	// 0: Automatisch langsam; sequential
	// 1: Set input per  A = backward, S = no movement, D = forward; one step
	// 2: Set input per  A = backward, S = no movement, D = forward; sequential
	// 3: Mouse exploring
	// 4: No input

	// scene_flags

	scene = [];
	scenes = [];
	scenes_name = [];
	interval = null;
	loaded = false;
	var aa = 1;
	var fast_dur = 300;
	var slow_dur = 1000;
	var ani_step = 3;


	touch_id = null;





</script>

<div class="important_box"  markdown="1">
The **particle filter** is a sample-based approximation of the Bayes filter. It is used to **infer** the current state of an arbitrary probabilistic state space model given all observations and inputs up to the current timestep and a prior distribution of the initial state. 
</div>



## Race track

In this section we will introduce our running example. The dynamic model is a car, that is driving on a race track. It has the discrete actions of moving forward, backward and standing still. The tree inside the race track serve as a natural landmark. We have a distance measurement device on board, which will give us a noisy observation of the trees distance to the car. After the introduction of the concepts of the Bayes filter, we will formulate the model of the car and of measurement device in a rigourous way.

<svg id="race_track_intro" style="width:100%"  onclick="ani()"></svg>

<script>
	// defines scenes
	n_scene = load_race_track("race_track_intro","{{ base.url | prepend: site.url }}");
	n_scene.mode = 0;
	n_scene.filter = null;
	n_scene.dur=fast_dur;
	n_scene.auto_start = true;

	n_scene.step= function(){
		this.rc.step(this.rc.current_input);
	}.bind(n_scene);

	scenes.push(n_scene);
</script>


## Bayes filter


[Derivation of the Kalman filter]({% post_url 2018-10-10-kalman_filter %})


Now that we have a better understanding what Bayes filtering is. To demonstrate the process of Bayes filtering, let's go back to our example and try to visualize it. First of all and most importantly, the process of Bayes filtering requires to solve integrals, that are in general intractable. Otherwise we we wouldn't need approximations such as the particle filter. For the purpose of visualization we can discretize the probability distribution of model and output to compute the integrals numerically. This grid-based method is called Markov localization in the context of localization. Like all grid-based methods is in volatile to the curse of dimensionality.

But now focus again on our example. Let us first define the distribution of the model and obsrvations. In our case, we are lucky, because we know exactly the governing models of the simulation. In a real-life scenario, you would have to find a model. Either by empirical data or by engineering methods.

# System dynamic

The state \\(x_t\\) of the system consists only of the current position on the race track. In a more realistic setting you would also include the velocity of the car. We avoid this to simplify our example and for the sake of visualisation. 


To obtain the position of the car in \\((x,y)\\) coordinates you have the mapping 

$$     L(x_t) =  \begin{pmatrix}
    L_x(x_t) \\
    L_y(x_t) \\
    \end{pmatrix} $$



For the sake of simplicity our system dynamics are defined by a Gaussian distribution 

$$ p(x_{t+1}|x_t,u_t) = \mathcal{N}(x_{t+1}|\mu_s(x_t, u_t) ,\sigma_s^2(x_t) ) $$

with non-linear mean  \\(\mu_s(x_t, u_t)\\) and variance \\(\sigma_s^2(x_t)\\). To obtain the mean of the next state \\(x_{t+1}\\) the input \\(u_t\\), which is weighted by \\(b(\kappa)\\) is simply added to the current state \\(x_t\\):


$$ \mu_s(x_t, u_t) = x_t + b(\kappa)u_t $$

The weighting factor 

$$ b(\kappa) = e^{- c\kappa}, $$

 with hand-tweaked parameter \\(c\\) is used to model a more realistic driving behaviour that depends on the curvature of the track

$$ \kappa(x_t) ={\frac {|L_x'(x_t)L_y''(x_t)-L_y'(x_t)L_x''(x_t)|}{\left(L_x'^2(x_t)+L_y'^2(x_t)\right)^{\frac {3}{2}}}}. $$

at position \\(x_t\\). 

If the curvature is low, we drive faster. If the curvature is high, we drive faster.

The variance 

$$  \sigma_s(x_t, u_t) = db(\kappa)\left|u_t\right| $$ 

depends similarly on the input \\(u_t\\) and weighting factor \\(b(\kappa)\\) with hand-tweaked parameter \\(d\\).




<svg id="race_track_sys_dist" style="width:100%"  onclick="ani()"></svg>

<script>


	// defines scenes
	n_scene = load_race_track("race_track_sys_dist", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 3;
	n_scene.me_show_system = true;
	n_scene.me_show_observation_transposed = false;
	n_scene.me_show_observation = false;
	n_scene.filter = null;
	n_scene.dur=slow_dur;
	n_scene.auto_start = false;
	
	scenes.push(n_scene);
</script>









# Observation model

To infer the position of the car, we will measure the distance to tree. The position of the tree is defined as \\(T = (T_x, T_y)\\). Again we model the uncertainty of the measurement with a Gaussian distribution


$$ p(y_t|x_t) = \mathcal{N}(y_t| \mu_o(x_t), \sigma_o^2(x_t)). $$

The mean 

$$ \mu_o(x_t) = d(L(x_t),T) = \sqrt{(L_x(x_t)-T_x)^2 + (L_y(x_t)-T_y)^2} $$ 

is defined as the exact distance to the tree. 

The variance 

$$  \sigma_o(x_t) = ad(L(x_t),T) $$

changes corresponding to the distance. The farer we are away from the tree, the more noise will be present in the signal.

# Discrete Bayes filter

Now that we know our model a bit better, let's look at the Bayes filter again.


<svg id="race_track_obs_dist" style="width:100%"  onclick="ani()"></svg>





<script>

	// defines scenes
	n_scene = load_race_track("race_track_obs_dist", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 3;
	n_scene.me_show_system = false;
	n_scene.me_show_observation_transposed = true;
	n_scene.me_show_observation = true;
	n_scene.filter = null;
	n_scene.dur=slow_dur;
	n_scene.auto_start = false;
	// define particle filter 


	scenes.push(n_scene);
</script>



<svg id="race_track_mar_loc" style="width:100%"  onclick="ani()"></svg>

<script>


	n_scene = load_race_track("race_track_mar_loc","{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.filter = "bayes";
	n_scene.dur=slow_dur;
	// define particle filter 

	n_scene.auto_start = false;

	n_scene.t = 2;


	n_scene.loaded = function(){
		//var ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];
		//for (var i=0; i<ids.length;i++){

		//	document.getElementById(ids[i]).style.display="none";
		//}
		document.getElementById("race_track_mar_loc_update").style.display="block";
	}.bind(n_scene)


	n_scene.step = function(){
		this.t++;
	var ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];
		for (var i=0; i<ids.length;i++){

			document.getElementById(ids[i]).style.display="none";
		}
		//document.getElementById(ids[this.t%3]).style.display="block";


		if(this.t % 4 == 0){
			this.rc.step(this.rc.current_input);
			document.getElementById("race_track_mar_loc_predict").style.display="block";
		}else if(this.t % 4 == 1){
			this.bf.predict(this.rc.current_input);
			this.rt.hide_strip("inner");
			this.rt.update_strip("outer", normalize_vector(this.bf.posterior));
			document.getElementById("race_track_mar_loc_likelihood").style.display="block";
		}else if(this.t % 4 == 2){
			this.rt.show_strip("inner");
			this.rt.update_strip("inner", get_output_dist_normalized(this.rc, this.rt, this.rc.state));
			document.getElementById("race_track_mar_loc_update").style.display="block";
		}else if(this.t % 4 == 3){
			var output = scene.rc.output_dist_sample(0);
	    	var y = scene.bf.cont_2_disc_output(output);
			this.bf.update(y);
			this.rt.update_strip("outer", normalize_vector(this.bf.posterior));
			document.getElementById("race_track_mar_loc_timestep").style.display="block";
		}



	}.bind(n_scene);





	scenes_name["race_track_mar_loc"] = n_scene;
	scenes.push(n_scene);

</script>



<div id="race_track_mar_loc_timestep" class="button_set">
<div class="bt3 bt" onclick="scenes_name['race_track_mar_loc'].rc.current_input=0;scenes_name['race_track_mar_loc'].step();">Backward</div>
<div class="bt3 bt" onclick="scenes_name['race_track_mar_loc'].rc.current_input=1;scenes_name['race_track_mar_loc'].step();">No action</div>
<div class="bt3 bt" onclick="scenes_name['race_track_mar_loc'].rc.current_input=2;scenes_name['race_track_mar_loc'].step();">Forward</div>
 <span class="stretch"></span>
</div>

<div id="race_track_mar_loc_predict" class="button_set">
<div class="bt1  bt" onclick="scenes_name['race_track_mar_loc'].step();">Predict step</div>
  <span class="stretch"></span>
</div>



<div id="race_track_mar_loc_likelihood" class="button_set">
<div class="bt1  bt" onclick="scenes_name['race_track_mar_loc'].step();">Show likelihood</div>
  <span class="stretch"></span>
</div>

<div id="race_track_mar_loc_update" class="button_set" onclick="scenes_name['race_track_mar_loc'].step();">
<div class="bt1  bt">Update step</div>
  <span class="stretch"></span>
</div>



## Particle filter

## Example





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

$$ p(x) = \sum_{j=1}^J w^{[j]}\delta_{x_[j]}(x) $$

$$ \mathcal(X) = \left\{  \left(  x^{[j]},w^{[j]}  \right) \right\} $$

Fall 1 ich kann von \\(X_{k-1}\to X_{k} \\) samplen
Fall 2 ich kann es nicht
















<svg id="race_track_particle" style="width:100%"  onclick="ani()"></svg>


<script>

		// defines scenes
	n_scene = load_race_track("race_track_particle", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.filter = "particle";
	n_scene.dur=slow_dur;
	n_scene.auto_start = false;




	n_scene.t = 1;


	n_scene.loaded = function(){
		document.getElementById("race_track_particle_update").style.display="block";
	}.bind(n_scene)


	n_scene.step = function(){
		this.t++;

		var ids = ["race_track_particle_timestep", "race_track_particle_update","race_track_particle_predict","race_track_particle_resampling" ];
		for (var i=0; i<ids.length;i++){

			document.getElementById(ids[i]).style.display="none";
		}
		


		if(this.t % 4 == 0){
			this.rc.step(scene.rc.current_input);
			document.getElementById("race_track_particle_predict").style.display="block";
		}if(this.t % 4 == 1){
	    	
			//this.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, scene.rc.state, scene.rc.current_input));
			this.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state));
			this.pf.predict(scene.rc.current_input);
			document.getElementById("race_track_particle_update").style.display="block";
		}else if(this.t % 4 == 2){
			var output = this.rc.output_dist_sample(0);
	    	this.pf.update(output, 0);
	    	document.getElementById("race_track_particle_resampling").style.display="block";
		}else if(this.t % 4 == 3){
			this.pf.ancestor_sampling();
			document.getElementById("race_track_particle_timestep").style.display="block";
		}
	}.bind(n_scene);

	scenes_name["race_track_particle"] = n_scene;
	scenes.push(n_scene);
</script>



<div id="race_track_particle_timestep" class="button_set">
<div class="bt3 bt" onclick="scenes_name['race_track_particle'].rc.current_input=0;scenes_name['race_track_particle'].step();">Backward</div>
<div class="bt3 bt" onclick="scenes_name['race_track_particle'].rc.current_input=1;scenes_name['race_track_particle'].step();">No action</div>
<div class="bt3 bt" onclick="scenes_name['race_track_particle'].rc.current_input=2;scenes_name['race_track_particle'].step();">Forward</div>
 <span class="stretch"></span>
</div>

<div id="race_track_particle_predict" class="button_set">
<div class="bt1  bt" onclick="scenes_name['race_track_particle'].step();">Predict step</div>
  <span class="stretch"></span>
</div>

<div id="race_track_particle_update" class="button_set">
<div class="bt1  bt" onclick="scenes_name['race_track_particle'].step();">Update step</div>
  <span class="stretch"></span>
</div>

<div id="race_track_particle_resampling" class="button_set" onclick="scenes_name['race_track_particle'].step();">
<div class="bt1  bt">Resampling</div>
  <span class="stretch"></span>
</div>




<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>


<div id="rad_to_s" style="width:100px"></div>
<div id="div1"></div>
<div id="div2"></div>
<!-- <div id="system_dist_approx"  style="width: 600px; height: 600px;"></div> -->
<!--<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>-->



