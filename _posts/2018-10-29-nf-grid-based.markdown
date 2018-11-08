---
layout: post
title:  "Nonlinear filtering: Grid-based filter"
date:   2018-10-29 18:05:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
The process of Bayes filtering requires to solve integrals, that are in general intractable. One approach to circumvent this problem is the use of grid-based filtering. In this article, we will derive this method directly from the recursive equations of the Bayes filter.  <!--more-->This marks the first part of the nonlinear filtering series. If you haven't read the [introduction]({% post_url 2018-10-29-nf-intro %}), I would recommend to read it first. Before we dive into the derivation, let's try to state the main idea behind grid-based filtering.

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
The **grid-based filter** approximates the Bayes filter by **restricting** and **discretizing** the state, input and observation space, to obtain **finite** domains.
</div>


## Derivation

We will start the derivation directly from the recursive equations of the Bayes filter with the **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{\int_{x_t}p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t} .$$


The first and most important step in order to arrive at the equations of the grid-based filter is to discretize our system and observation model. Given a set of discretization points \\((x^1,\ldots,x^X)\\), \\((y^1,\ldots,y^Y)\\) and \\((u^1,\ldots,u^U)\\) the result of the discretization can be written as

$$ \hat{p}(x_{t+1}|x_{t}, u_{t}) = \frac{1}{Z}p(x_{t+1}|x_{t}, u_{t})\sum_{k=1}^X\sum_{l=1}^X \sum_{m=1}^U  \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t) $$



for the system model and

$$ \hat{p}(y_t|x_t) = \frac{1}{Z}p(y_{t}|x_{t})\sum_{k=1}^Y\sum_{l=1}^X  \delta_{y^k}(y_{t})\delta_{x^l}(x_t) $$


for our observation model, where \\(Z\\) is a normalization factor.


<div class="extra_box" markdown="1">
These equations can look confusing and random. Especially if you are not familiar with the [Dirac delta function](https://en.wikipedia.org/wiki/Dirac_delta_function). This box will give a short introduction to the Dirac delta function and provide the tools you will need. **Warning:** The Dirac delta function is actually not a function, but a distribution or a measure! 

The Dirac delta function \\(\delta(x)\\) can be _imagined_ as a function, that is _infinite_ at \\(x=0\\) and _zero_ at \\(x \neq 0\\) with the property

$$\int_x \delta(x)\,dx = 1.$$

It is not possible to plot the Dirac delta function, but we can visualize it schematically by using an arrow pointing upwards, as shown in the figure below.
<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac" style="width:85%;display:inline-block;"></div></div>

The length of the line represents the area under the function. The expression \\(\delta(x-y)\\) is a shifted version of the Dirac delta function with its peak at \\(y\\).



<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac_shift" style="width:85%;display:inline-block;"></div></div>

To unclutter the notation, we will use the shorthand \\(\delta_y(x)\\) for \\(\delta(x-y)\\).


The _sifting property_ 

$$ \int_x f(x)\delta_y(x)\,dx = f(y) $$

will play an important role in our derivation. Intuitively, it is sifting out the function value of \\(f(x)\\) at \\(y\\).



The multivariate Dirac delta function, which can be _loosely_ thought of as _infinite_ at \\((x_1,\ldots,x_n)=(0,\ldots,0)\\) and _zero_ at \\((x_1,\ldots,x_n) \neq (0,\ldots,0)\\) is defined as the product of several Dirac delta functions:

$$ \delta(x_1,\ldots,x_n) = \delta(x_1)* \ldots *\delta(x_n). $$


Several Dirac delta functions can also be combined to form a comb or grid, which is shown in the following figure.


<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac_comb" style="width:85%;display:inline-block;"></div></div>

To obtain such a grid, the Dirac delta functions are simply added together

$$ \sum_{i=1}^N\delta_{x_i}(x). $$

Finally, we can multiply the grid with a function \\(f(x)\\) :

$$ \sum_{i=1}^Nf(x)\delta_{x_i}(x). $$

The particular Dirac delta functions are weighted by the functional value at the corresponding point. This can be visualized as following.

<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac_wcomb" style="width:85%;display:inline-block;"></div></div>


Now that we have a better understanding of the Dirac delta function, let's look again at our system and observation model. In our system model, we find a multivariate Dirac delta function 

$$ \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t), $$

where the particular Dirac delta functions could be multivariate as well. We also note, that the multivariate Dirac delta function is embedded in a triple sum over the corresponding discrete spaces. It describes, therefore, a grid of Dirac delta functions.
Finally, we multiply this grid with our system model. To obtain a proper probability distribution, we normalize our distribution with \\(Z\\).
The observation model can be treated likewise.

</div>





If we start the recursion with a discretized prior distribution

$$ \hat{p}(x_0) = \sum_{k=1}^X w^k \delta_{x^k}(x_0) $$

all of our belief distributions will be discretized as well.
Therefore, the posterior will have the form

$$ \hat{p}(x_{t}|\cdot) = \sum_{k=1}^X w^k \delta_{x^k}(x_t).  $$




# Prediction step



Let's see what happens, if we plug the discretized version of our system model into the equations of the prediction step:



$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} \frac{1}{Z}p(x_{t+1}|x_{t}, u_{t})\sum_{k=1}^X\sum_{l=1}^X\sum_{m=1}^U \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t)\sum_{n=1}^X w^n \delta_{x^n}(x_t) dx_{t} $$

First of all, we know our current input is \\(u^i\\). To evaluate \\(\hat{p}(x_{t+1}\|y_{0:t},u_{0:t}) \\) at \\(u^i\\), we simply have to compute \\(\int_{u_t}\hat{p}(x_{t+1}\|y_{0:t},u_{0:t})\delta_{u^i}(u_t)\,d_t \\). As a result, we will obtain


$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\int_{x_{t}}p(x_{t+1}|x_{t}, u_t=u^m) \sum_{k=1}^X\sum_{l=1}^X  \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\sum_{n=1}^X w^n \delta_{x^n}(x_t) dx_{t} $$

The following expression

$$ \sum_{l=1}^X \delta_{x^l}(x_t)\sum_{n=1}^X w^n \delta_{x^n}(x_t) $$

is not zero only if \\(l = n\\). Therefore, we can replace this expression with

$$ \sum_{n=1}^X w^n \delta_{x^n}(x_t) $$

and obtain

$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\int_{x_{t}}p(x_{t+1}|x_{t}, u_t=u^m) \sum_{k=1}^X\sum_{n=1}^X  \delta_{x^k}(x_{t+1}) w^n \delta_{x^n}(x_t) dx_{t} .$$

By rearranging the integral and sums we  obtain

$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\sum_{k=1}^X\delta_{x^k}(x_{t+1})\int_{x_{t}}p(x_{t+1}|x_{t}, u_t=u^m) \sum_{n=1}^X   w^n \delta_{x^n}(x_t) dx_{t} $$

Using the sifting property we will arrive at

$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\sum_{k=1}^X\delta_{x^k}(x_{t+1})\sum_{n=1}^Xp(x_{t+1}|x_{t} = x^n, u_t=u^m)    w^n   $$


# Update step


Let's start our treatment of the update step and by looking at the numerator. Again, we plug in our discretized distributions to obtain


$$ \hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) = \frac{1}{Z}p(y_{t}|x_{t})\sum_{k=1}^Y\sum_{l=1}^X  \delta_{y^k}(y_{t})\delta_{x^l}(x_t)\sum_{m=1}^X w^m \delta_{x^m}(x_t).  $$

We know, that we have an observation \\(y^k\\), which we can plug in in the same way as the input above:

$$ \hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) = \frac{1}{Z}p(y_{t}=y^k|x_{t})\sum_{m=1}^Xw^m\delta_{x^m}(x_t)  $$

The denominator is simply the integral over \\(x_t\\) of the expression above:

$$ \int_{x_t}\hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t = \frac{1}{Z}\int_{x_t}p(y_{t}=y^k|x_{t})\sum_{m=1}^Xw^m\delta_{x^m}(x_t) \,dx_t. $$

With help of the sifting property, we obtain the final expression 

$$ \int_{x_t}\hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t = \frac{1}{Z}\sum_{m=1}^Xw^mp(y_{t}=y^k|x_{t}=x^k) $$

for the denominator.

The full update step is then defined as


$$ \hat{p}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_{t}=y^k|x_{t})\sum_{m=1}^Xw^m\delta_{x^m}(x_t)}{\sum_{l=1}^Xw^mp(y_{t}=y^k|x_{t}=x^k)} .$$

Let's summarize our results!

<div class="important_box" markdown="1">
<h1>Grid-based filter</h1>

The recursive formula for the grid-based filter in state space models consists of the **prediction step**

$$ \hat{p}(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\sum_{k=1}^X\delta_{x^k}(x_{t+1})\sum_{n=1}^Xp(x_{t+1}|x_{t} = x^n, u_t=u^m)    w^n   $$


and the **update step**

$$ \hat{p}(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_{t}=y^k|x_{t})\sum_{m=1}^Xw^m\delta_{x^m}(x_t)}{\sum_{l=1}^Xw^mp(y_{t}=y^k|x_{t}=x^k)} .$$

The recursion is started with a discrete prior distribution over the initial state \\(\hat{p}(x_0)\\).

</div>

# Discrete probability distribution

Our discretized system and observation model is non-zero only at the points on the grid. Nonetheless, the model itself is still continuous: we can evaluate the function at points, which are not part of the grid. Then again, the posterior will always remain on the grid during the filtering process. Thus, we can represent our system as a discrete probability distribution



$$ P(x_{t+1}=k|x_t=l,u=m) = \frac{1}{Z(l,m)} p(x_{t+1}=x^k|x_{t}=x^l, u_t=u^m) $$

with the normalization factor \\(Z(l,m) = \sum_{k=1}^X p(x_{t+1}=x^k\|x_{t}=x^l, u_t=u^m) \\).

Similarly, the observation model can be represented by the discrete probability distribution

$$ P(y_{t}=k|x_t=l) = \frac{1}{Z(l)} p(y_{t}=y^k|x_{t}=x^l) $$

with the normalization factor \\(Z(l) = \sum_{k=1}^X p(y_{t}=y^k\|x_{t}=x^l) \\). With this representation, we arrive at the Bayes filter for discrete probability distributions.

<div class="important_box" markdown="1">
<h1>Discrete Bayes filter</h1>

The recursive formula for the discrete Bayes filter in state space models consists of the **prediction step**


$$ P(x_{t+1}|y_{0:t},u_{0:t}) = \sum_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) $$

and the **update step**

$$ P(x_t|y_{0:t},u_{0:t-1}) = \frac{P(y_t|x_t)P(x_t|y_{0:t-1},u_{0:t-1})}{\sum_{x_t} P(y_t|x_t)P(x_t|y_{0:t-1},u_{0:t-1})} .$$

The recursion is started with a discrete prior distribution over the initial state \\(P(x_0)\\).

</div>




## Example

Enough of the dry theory! Let's play around with the grid-based filter in our race track example. 




<svg id="race_track_mar_loc" style="width:100%"  onclick="on_click()"></svg>
<script>


	n_scene = load_race_track("race_track_mar_loc","{{ base.url | prepend: site.url }}",400);
	n_scene.mode = 2;
	n_scene.filter = "bayes";
	n_scene.dur=slow_dur;
	// define particle filter 

	n_scene.auto_start = false;

	n_scene.t = 1;

	n_scene.ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];

	n_scene.take_observation = true;

	n_scene.loaded = function(){
		//var ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];
		//for (var i=0; i<ids.length;i++){

		//	document.getElementById(ids[i]).style.display="none";
		//}
		document.getElementById("race_track_mar_loc_likelihood").style.display="block";
		this.rt.hide_strip("inner");


		this.restart = function(){
			for (var i=0; i<this.ids.length;i++){

				document.getElementById(this.ids[i]).style.display="none";
			}
			document.getElementById("race_track_mar_loc_likelihood").style.display="block";
			this.rc.reset();
			this.t = 1;
			this.bf.reset();
			this.rt.hide_strip("inner");
			this.rt.show_strip("outer");
			this.rt.update_strip("outer", normalize_vector(this.bf.posterior));
			this.rt.treeg.style("opacity",1.0)
			this.take_observation = true;
		}


		this.rt.set_restart_button(this.restart.bind(this))

		this.toogle_observation = function(){
			if(this.take_observation){
				this.rt.treeg.style("opacity",0.2)
				this.take_observation = false;
				if(this.t% 5 ==1){
					document.getElementById("race_track_mar_loc_likelihood").style.display="none";
					document.getElementById("race_track_mar_loc_timestep").style.display="block";
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
		//document.getElementById(ids[this.t%3]).style.display="block";


		if(this.t % 4 == 0){
			this.rc.step(this.rc.current_input);
			this.last_input = this.rc.current_input;
			document.getElementById("race_track_mar_loc_predict").style.display="block";
			this.rt.hide_strip("inner");
		}else if(this.t % 4 == 1){
			this.bf.predict(this.last_input);
			this.rt.update_strip("outer", normalize_vector(this.bf.posterior));
			if(this.take_observation){
				document.getElementById("race_track_mar_loc_likelihood").style.display="block";
			}else{
				document.getElementById("race_track_mar_loc_timestep").style.display="block";
				this.t=3;
			}
		}else if(this.t % 4 == 2){
			this.rt.show_strip("inner");
			this.output = scene.rc.output_dist_sample(0);
			this.rt.update_strip("inner", get_output_dist_normalized_from_distance(this.rc, this.rt, this.output));
			document.getElementById("race_track_mar_loc_update").style.display="block";
		}else if(this.t % 4 == 3){
			
	    	var y = scene.bf.cont_2_disc_output(this.output);
			this.bf.update(y);
			this.rt.update_strip("outer", normalize_vector(this.bf.posterior));
			document.getElementById("race_track_mar_loc_timestep").style.display="block";
		}



	}.bind(n_scene);

	scenes_name["race_track_mar_loc"] = n_scene;
	scenes.push(n_scene);

</script>

<div style="float:right" class="slidecontainer">
  <input type="range" min="100" max="700" value="400" class="slider" id="myRange">
</div>



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
<div class="bt1  bt" onclick="scenes_name['race_track_mar_loc'].step();">Observe</div>
  <span class="stretch"></span>
</div>

<div id="race_track_mar_loc_update" class="button_set" onclick="scenes_name['race_track_mar_loc'].step();">
<div class="bt1  bt">Update step</div>
  <span class="stretch"></span>
</div>



On the outside of the race track, you will notice a blue colored strip. This strip represents our current posterior of the current position of the race car. At the beginning, we have no knowledge about the position of the race car and assign uniform probability over all positions. By pressing the __OBSERVE__ button two things will happen: first, we will take a measurement of the distance to the tree and second, we will display the likelihood for this observed distance on the brown strip inside the race track. By pressing the __UPDATE STEP__ button, we will perform our update step and show the resulting posterior at the outer strip. You will note, that both strips will have the same form after the update. The reason is simple: we just multiplied our likelihood with a constant vector and normalized afterward. Now we are ready for the next time step. Take an action, by pressing the corresponding button below the race track. After the step is performed, you have to update your posterior by pressing the __PREDICT STEP__ button. You will see that the outer strip will change accordingly. Now we finished one full cycle of the filtering process and are ready to start a new cycle by taking a measurement.

What if our distance meter is not working anymore? By either clicking on the tree or pressing the **W** button on your keyboard, you can turn off your measurement device. Therefore, the observation and update step will be skipped. The tree will become opaque, if your measurement device is turned off.

With the slider below the race track, you can choose a grid size of the discrete probability models. If you want to reset the environment, just press the reset button in the bottom left corner or press the **R** button on your keyboard.
As before you can control the car by using your keyboard: **A** (Backward), **S** (Stop),  **D** (Forward) or the buttons below the race track.

<script>



var slider = document.getElementById("myRange");

slider.oninput = function() {

	scene = scenes_name['race_track_mar_loc'];

    // delete strips
    scene.rt.delete_strip("inner");
    scene.rt.delete_strip("outer");


    // set strip domain
    scene.rt.set_strip_domain(parseInt(this.value));


    // create new bayes filter
    scene.bf = init_bayes_filter(scene.rc, scene.rt);

	// create strips
    scene.rt.init_strip("inner",get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state) , scene.rt.strip_color.inner, scene.rt.strip_width.inner)
    scene.rt.init_strip("outer", normalize_vector(scene.bf.posterior), scene.rt.strip_color.outer, scene.rt.strip_width.outer)
    scene.restart()
}
</script>

Still feeling hungry for Bayes filters? Then you should definitely check out the next part of the nonlinear filtering series covering the derivation of the [extended Kalman filter]({% post_url 2018-10-31-nf-ekf %}). See you there!

# Acknowledgement

The vector graphics of the [car](https://www.freepik.com/free-photos-vectors/car) were created by [Freepik](https://www.freepik.com/).



<script>


dirac_plot("#dirac",[{x:0,w:0.7,t:""}], false, null);
dirac_plot("#dirac_shift",[{x:0.25,w:0.7,t:"y"}], true, null);

var nd = 17;
var grid = [...Array(nd)].map((e,i)=>{return (i - (nd-1)/2)/(1.5*nd)});
comb = [...Array(nd)].map((e,i)=>{return {x:grid[i], w:0.7, t:""}})
dirac_plot("#dirac_comb",comb, true, null);

wcomb = [...Array(nd)].map((e,i)=>{return {x:grid[i], w:0.1*gaussian(grid[i],0,0.15), t:""}})

var np = 101;
gauss = [...Array(np)].map((e,i)=>{return {x:(i - (np-1)/2)/(1.5*np), w:0.1*gaussian((i - (np-1)/2)/(1.5*np),0,0.15), t:""};})

dirac_plot("#dirac_wcomb",wcomb, true, gauss);
</script>






