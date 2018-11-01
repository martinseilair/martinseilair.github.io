---
layout: post
title:  "Nonlinear filtering: Particle filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
A particle filter is a very helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding algorithm and play around with examples on the way. In order to follow the steps in this post you should bring some basic knowledge of math, probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/particle_filter.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/race_car.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/race_track.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/util.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/plot.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/scene.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/nonlinear_filter/discrete_bayes_filter.js"></script>


<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />



<link rel="stylesheet" type="text/css" href="{{ base.url | prepend: site.url }}/assets/css/nonlinear_filter/style.css">





<script type="text/javascript">


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






<script>

		// defines scenes
	n_scene = load_race_track("race_track_particle", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.filter = "particle";
	n_scene.dur=slow_dur;
	n_scene.auto_start = false;




	n_scene.t = 1;


	n_scene.loaded = function(){
		document.getElementById("race_track_particle_likelihood").style.display="block";
		this.rt.hide_strip("inner");
	}.bind(n_scene)


	n_scene.step = function(){
		this.t++;

		var ids = ["race_track_particle_timestep", "race_track_particle_likelihood", "race_track_particle_update","race_track_particle_predict","race_track_particle_resampling" ];
		for (var i=0; i<ids.length;i++){

			document.getElementById(ids[i]).style.display="none";
		}
		


		if(this.t % 5 == 0){
			this.rc.step(scene.rc.current_input);
			this.last_input = this.rc.current_input;
			document.getElementById("race_track_particle_predict").style.display="block";
		}if(this.t % 5 == 1){
	    	
			//this.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, scene.rc.state, scene.rc.current_input));

			this.pf.predict(this.last_input);
			document.getElementById("race_track_particle_likelihood").style.display="block";
		}else if(this.t % 5 == 2){
			this.rt.show_strip("inner");
			this.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state));
			document.getElementById("race_track_particle_update").style.display="block";
		}else if(this.t % 5 == 3){
			var output = this.rc.output_dist_sample(0);
	    	this.pf.update(output, 0);
	    	document.getElementById("race_track_particle_resampling").style.display="block";
		}else if(this.t % 5 == 4){
			this.rt.hide_strip("inner");
			this.pf.ancestor_sampling();
			document.getElementById("race_track_particle_timestep").style.display="block";
		}
	}.bind(n_scene);

	scenes_name["race_track_particle"] = n_scene;
	scenes.push(n_scene);
</script>

<svg id="race_track_particle" style="width:100%"  onclick="ani()"></svg>

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

<div id="race_track_particle_likelihood" class="button_set">
<div class="bt1  bt" onclick="scenes_name['race_track_particle'].step();">Show likelihood</div>
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







## Particle filter

In this section we will develop the method of particle filtering from the Bayes filter and mean field particle methods. 


We learned, that the equations of the Bayes filter are

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})\frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} dx_{t} $$

 **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} .$$

and that these formula is in general is not tractable. The particle filter is approximating the Bayes filter by approximating the current belief \\(p(x_{t+1}\|y_{0:t},u_{0:t})\\) with an empirical measure  \\(\hat{p}(x_{t+1}\|y_{0:t},u_{0:t})\\).




<div class="important_box" markdown="1">
<h1>Empirical measure</h1>
The empirical measure of \\(p(x)\\) is defined as 

$$ p_N(x) = \sum_{i=1}^{N} \delta_{x_i}(x), $$

where \\(\delta_{x_i}(x)\\) is an abbreviation of the [Dirac delta function](https://en.wikipedia.org/wiki/Dirac_delta_function) \\(\delta(x-x_i)\\) and \\(x_{1:N}\\) are \\(N\\) samples from \\(p(x)\\).
If the number of samples goes to infinity, the empirical measure will almost surely converge to the distribution \\(p(x)\\). The following figure shows the distribution \\(p(x)\\) in red and the emprical measure in black. 


<div style="text-align:center; width:100%"><div id="dirac_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_em_meas(){
	var n_sam = 50;
	var mix = [0.8,0.2];
	var gs = [[1.5,0.6],[4.0,0.6]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var gdata= [];
	var samples = sample_gmm(mix, gs, n_sam, dom);
	for (var i = 0; i < n_plot; i++) {
		var x = dom[1]*i/n_plot;	
		gdata.push({x:x, y:gmm(x, mix, gs)});
	}
	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#dirac_plot", samples, [dat], dom, 0.2, false, 0.7);
}
load_em_meas();
</script>

Please be aware that the peaks representing the samples are actually have infinitely high but it not possible to draw this. However, the area under the Dirac function is finite:

$$ \int_x \delta(x)dx = 1. $$
</div>

$$ \int p(x_{k+1}|x'_{k}){\frac {p(y_{k}|x_{k}'){\widehat {p}}(dx'_{k}|y_{0},\cdots ,y_{k-1})}{\int p(y_{k}|x''_{k}){\widehat {p}}(dx''_{k}|y_{0},\cdots ,y_{k-1})}}=\sum _{i=1}^{N}{\frac {p(y_{k}|\xi _{k}^{i})}{\sum _{i=1}^{N}p(y_{k}|\xi _{k}^{j})}}p(x_{k+1}|\xi _{k}^{i})=:{\widehat {q}}(x_{k+1}|y_{0},\cdots ,y_{k}) $$

$$ \int p(x_{k+1}|x'_{k}){\frac {p(y_{k}|x_{k}'){\widehat {p}}(dx'_{k}|y_{0},\cdots ,y_{k-1})}{\int p(y_{k}|x''_{k}){\widehat {p}}(dx''_{k}|y_{0},\cdots ,y_{k-1})}}=\sum _{i=1}^{N}{\frac {p(y_{k}|\xi _{k}^{i})}{\sum _{i=1}^{N}p(y_{k}|\xi _{k}^{j})}}p(x_{k+1}|\xi _{k}^{i})=:{\widehat {q}}(x_{k+1}|y_{0},\cdots ,y_{k}) $$


Let's start with the update step and replace the belief distribution with a emprical measure \\(\hat{p}(x_t\|y_{0:t-1},u_{0:t-1}) = \frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t) \\). This empirical measure could look like this

<div style="text-align:center; width:100%"><div id="prior_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_prior_meas(){
	var n_sam = 50;
	var mix = [0.8,0.2];
	var gs = [[1.5,0.6],[4.0,0.6]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var gdata= [];
	var samples = sample_gmm(mix, gs, n_sam, dom);
	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#prior_plot", samples, [dat], dom, 0.4, false, 0.2);
}
load_prior_meas();
</script> 

The equation of the update step becomes

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1})}{\int_{x_t} p(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) dx_t} .$$

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t)}{\int_{x_t} p(y_t|x_t)\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t) dx_t} .$$


$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\delta_{\xi_t^i}(x_t)}{\frac{1}{N}\sum_{i=1}^N \int_{x_t} p(y_t|x_t)\delta_{\xi_t^i}(x_t) dx_t} .$$

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\delta_{\xi_t^i}(x_t)}{\frac{1}{N}\sum_{i=1}^N p(y_t|x_t=\xi_t^i)} .$$






In the numerator we are multiplying the emipircial measure and the likelihood pointwise, the denominator serves as a normalizer. This operation can best understood graphically



<div style="text-align:center; width:100%"><div id="prior_mal_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_prior_meas_mal(){
	var n_sam = 50;
	var mix = [0.8,0.2];
	var gs = [[1.5,0.6],[4.0,0.6]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var gdata= [];
	var samples = sample_gmm(mix, gs, n_sam, dom);
	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#prior_mal_plot", samples, [dat], dom, 0.4, false, 0.2);
}
load_prior_meas_mal();
</script> 

$$ * $$

<div style="text-align:center; width:100%"><div id="likelihood_mal_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_likelihood_meas_mal(){
	var n_sam = 50;
	var mix = [0.8,0.2];
	var gs = [[1.5,0.6],[4.0,0.6]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var gdata= [];
	var samples = [];
	for (var i = 0; i < n_plot; i++) {
		var x = dom[1]*i/n_plot;	
		gdata.push({x:x, y:gmm(x, mix, gs)});
	}
	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	
	create_dirac_plot("#likelihood_mal_plot", samples, [dat], dom, 0.4, false, 0.2);
}
load_likelihood_meas_mal();
</script> 

$$ = $$

<div style="text-align:center; width:100%"><div id="posterior_mal_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_posterior_meas_mal(){
	var n_sam = 50;
	var mix = [0.8,0.2];
	var gs = [[1.5,0.6],[4.0,0.6]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var gdata= [];
	var samples = [];
	var samples = sample_gmm(mix, gs, n_sam, dom);

	var sw = samples.map((e)=>{return {x:e, w:gmm(e, mix, gs)};})

	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#posterior_mal_plot", sw, [dat], dom, 0.2, false, 0.2);
}
load_posterior_meas_mal();
</script> 


As a result we have a weighted empirical measure. This leads us to the resampling step. This can be interpreted as creating sampling from our empirical measure to obtain a empirical measure of it. 
Great! Now we have performed the update step.


Let's look at the predict step and replace the posterior with our empirical measure from the update step:

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})\hat{p}(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$


$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t) dx_{t} $$



$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{N}\sum_{i=1}^N\int_{x_{t}} p(x_{t+1}|x_{t}, u_{t}) \delta_{\xi_t^i}(x_t) dx_{t} $$

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{N}\sum_{i=1}^N p(x_{t+1}|x_{t} = \xi_t^i, u_{t}). $$


This is a weighted sum of continuous distributions. 


<div style="text-align:center; width:100%"><div id="pred_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_pred_meas(){
	var n_sam = 50;
	var mix = [0.2, 0.2, 0.2, 0.2];
	var gs = [[1.5,0.6], [4.0,0.3], [2.5,0.3], [3.0,0.4]];
	var dom = [0.0, 5.0];
	var n_plot = 1000;
	var samples = [];
	var datdat = [];

	var sum_data = [...Array(n_plot)].map((e,i)=>{return {x:dom[1]*i/n_plot,y:0}});

	for (var j = 0; j < mix.length; j++) {
		var dat = [];
		var gdata= [];
		dat.color = "red";
		for (var i = 0; i < n_plot; i++) {
			var x = dom[1]*i/n_plot;	
			var v = mix[j]*gaussian(x,gs[j][0],gs[j][1] );
			gdata.push({x:x, y:v});
			sum_data[i].y+=v;
		}
		dat.gdata = gdata;
		datdat.push(dat);
	}

	var dat = [];
	dat.color="blue";
	dat.gdata=sum_data;
	datdat.push(dat);



	create_dirac_plot("#pred_plot", samples, datdat, dom, 0.2, false, 0.7);
}
load_pred_meas();
</script>


If we hear the continuous, our alarm bells should ring. To avoid this we estimate this distribution by an empirical distribution again. How can we sample from it? First we sample from our posterior distribution. Based on this sample we can sample from the forward distribution to obtain a sample of a new state. These samples samples will be distributed like the posterior.

Well, thats essentially it. 

But one thing seems a little bit weird, we are sampling from the weighted emprical measure to obtain an emprical measure, from which we are sampling again. We can get rid of the step in the middle! We directly sample from the weighted emprical distribution to use it for calculation of the next posterior.
Now we arrived at the algorithm of the particle filter.








<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>


<div id="rad_to_s" style="width:100px"></div>
<div id="div1"></div>
<div id="div2"></div>
<!-- <div id="system_dist_approx"  style="width: 600px; height: 600px;"></div> -->
<!--<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>-->









