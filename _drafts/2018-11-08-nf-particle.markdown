---
layout: post
title:  "Nonlinear filtering: Particle filter"
date:   2018-11-08 07:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
This article, treating the derivation of the particle filter, marks the last part of the nonlinear filtering series. We will derive the particle filter algorithm directly from the equations of the Bayes filter. In the end, we will have the opportunity to play around with the particle filter with our toy example. <!--more-->If you haven't read the [introduction]({% post_url 2018-10-29-nf-intro %}), I would recommend to read it first. Before we dive into the derivation, let's try to state the main idea behind the particle filter.
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





## Derivation


In this section, we will develop the method of particle filtering directly from the Bayes filter and mean field particle methods. 


We learned that the recursive equations of the Bayes filter consist of the 
 **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{\int_{x_t}p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})\,dx_t}$$

and that the integrals, contained in these equations, are in general intractable. The main idea of the particle filter is to approximate the Bayes filter by approximating the current posterior \\(p(x_{t+1}\|y_{0:t},u_{0:t})\\) and \\(p(x_t\|y_{0:t},u_{0:t-1})\\) with [empirical measures](https://en.wikipedia.org/wiki/Empirical_measure)  \\(\hat{p}(x_{t+1}\|y_{0:t},u_{0:t})\\) and \\(\hat{p}(x_t\|y_{0:t},u_{0:t-1})\\). Let's take a brief look at empirical measures.




<div class="important_box" markdown="1">
<h1>Empirical measure</h1>
The empirical measure of \\(p(x)\\) is defined as 

$$ p_N(x) = \frac{1}{N}\sum_{i=1}^{N} \delta_{x_i}(x), $$

where \\(\delta_{x_i}(x)\\) is an abbreviation for the shifted [Dirac delta function](https://en.wikipedia.org/wiki/Dirac_delta_function) \\(\delta(x-x_i)\\) and \\(x_{1:N}\\) are \\(N\\) samples from \\(p(x)\\).
If the number of samples goes to infinity, the empirical measure will [almost surely](https://en.wikipedia.org/wiki/Almost_surely) converge to the distribution \\(p(x)\\). The following figure shows the distribution \\(p(x)\\) in red and the empirical measure \\(p_N(x)\\) in black. 


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

Please be aware that the lines, representing the Dirac delta functions, would actually be infinitely high. But in order to visualize it, we set the length of the lines to be the area under the corresponding Dirac delta function. In our case, this area will be \\(\frac{1}{N}\\). 

Up until now, we assumed that each Dirac delta function is weighted uniformly. We can also define a **weighted empirical measure** by

$$ p_N(x) =\sum_{i=1}^{N} w_i\delta_{x_i}(x), $$

with \\(\sum_{i=1}^{N}w_i = 1\\).

</div>

In the following, we will call the tuple \\((x_i, w_i)\\), corresponding to the position and weight of the \\(i\\)th Dirac delta function, a **particle**. Now that we have an idea about empirical measures, we can directly start our derivation with the update step.

# Update step

The first step is to replace the posterior distribution \\(p(x_t\|y_{0:t},u_{0:t-1})\\) with the empirical measure \\(\hat{p}(x_t\|y_{0:t-1},u_{0:t-1}) = \frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t) \\). This empirical measure could look like this:

<div style="text-align:center; width:100%"><div id="prior_plot" style="width:75%;display:inline-block;"></div></div>
<script>
var n_sam = 50;
var mix = [0.8,0.2];
var gs = [[1.5,0.6],[4.0,0.6]];
var dom = [0.0, 5.0];
var n_plot = 1000;
var gdata= [];
var samples = sample_gmm(mix, gs, n_sam, dom);
var dat = [];
function load_prior_meas(){

	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#prior_plot", samples, [dat], dom, 0.4, false, 0.2);
}
load_prior_meas();
</script> 

We plug our empirical measure into the update step and obtain

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t)}{\int_{x_t} p(y_t|x_t)\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t) dx_t} .$$

We are multiplying the empirical measure and the likelihood function pointwise in the numerator. This pointwise multiplication can be understood graphically:



<div style="text-align:center; width:100%"><div id="prior_mal_plot" style="width:75%;display:inline-block;"></div></div>
<script>
function load_prior_meas_mal(){
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
	var sw = samples.map((e)=>{return {x:e, w:gmm(e, mix, gs)};})

	var dat = [];
	dat.gdata = gdata;
	dat.color = "red";
	create_dirac_plot("#posterior_mal_plot", sw, [dat], dom, 0.2, false, 0.2);
}
load_posterior_meas_mal();
</script> 

If we look closely at the denominator, we see that we are integrating a function which is weighted by a Dirac delta function. Therefore, we can use the [sifting property](https://en.wikipedia.org/wiki/Dirac_delta_function#Translation) of the Dirac delta function to obtain

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\sum_{i=1}^N \delta_{\xi_t^i}(x_t)}{\sum_{i=1}^N p(y_t|x_t=\xi_t^i)},$$

where we canceled out the factor \\(\frac{1}{N}\\). As a result, we have a _weighted_ empirical measure

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) =\sum_{i=1}^{N} w_i\delta_{\xi_t^i}(x_t), $$

with weights 

$$ w_i = \frac{p(y_t|x_t=\xi_t^i))}{\sum_{i=1}^N p(y_t|x_t=\xi_t^i)}. $$

 This leads us directly to the important resampling step. 

# Resampling step

In the resampling step, we are replacing our weighted empirical measure with an (unweighted) empirical measure. This is equivalent to sampling from a [categorical distribution](https://en.wikipedia.org/wiki/Categorical_distribution), where our weights are defining the probability mass function. Therefore, the probability of drawing particles with high weights is higher than drawing particles with low weights. As a result, it is possible that particles with low weights are not drawn at all and particles with high weights are drawn multiple times. 
You may ask, why we are doing this weird resampling step? The main idea is quite simple:
We only have a limited number of particles, therefore, we want to discard hypotheses that have low probability. Otherwise, weights of some of the particles could get close to zero and would become useless. 

It can also be interpreted as a selection step in the context of [evolutionary algorithms](https://en.wikipedia.org/wiki/Evolutionary_algorithm). Only the _fittest_ particles are able to produce the next generation of particles.

As a result of the resampling step, we will obtain \\(N\\) particles \\((\hat{\xi} _ t^{i},\frac{1}{N})_{1:N}\\), which were drawn from

$$ \hat{\xi}_t^i \sim \hat{q}(x_t|y_{0:t},u_{0:t-1}). $$

# Prediction step
Let's look at the prediction step and replace the posterior with our empirical measure from the update step:

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})\frac{1}{N}\sum_{i=1}^N \delta_{\hat{\xi}_t^i}(x_t) dx_{t}. $$

By changing the order of the sum and integral

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{N}\sum_{i=1}^N\int_{x_{t}} p(x_{t+1}|x_{t}, u_{t}) \delta_{\hat{\xi}_t^i}(x_t) dx_{t}, $$

we note that we can use the sifting property again and finally obtain

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{N}\sum_{i=1}^N p(x_{t+1}|x_{t} = \hat{\xi}_t^i, u_{t}). $$

Therefore, the distribution \\(\hat{q}(x_{t+1}\|y_{0:t},u_{0:t})\\) is a weighted sum of _continuous_ distributions over \\(x_{t+1}\\), which is shown schematically in the following figure.



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


We note, that even if we have an empirical measure as current belief distribution, we will obtain a continuous distribution for our new belief.

Fortunately, we already know how to obtain an empirical measure of a continous distribution: We simply have to sample from it. But how can we sample from our new belief? 

First, we take a sample from our current empirical posterior distribution. Based on this sample we can sample from the system distribution to obtain a sample from the new posterior. This sampling procedure samples exactly from our new continuous posterior distribution.

Nice! We are essentially done, we expressed the update and prediction step in terms of empirical measures. 

But one thing seems a little bit weird. In order to obtain the empirical measure of the new  posterior in the prediction step, we have to sample from the current posterior, that was obtained from the resampling step. But in the resampling step, we already sampled from our posterior distribution. Therefore, we can take the particles of the current posterior directly as our samples.

Let's summarize the algorithm of the particle filter.


<div class="important_box" markdown="1">
<h1>Algorithm of the particle filter</h1>

The algorithm is **initialized** with a set of \\(N\\) particles \\((\xi_0^{i},\frac{1}{N})_{1:N}\\).

We are taking the **update step** and obtain the distribution 

$$ \hat{q}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)\frac{1}{N}\sum_{i=1}^N \delta_{\xi_t^i}(x_t)}{\frac{1}{N}\sum_{i=1}^N p(y_t|x_t=\xi_t^i)},$$

which is equivalent to the particles \\((\xi _ t^{i},\frac{p(y_t\|x_t=\xi_t^i)}{\sum_{i=1}^N p(y_t\|x_t=\xi_t^i)})_{1:N}\\).



In the **resampling step**, we are taking \\(N\\) samples 

$$ \hat{\xi}_t^i \sim \hat{q}(x_t|y_{0:t},u_{0:t-1}) $$

and obtain new particles \\((\hat{\xi} _ t^{i},\frac{1}{N})_{1:N}\\).

Finally, we are taking the **prediction step**. We obtain the distribution

$$ \hat{q}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{N}\sum_{i=1}^N p(x_{t+1}|x_{t} = \hat{\xi}_t^i, u_{t}) $$

and sample from it to get new particles \\((\xi _ {t+1}^{i},\frac{1}{N})_{1:N}\\).

The process starts again with the **update step**.



</div>

Now that we are finally done with the derivation, let's see how the particle filter performs in our toy example.

# Example 



<script>

		// defines scenes
	n_scene = load_race_track("race_track_particle", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	//n_scene.filter = "particle";
	n_scene.dur=slow_dur;
	n_scene.auto_start = false;

	n_scene.t = 1;

	n_scene.ids = ["race_track_particle_timestep", "race_track_particle_likelihood", "race_track_particle_update","race_track_particle_predict","race_track_particle_resampling" ];

	n_scene.take_observation = true;


	n_scene.loaded = function(){
		document.getElementById("race_track_particle_likelihood").style.display="block";
		this.rt.hide_strip("inner");
		this.pf = init_particle_filter(this.rc, this.rt)


        var inner_color = d3.piecewise(d3.interpolateRgb, [d3.rgb(this.rt.svg.style("background-color")), d3.rgb('#ff834d'), d3.rgb('#8e3323')]);
		this.rt.init_strip("inner", get_output_dist_normalized(this.rc, this.rt, this.rc.state), inner_color, 60);
		

        this.restart = function(){
            for (var i=0; i<this.ids.length;i++){

                document.getElementById(this.ids[i]).style.display="none";
            }
            document.getElementById("race_track_particle_likelihood").style.display="block";
            this.rc.reset();
            this.t = 1;

            //this.bf.reset();
            this.pf.reset()

            this.rt.hide_strip("inner");
            this.rt.treeg.style("opacity",1.0)
			this.take_observation = true;
        }




        this.rt.set_restart_button(this.restart.bind(this))



        this.toogle_observation = function(){
			if(this.take_observation){
				this.rt.treeg.style("opacity",0.2)
				this.take_observation = false;
				if(this.t% 5 ==1){
					document.getElementById("race_track_particle_likelihood").style.display="none";
					document.getElementById("race_track_particle_timestep").style.display="block";
					this.t = 3;
				}
			}else{
				this.rt.treeg.style("opacity",1.0)
				this.take_observation = true;
			}
        	
        }

		this.rt.tree_click = this.toogle_observation.bind(this)




	}.bind(n_scene)


	n_scene.step = function(){
		this.t++;


		for (var i=0; i<this.ids.length;i++){

			document.getElementById(this.ids[i]).style.display="none";
		}
		


		if(this.t % 5 == 0){
			this.rc.step(scene.rc.current_input);
			this.last_input = this.rc.current_input;
			document.getElementById("race_track_particle_predict").style.display="block";
		}if(this.t % 5 == 1){
	    	
			//this.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, scene.rc.state, scene.rc.current_input));

			this.pf.predict(this.last_input);
			if(this.take_observation){
				document.getElementById("race_track_particle_likelihood").style.display="block";
			}else{
				document.getElementById("race_track_particle_timestep").style.display="block";
				this.t=3;
			}
			
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

<svg id="race_track_particle" style="width:100%"  onclick="on_click()"></svg>

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
<div class="bt1  bt" onclick="scenes_name['race_track_particle'].step();">Observe</div>
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


On the outside of the race track, you will notice uniformly distributed blue dots. These dots are our particles and, therefore, represent a set of hypotheses of the position of the race car. By pressing the __OBSERVE__ button two things will happen: first, we will take a measurement to the distance of the tree and second, we will display the likelihood for this observed distance on the brown strip inside the race track. By pressing the __UPDATE STEP__ button, we will perform our update step. The size of the blue dots will change according to their weighting. By pressing the __RESAMPLING__ button, we are performing the resampling step. As a result, you will notice that only the dots with high weights remains. Now we are ready for the next time step. Take an action, by pressing the corresponding button below the race track. After the step is performed, you have to update your posterior by pressing the __PREDICT STEP__ button. You will see that the dots will change accordingly to your chosen action. Now we finished one full cycle of the filtering process and are ready to start a new cycle by taking a measurement.

If you want to reset the environment, just press the reset button in the bottom left corner or press the **R** button on your keyboard.
As before you can control the car by using your keyboard: **A** (Backward), **S** (Stop),  **D** (Forward) or the buttons below the race track.



# Acknowledgement

The vector graphics of the [car](https://www.freepik.com/free-photos-vectors/car) were created by [Freepik](https://www.freepik.com/).




