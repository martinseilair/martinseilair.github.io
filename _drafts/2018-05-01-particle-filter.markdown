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

<script src="{{ base.url | prepend: site.url }}/assets/js/particle_filter/scene.js"></script>

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

	// input modes
	// 0: Automatisch langsam; sequential
	// 1: Set input per  A = backward, S = no movement, D = forward; one step
	// 2: Set input per  A = backward, S = no movement, D = forward; sequential
	// 3: Mouse exploring
	// 4: No input
	
	scenes = [];
	interval = null;
	var current_input = 2;
	var aa = 0;
	var dur = 1000;
	var ani_step = 3;
	// add loaded listener
	window.addEventListener("load", function(event) {
		finished_loading();
	});

	// defines scenes
	n_scene = load_race_track("race_track", "{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.use_particle_filter = true;

	// define particle filter 
	if(n_scene.use_particle_filter){
		n_scene.pf = init_particle_filter(n_scene.rc, n_scene.rt)
	}else{
		n_scene.bf = init_bayes_filter(n_scene.rc, n_scene.rt);
	}

	scenes.push(n_scene);

	// defines scenes
	n_scene = load_race_track("race_track_2","{{ base.url | prepend: site.url }}");
	n_scene.mode = 2;
	n_scene.use_particle_filter = false;

	// define particle filter 
	if(n_scene.use_particle_filter){
		n_scene.pf = init_particle_filter(n_scene.rc, n_scene.rt)
	}else{
		n_scene.bf = init_bayes_filter(n_scene.rc, n_scene.rt);
	}

	scenes.push(n_scene);
	scene = scenes[0];


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







<svg id="race_track" style="width:100%"  onclick="ani()"></svg>


<svg id="race_track_2" style="width:100%"  onclick="ani()"></svg>




<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'></a>


<!-- <div id="system_dist_approx"  style="width: 600px; height: 600px;"></div> -->
<!--<div id="output_dist_approx"  style="width: 600px; height: 600px;"></div>-->
