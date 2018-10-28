---
layout: post
title:  "Nonlinear filtering: Grid-based filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
The process of Bayes filtering requires to solve integrals, that are in general intractable. One approach to circumvent this problem is the use of grid-based filtering. In this article we will take a closer look at this method and derive it directly from the recursive equations of the Bayes filter. It is also the start of the nonlinear filtering series. <!--more-->Let's dive directly into it and state the main idea behind it.

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

Before we dive into the derivation of this method, we will quickly discuss the pros and cons of this method. The size of the grid is the main parameter of this method. The finer your grid is, the more accurate will be your estimate. However, a finer grid will also lead to an exponential higher memory and computation usage. The filter designer has to choose an appropriate grid size. The implementation is straightforward. Furthermore, the grid-based filter is optimal for models that are already discrete.
In the context of localization, this grid-based method is called Markov localization.




## Derivation

We will start the derivation directly from the recursive equations of the Bayes filter with the **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{\int_{x_t}p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t} .$$


The first and most important step to arrive at the equations of the grid-based filter is to discretize our system and observation model. This discretization will result in

$$ \hat{p}(y_t|x_t) = \frac{1}{Z}\sum_{k=1}^Y\sum_{l=1}^Xp(y_{t}|x_{t})  \delta_{y^k}(y_{t})\delta_{x^l}(x_t) $$

for the system model and

$$ \hat{p}(x_{t+1}|x_{t}, u_{t}) = \frac{1}{Z}\sum_{k=1}^X\sum_{l=1}^X \sum_{m=1}^U p(x_{t+1}|x_{t}, u_{t}) \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t) $$

for our observation model.


<div class="extra_box" markdown="1">
These equations can look confusing and random. Especially if you are not familiar with the [Dirac delta function](https://en.wikipedia.org/wiki/Dirac_delta_function). This box will give a short introduction to the Dirac delta function and provide the tools you will need.

The Dirac delta function \\(\delta(x)\\) can be imagined as a function, that is _infinite_ at \\(x=0\\) and _zero_ at \\(x \neq 0\\) with the property

$$\int_x \delta(x)\,dx = 1.$$

Because It is not possible to plot the Dirac delta function itself, but we can visualize it schematically by using an arrow which points upwards, where length of the line represents the area under the curve.
<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac" style="width:75%;display:inline-block;"></div></div>

The expression \\(\delta(x-y)\\) is a shifted version of the Dirac delta function with its peak at \\(y\\).



<div style="text-align:center; width:100%;display:inline-block;"><div id="dirac_shift" style="width:75%;display:inline-block;"></div></div>

We will use the shorthand \\(\delta_y(x)\\) for \\(\delta(x-y)\\).


For our derivation the _sifting property_ 

$$ \int_x f(x)\delta_y(x)\,dx = f(y) $$

will play an important rule.

The multivariate Dirac delta function, which is _infinite_ at \\(x=0\\) in the multivariate case and _zero_ at \\(x \neq 0\\) is defined as the product of Dirac delta functions:

$$ \delta(x_1,\ldots,x_n) = \delta(x_1)* \ldots *\delta(x_n). $$


</div>


Intuitively, we cut our domains into distinct and equally spaced small areas and observe how much probability mass falls onto these bins. In the figure below you see how a discretization of a one-dimensional probability could look like.


<div style="text-align:center; width:100%"><div id="discretize" style="width:100%;display:inline-block;"></div></div>



Now, we can store our distributions as numerical values, which can be interpreted as vectors, matrices or in general tensors.

As there are many ways to approximate the area under a curve, there are many ways to discretize a probability density. In this article we will use the assumption, that the probability mass at a bin x^k is simply the probability density times by the area of the bin.

By discretizing we arrive at our discrete versiron of the system dynamics

$$ \hat{p}(y_t|x_t) = \frac{1}{Z}\sum_{k=1}^Y\sum_{l=1}^Xp(y_{t}|x_{t})  \delta_{y^k}(y_{t})\delta_{x^l}(x_t) $$

and our observation

$$ \hat{p}(x_{t+1}|x_{t}, u_{t}) = \frac{1}{Z}\sum_{k=1}^X\sum_{l=1}^X \sum_{m=1}^U p(x_{t+1}|x_{t}, u_{t}) \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t). $$



Furthermore, if we start with a discretized prior distribution

$$ p(x_0) = \sum_{k=1}^X w^k \delta_{x^k}(x_0) $$

all of our belief states will be discretized, which we will show soon.
The posterior will have the form

$$ \hat{p}(x_{t}|\cdot) = \sum_{k=1}^X w^k \delta_{x^k}(x_t).  $$








We start with the prediction step and plug our discrete 



$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} \frac{1}{Z}\sum_{k=1}^X\sum_{l=1}^X\sum_{m=1}^Up(x_{t+1}|x_{t}, u_{t}) \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\delta_{u^m}(u_t)\sum_{n=1}^X w^n \delta_{x^n}(x_t) dx_{t} $$




$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\int_{x_{t}} \sum_{k=1}^X\sum_{l=1}^X p(x_{t+1}|x_{t}, u_t=u^m) \delta_{x^k}(x_{t+1})\delta_{x^l}(x_t)\sum_{n=1}^X w^n \delta_{x^n}(x_t) dx_{t} $$


$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\sum_{k=1}^X\delta_{x^k}(x_{t+1})\int_{x_{t}} \sum_{l=1}^X \sum_{n=1}^X p(x_{t+1}|x_{t}, u_t=u^m)  w^n \delta_{x^n}(x_t)\delta_{x^l}(x_t) dx_{t} $$

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \frac{1}{Z}\sum_{k=1}^X\delta_{x^k}(x_{t+1}) \sum_{l=1}^X  p(x_{t+1}|x_{t} = x^l, u_t=u^m)  w^l $$


We are coming the update step and start by looking at the numerator. We plug in our discretized distributions.


$$ \hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) = \frac{1}{Z}\sum_{k=1}^Y\sum_{l=1}^Xp(y_{t}|x_{t})  \delta_{y^k}(y_{t})\delta_{x^l}(x_t)\sum_{m=1}^X w^m \delta_{x^m}(x_t)  $$

We know, that we have an observation \\(y^k\\), which we can plug in.

$$ \hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) = \frac{1}{Z}\sum_{l=1}^Xp(y_{t}=y^k|x_{t})\delta_{x^l}(x_t)  $$

The denominator is simply the integral over \\(x_t\\) of the expression above.

$$ \int_{x_t}\hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t = \frac{1}{Z}\int_{x_t}\sum_{l=1}^Xp(y_{t}=y^k|x_{t})\delta_{x^l}(x_t) \,dx_t $$

$$ \int_{x_t}\hat{p}(y_t|x_t)\hat{p}(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t = \frac{1}{Z}\sum_{l=1}^Xp(y_{t}=y^k|x_{t}=x^k) $$

In total we will arrive at


$$ \hat{p}(x_t|y_{0:t},u_{0:t-1}) = \frac{\sum_{l=1}^Xp(y_{t}=y^k|x_{t})\delta_{x^l}(x_t)}{\sum_{l=1}^Xp(y_{t}=y^k|x_{t}=x^k)} .$$


When we want to implement this we can store our districutions in arrays, that we dont have to evaluate the density for each operation. The
 system model can be represented by a three dimensional array.
$$ M(k,l,m) = \frac{1}{Z(l,m)} p(x_{t+1}=x^k|x_{t}=x^l, u_t=u^m) $$

with normalization factor \\(Z(l,m) = \sum_{k=1}^X p(x_{t+1}=x^k\|x_{t}=x^l, u_t=u^m) \\).

Similarly we can express the observation model in two dimensional as

$$ O(k,l) = \frac{1}{Z(l)} p(y_{t}=y^k|x_{t}=x^l) $$

with normalization factor \\(Z(l) = \sum_{k=1}^X p(y_{t}=y^k\|x_{t}=x^l) \\).

With the posterior array \\(p\\) and prior array \\(q\\) the forward step is reduced to matrix multiplication. In the language of numpy

{% highlight python %}
posterior = np.dot(M[:,:,u],prior)
{% endhighlight %}

The update equation will be a elementwise vector multiplication with subseq

{% highlight python %}
Z = np.multiply(O(y_k,:),prior)
posterior = np.multiply(O(y_k,:),prior)/Z
{% endhighlight %}




## Example

Enough of the dry theory! Let's play around with the grid-based filter in our race track example. 




<svg id="race_track_mar_loc" style="width:100%"  onclick="on_click()"></svg>
<script>


	n_scene = load_race_track("race_track_mar_loc","{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.filter = "bayes";
	n_scene.dur=slow_dur;
	// define particle filter 

	n_scene.auto_start = false;

	n_scene.t = 1;

	n_scene.ids = ["race_track_mar_loc_likelihood", "race_track_mar_loc_update","race_track_mar_loc_timestep", "race_track_mar_loc_predict" ];

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
		}


		this.rt.set_restart_button(this.restart.bind(this))



	}.bind(n_scene)


	n_scene.step = function(){
		this.t++;
		for (var i=0; i<this.ids.length;i++){

			document.getElementById(this.ids[i]).style.display="none";
		}
		//document.getElementById(ids[this.t%3]).style.display="block";


		if(this.t % 4 == 0){
			this.rc.step(this.rc.current_input);
			document.getElementById("race_track_mar_loc_predict").style.display="block";
			this.rt.hide_strip("inner");
		}else if(this.t % 4 == 1){
			this.bf.predict(this.rc.current_input);
			
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



You will notice a blue colored strip on the outside of the race track. This strip represents our current belief of the current position of the race car. At the beginning we no knowledge has assigned equal probability at every position. By pressing the _OBSERVE_ button two things will happen. First we will take a measurement of the distance of the tree and second we will display the likelihood for this observed distance on the brown strip inside the race track. By pressing the _UPDATE STEP_ button, we will perform our update step and show the resulting posterior at the outer strip. You will note, that both strips will have the same form after the update. The reason is simple, we just multiplied our likelihood with a constant vector and normalized afterwards. Now we are ready for the next time step. You can choose the action that you want to take on the buttons below the image. After the step is performed, you have to update your belief by pressing the _PREDICT STEP_ button. You will see that the outer strip will change. Now we finished on full cycle and will start the new cycle by taken a measurement.

With the slider below you can adjust the grid-size of our probability models. If you want to reset the environment, just press the reset button in the bottom left corner.

As before you can control the car by using your keyboard: **A** (Backward), **S** (Stop),  **D** (Forward) or the buttons below the race track.



<script>


var dp = d3.select("#dirac");

var margin = {top: 20, right: 30, bottom: 30, left: 30},
width = dp.node().getBoundingClientRect().width - margin.right- margin.left,
height = dp.node().getBoundingClientRect().width/4 - margin.bottom - margin.top;


var svg = dp.append("svg")
  .attr("viewBox","0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





  var markersize=10;
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
    .attr('id', 'end-arrow-axis')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');


  markersize=5;
  defs.append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');






// x-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0-0.03*width;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width;
  })
  .attr("y2", function(d) {
    return height;
  });

// y-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow)')
  .attr("x1", function(d) {
    return width/2;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width/2;
  })
  .attr("y2", function(d) {
    return 0.1*height;
  });

  //null

  svg.append("g")
  	.append("text")
  	.text("0")
  	.attr("transform","translate(" + (width/2) + ", " + (height + 17) + ")")
  	.attr("text-anchor","middle")


</script>

<script>


var dp = d3.select("#dirac_shift");

var margin = {top: 20, right: 30, bottom: 30, left: 30},
width = dp.node().getBoundingClientRect().width - margin.right- margin.left,
height = dp.node().getBoundingClientRect().width/4 - margin.bottom - margin.top;


var svg = dp.append("svg")
  .attr("viewBox","0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





  var markersize=10;
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
    .attr('id', 'end-arrow-axis')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');


  markersize=5;
  defs.append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');






// x-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0-0.03*width;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width;
  })
  .attr("y2", function(d) {
    return height;
  });

// y-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return width/2;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width/2;
  })
  .attr("y2", function(d) {
    return 0;
  });

// y-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow)')
  .attr("x1", function(d) {
    return 2*width/3;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return 2*width/3;
  })
  .attr("y2", function(d) {
    return 0.1*height;
  });

  //null

  svg.append("g")
  	.append("text")
  	.text("0")
  	.attr("transform","translate(" + (width/2) + ", " + (height + 17) + ")")
  	.attr("text-anchor","middle")

   svg.append("g")
  	.append("text")
  	.text("y")
  	.attr("transform","translate(" + (2*width/3) + ", " + (height + 17) + ")")
  	.attr("text-anchor","middle")


</script>






<script>


var dp = d3.select("#discretize");

var margin = {top: 20, right: 30, bottom: 30, left: 30},
width = dp.node().getBoundingClientRect().width - margin.right- margin.left,
height = dp.node().getBoundingClientRect().width/2 - margin.bottom - margin.top;


var svg = dp.append("svg")
  .attr("viewBox","0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





  var markersize=10;
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
    .attr('id', 'end-arrow-axis')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');





	var mix = [0.4, 0.6];
	var gs = [[30,15], [60,15]];
	var dom = [0.0, 100];
	var n_plot = 1000;
	var b_plot = 20;
	var v;
	var sum_data = [...Array(n_plot)].map((e,i)=>{return {x:dom[1]*i/n_plot,y:0}});
	var bin_data = [...Array(n_plot)].map((e,i)=>{return {x:dom[1]*i/b_plot,y:0}});

	for (var j = 0; j < mix.length; j++) {
			for (var i = 0; i < n_plot; i++) {	
				v = mix[j]*gaussian(sum_data[i].x,gs[j][0],gs[j][1]);
				sum_data[i].y+=v;
			}
			for (var i = 0; i < b_plot; i++) {	
				v = mix[j]*gaussian(dom[1]*(i+0.5)/b_plot,gs[j][0],gs[j][1]);
				bin_data[i].y+=v;
			}
	}


var x = d3.scaleLinear()
    .domain([0, 100.0])
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, margin.top])
    .domain([0, d3.max(sum_data, function(d) { return d.y })]).nice();



      var bin_width = x(dom[1]/b_plot) - x(0);
      var bin_prc = 0.9;

  svg.append("g")
      .attr("fill", "#bbb")
    .selectAll("rect")
    .data(bin_data)
    .enter().append("rect")
      .attr("x", function(d,i) { return x(d.x) + (1-bin_prc)*bin_width/2; })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return bin_width*bin_prc })
      .attr("height", function(d) { return -y(d.y)+y(0); });

  svg.append("path")
      .datum(sum_data)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); }));

// x-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0-0.03*width;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width;
  })
  .attr("y2", function(d) {
    return height;
  });

// y-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0;
  })
  .attr("y1", function(d) {
    return height+0.03*width;
  })
  .attr("x2", function(d) {
    return 0;
  })
  .attr("y2", function(d) {
    return 0;
  });


</script>


<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>


<div id="rad_to_s" style="width:100px"></div>
<div id="div1"></div>
<div id="div2"></div>
<!-- <div id="system_dist_approx"  style="width: 600px; height: 600px;"></div> -->
<!--<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>-->


<style>
.slidecontainer {
    width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 100%; /* Full-width */
    height: 25px; /* Specified height */
    background: #f0f0f0; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
    margin-top:20px;
    margin-bottom:20px;
}

/* Mouse-over effects */
.slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */ 
.slider::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 25px; /* Set a specific slider handle width */
    height: 25px; /* Slider handle height */
    background: #555555; /* Green background */
    cursor: pointer; /* Cursor on hover */
}

.slider::-moz-range-thumb {
    width: 25px; /* Set a specific slider handle width */
    height: 25px; /* Slider handle height */
    background: #555555; /* Green background */
    cursor: pointer; /* Cursor on hover */
}
</style>




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

