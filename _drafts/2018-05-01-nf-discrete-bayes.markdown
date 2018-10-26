---
layout: post
title:  "Nonlinear filtering: Discrete Bayes filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
Intro
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




## Bayes filter


[Derivation of the Kalman filter]({% post_url 2018-10-10-kalman_filter %})


Now that we have a better understanding what Bayes filtering is. To demonstrate the process of Bayes filtering, let's go back to our example and try to visualize it. First of all and most importantly, the process of Bayes filtering requires to solve integrals, that are in general intractable. Otherwise we we wouldn't need approximations such as the particle filter. For the purpose of visualization we can discretize the probability distribution of model and output to compute the integrals numerically. This grid-based method is called Markov localization in the context of localization. Like all grid-based methods is in volatile to the curse of dimensionality.



# Discrete Bayes filter

Now that we know our model a bit better, let's look at the Bayes filter again.


<svg id="race_track_obs_dist" style="width:100%"  onclick="ani()"></svg>






<script>


	n_scene = load_race_track("race_track_mar_loc","{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.filter = "bayes";
	n_scene.dur=slow_dur;
	// define particle filter 

	n_scene.auto_start = false;

	n_scene.t = 1;


	n_scene.loaded = function(){
		//var ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];
		//for (var i=0; i<ids.length;i++){

		//	document.getElementById(ids[i]).style.display="none";
		//}
		document.getElementById("race_track_mar_loc_likelihood").style.display="block";
		this.rt.hide_strip("inner");
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
















<svg id="race_track_mar_loc" style="width:100%"  onclick="ani()"></svg>


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



We learned, that the equations of the Bayes filter are

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})\frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} dx_{t} $$

 **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} .$$

and that these formula is in general is not tractable. 







<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>


<div id="rad_to_s" style="width:100px"></div>
<div id="div1"></div>
<div id="div2"></div>
<!-- <div id="system_dist_approx"  style="width: 600px; height: 600px;"></div> -->
<!--<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>-->









