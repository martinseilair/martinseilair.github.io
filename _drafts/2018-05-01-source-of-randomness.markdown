---
layout: post
title:  "Source of randomness"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---

<!--more-->

<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>


If we neglect _true_ randomness (from quantum effects), where is randomness coming from?

We always work with probability distributions, but if we are living in a deterministic world, where is the randomness coming from?

This article argues, that if we have a probability distribution, the element of stochasticity always comes from a lack of knowledge.


Lets assume we have a deterministc system, that is described by the equation 

$$ y = f(x). $$

In this case \\(x\\) determines \\(y\\) or in other words, \\(x\\) causes \\(y\\).

If we want the value of \\(y\\) given an particular \\(\hat{x}\\) we simply have to insert this value into our equation:

$$ \hat{y} = f(\hat{x}). $$

As a result we will get a specific value of \\(\hat{y}\\).

We can also formuate our deterministic model in the language of probability as conditional distribution

$$ p(y|x) = \delta(y - f(x)). $$

In the language of probability theory, what does it mean to plug in a specific value \\(\hat{x}\\) to the function?

Actually this is pretty easy. We use the Dirac delta function and use the sifting property

$$ p(y) = \int_x p(y|x) \delta(x-\hat{x}) dx$$

$$ p(y) = \int_x \delta(y - f(x)) \delta(x-\hat{x}) dx $$

$$ p(y) = \delta(y - f(\hat{x})). $$

All the probability mass will be at the point where \\(y = f(\hat{x})\\) is satisfied.
Ok thats nice!


Up until now, we were sure about our input \\(\hat{x}\\).

But what about if we have not full knowledge of our input, but only some belief, that can be described by a distribution \\(p(x)\\).

We cant just input this into our deterministic function, which only takes on single input. But we can use the probabilistic interpreation to insert our belief at once.


$$ p(y) = \int_x p(y|x) p(x) dx$$

$$ p(y) = \int_x \delta(y - f(x))p(x) dx$$

In general, even if we have a deterministic \\(p(y\|x)\\) the resulting \\(p(y)\\) will not be deterministic.


Ok, great! But what is if we have not deterministic functions but stochastic function? How can we explain this?

We are starting again from a _deterministic_ model 

$$ y = f(x,z). $$

Everything is nice. Now, let's assume we know we know \\(z\\) is \\(\hat{z}\\). We can plug \\(\hat{z}\\) into our equation and obtain the new equation

$$ y = \hat{f}(x) = f(x,\hat{z}). $$

By plugging in \\(\hat{z}\\) we have effectively reduced the dimensionality of our function.
Can we also formulate in the deterministic setting? Yes, we can:


$$ p(y|x) = \int_x p(y|x,z) \delta(z-\hat{z}) dx$$

$$ p(y|x) = \int_x \delta(y - f(x,z)) \delta(z-\hat{z}) dx $$

$$ p(y|x) = \delta(y - f(x,\hat{z})). $$

Nice!

But what happens, if we don't know our input exactly and have distriubtion over \\(p(z)\\)?

We can use the same machinery.

$$ p(y|x) = \int_x p(y|x,z)p(z) dx$$

$$ p(y|x) = \int_x \delta(y - f(x,z)) p(z) dx $$


Even is we have a deterministic \\(p(y\|x,z)\\) we will end up with a resulting stochastic \\(p(y\|x)\\). Where is the randomness coming from? It comes from the lack of knowledge of the parameter \\(z\\). But the process itself is still deterministic.

What can we learn from it? If we have probabilistic conditional dependencies, we **know** that we missed some hidden variables or left some on purpose.

Ok! Great! But now let's think for a moment about Markov processes.

How are Markov processes defined?

If we have stochastic process 

$$ p(x_1, \ldots, x_T) $$

we can separate it by

$$ p(x_0, \ldots, x_T) = p(x_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t) $$

This model does describe a chain. The value of \\(x_t\\) depends only on \\(x_{t-1}\\).
So far so good.

But let's think about our finding from above. We know that the uncertainty of the \\(p(x_{t+1}\|x_t) \\) comes from hidden variables. Therefore, we know that there are more variables involved in the environment.

Actually we have the deterministic conditionals

$$ p(x_{t+1}|x_t, h_t) $$

Ok fair enough. Our next state \\(x_{t+1}\\) is not only depending on \\(x_t\\) but also on \\(h_t\\). 

In a closed system, this hidden variables have to be part of the dynamic as well.

Therefore, we will have a hidden _deterministic_ dynamic 

$$ p(h_{t+1}|x_t, h_t). $$


Our total process will be 

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|x_t, h_t) $$



If we look at our graphical we see that given the state \\(x_t\\) its not blocking the way to \\(x_{t-1}\\) anymore. We lost our Markov property! Now our model is not only dependent on the last state.

But why is it still reasonable to use Markov models?

Even if we assume, 

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|h_t) $$

or

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|x_t) $$

we dont obtain the Markov property!!!! It seems, that the only case where the Markov property holds is if we have independend \\(p(h_t)\\) at a\every timestep.

But we have a deterministic system it has to come from somewhere!

We have to assume the following property

$$ p(h_{t+1}|x_t, h_t) = p(h_{t+1})p(x_t)p(h_t) $$


https://en.wikipedia.org/wiki/Mixing_(mathematics)
This property is called mixing. If we have an deterministic input, we will get an deterministic output. But if we are just slightly uncertain about our input, this will lead to completely random outputs, without any correlation to the input. Totally crazy.

At the same time
$$  h_{t+1} = f(x_t, h_t) $$
$$ p(h_{t+1}) = \int\limits_{x_t, h_t}\delta(h_{t+1}-f(x_t, h_t))\delta(x_t - \hat{x}_t)\delta(h_t - \hat{h}_t) \,dx_t \, dh_t $$

$$ p(h_{t+1}) = \delta(h_{t+1}-f(\hat{x}_t, \hat{h}_t))$$

and 

$$ p(h_{t+1}) = \int\limits_{x_t, h_t}\delta(h_{t+1}-f(x_t, h_t))\mathcal{N}\left(\begin{matrix} x_t\\ h_t \end{matrix}\middle|\begin{matrix} \hat{x}_t\\ \hat{h}_t \end{matrix},\delta\begin{pmatrix} I & 0\\ 0 & I \end{pmatrix}\right) \,dx_t \, dh_t $$

<script type="text/javascript">
function draw_ssm_indi(svg){

      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 100;
      var margin_y = 50;
      var markersize = 10;

      var hidden_ns = [];
      var state_ns = [];
      var output_ns = [];
      var edges = [];
      var T = 5;

      for (var t = 0; t<T;t++){


      	ind = "t"

      	if (t<2) ind+=(t-2)
      	if (t>2) ind+="+"+(t-2)


      	hidden_ns.push({title: "\\( h_{" + ind + "}\\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#FFFFFF"});

      	statefill = (t==2) ? "#e3e5feff" :statefill = "#FFFFFF";
        state_ns.push({title: "\\( x_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:statefill});



        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:""})
        	edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:""})
        }
      }

    estate_h = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    ehidden_h = {x: hidden_ns[T-1].x + 2*Math.sqrt(2)*radius, y: hidden_ns[T-1].y+ 2*Math.sqrt(2)*radius}

    estate_hh = {x: state_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    ehidden_hh = {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    

    bstate_h = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    bhidden_h = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}

    bstate_hh = {x: state_ns[0].x - radius*4, y: hidden_ns[0].y}
    bhidden_hh = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: estate_h, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: ehidden_h, dash:"5,5"})

    edges.push({source: state_ns[T-1], target: estate_hh, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: ehidden_hh, dash:"5,5"})



    edges.push({source: bstate_h, target: state_ns[0], dash:"5,5"})
    edges.push({source: bhidden_h, target: state_ns[0], dash:"5,5"})

    edges.push({source: bstate_hh, target: hidden_ns[0], dash:"5,5"})
    edges.push({source: bhidden_hh, target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + 2*dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }

</script>


<svg class="pgm_centered" onload="draw_ssm_indi(this);"></svg>

# Causality










<script src="{{ base.url | prepend: site.url }}/assets/js/d3_graphical_model.js"></script>

<script type="text/javascript" src="{{ base.url | prepend: site.url }}/assets/js/svg_mathjax.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_SVG"></script>
<script type="text/x-mathjax-config">

var mq = window.matchMedia( "(max-width: 570px)" );
if (!mq.matches) {
    MathJax.Hub.Config({
	  CommonHTML: { linebreaks: { automatic: true } },
	  "HTML-CSS": { linebreaks: { automatic: true } },
	         SVG: { linebreaks: { automatic: true } }
	}); 
} 

</script>
<script type="text/javascript">new Svg_MathJax().install();</script>














