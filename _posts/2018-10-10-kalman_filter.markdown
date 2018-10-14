---
layout: post
title:  "Derivation of the Kalman filter"
date:   2018-10-10 19:35:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
The concept and the equations of the [Kalman filter](https://en.wikipedia.org/wiki/Kalman_filter) can be quite confusing at the beginning. Often the assumptions are not stated clearly and the equations are just falling from the sky. This post is an attempt to derive the equations of the Kalman filter in a systematic and hopefully understandable way using [Bayesian inference](https://en.wikipedia.org/wiki/Bayesian_inference). It addresses everyone, who wants to get a deeper understanding of the Kalman filter and is equipped with basic knowledge of linear algebra and probability theory.
<!--more-->



<script type="text/javascript">
    function draw_ssm(svg){


      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 50;
      var margin_y = 50;
      var markersize = 10;

      var input_ns = [];
      var state_ns = [];
      var output_ns = [];
      var edges = [];
      var T = 5;

      for (var t = 0; t<T;t++){


      	if (t<T-1) input_ns.push({title: "\\( u_" + t + " \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#e3e5feff"});
        state_ns.push({title: "\\( x_" + t +" \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:"#FFFFFF"});
        output_ns.push({title: "\\( y_" + t + " \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});


        edges.push({source: state_ns[t], target: output_ns[t], dash:""})
        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: input_ns[t-1], target: state_ns[t], dash:""})
        }
      }

    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + 2*dist_y;

  	nodes = input_ns.concat(state_ns).concat(output_ns);
    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }

    function draw_ssm_ind(svg){


      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 120;
      var margin_y = 50;
      var markersize = 10;

      var input_ns = [];
      var state_ns = [];
      var output_ns = [];
      var edges = [];
      var T = 4;

      for (var t = 0; t<T;t++){


      	ind = "t"

      	if (t<T-1) ind+=(t-T+1)


      	if (t<T-1) input_ns.push({title: "\\( u_{" + ind + "}\\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#e3e5feff"});

      	statefill = (t==T-1) ? "#e3e5feff" :statefill = "#FFFFFF";
        state_ns.push({title: "\\( x_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:statefill});
        output_ns.push({title: "\\( y_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});



        edges.push({source: state_ns[t], target: output_ns[t], dash:""})
        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: input_ns[t-1], target: state_ns[t], dash:""})
        }
      }


    bstate_h = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    binput_h = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}

    edges.push({source: bstate_h, target: state_ns[0], dash:"5,5"})
    edges.push({source: binput_h, target: state_ns[0], dash:"5,5"})


  	nodes = input_ns.concat(state_ns).concat(output_ns);

  	var svg_w = margin_x + dist_x*(T-1) + 50;
    var svg_h = 2*margin_y + 2*dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }

    function draw_ssm_indi(svg){

      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 100;
      var margin_y = 50;
      var markersize = 10;

      var input_ns = [];
      var state_ns = [];
      var output_ns = [];
      var edges = [];
      var T = 5;

      for (var t = 0; t<T;t++){


      	ind = "t"

      	if (t<2) ind+=(t-2)
      	if (t>2) ind+="+"+(t-2)


      	input_ns.push({title: "\\( u_{" + ind + "}\\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#e3e5feff"});

      	statefill = (t==2) ? "#e3e5feff" :statefill = "#FFFFFF";
        state_ns.push({title: "\\( x_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:statefill});
        output_ns.push({title: "\\( y_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});



        edges.push({source: state_ns[t], target: output_ns[t], dash:""})
        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: input_ns[t-1], target: state_ns[t], dash:""})
        }
      }

    estate_h = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    bstate_h = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    einput_h = {x: input_ns[T-1].x + 2*Math.sqrt(2)*radius, y: input_ns[T-1].y+ 2*Math.sqrt(2)*radius}
    binput_h = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: estate_h, dash:"5,5"})
    edges.push({source: bstate_h, target: state_ns[0], dash:"5,5"})
    edges.push({source: input_ns[T-1], target: einput_h, dash:"5,5"})
    edges.push({source: binput_h, target: state_ns[0], dash:"5,5"})


  	nodes = input_ns.concat(state_ns).concat(output_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + 2*dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }

	function draw_ssm_obs(svg){


      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 50;
      var margin_y = 50;
      var markersize = 10;

      var input_ns = [];
      var state_ns = [];
      var output_ns = [];
      var edges = [];
      var T = 5;

      for (var t = 0; t<T;t++){


      	if (t<T-1) input_ns.push({title: "\\( u_" + t + " \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#e3e5feff"});
        state_ns.push({title: "\\( x_" + t +" \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:"#FFFFFF"});

        if (t==0||t==4) output_ns.push({title: "\\( y_" + t + " \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});
        if (t==2) {
        	output_ns.push({title: "\\( z_" + t + " \\)", type: "prob", x: margin_x + dist_x*(t+0.5) , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});
			output_ns.push({title: "\\( y_" + t + " \\)", type: "prob", x: margin_x + dist_x*(t-0.5) , y: margin_y+ 2*dist_y, fill:"#e3e5feff"});
        }
        



        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:""})
        	edges.push({source: input_ns[t-1], target: state_ns[t], dash:""})
        }
      }

      edges.push({source: state_ns[0], target: output_ns[0], dash:""})
      edges.push({source: state_ns[2], target: output_ns[1], dash:""})
      edges.push({source: state_ns[2], target: output_ns[2], dash:""})
      edges.push({source: state_ns[4], target: output_ns[3], dash:""})

  	nodes = input_ns.concat(state_ns).concat(output_ns);

    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + 2*dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);

    }
 </script>

<script src="//d3js.org/d3.v3.js" charset="utf-8"></script>

First of all, let's try to formulate the main idea of Kalman filtering in one sentence:

<div class="important_box"  markdown="1">
The **Kalman filter** is used to **infer** the current state of a **linear Gaussian state space model** given all observations and inputs up to the current timestep and a Gaussian prior distribution of the initial state. 
</div>

Indeed, the process of Kalman filtering is simply Bayesian inference in the domain of linear Gaussian state space models. The information encoded in our formulation is sufficient to uniquely define what the Kalman filter should output. But it doesn't tell us anything about how to compute it. In this article, we will find an efficient recursive method that will lead us to the familiar equations. 

Let's get started with the derivation by defining *linear Gaussian state space models* and *Bayesian inference*.

## Linear Gaussian state space models

A linear Gaussian state space model is defined by


$$ \begin{align}x_{t+1} &= A_tx_t + B_t u_t + w_t \\ 
y_t &= C_tx_t + v_t \end{align} $$

with state \\(x_t\\), output \\(y_t\\), input \\(u_t\\), system matrix \\(A_t\\), input matrix \\(B_t\\), output matrix \\(C_t\\), Gaussian process noise \\( w_t \sim \mathcal{N}(w_t\|0, Q_t) \\) and Gaussian observation noise \\( v_t \sim \mathcal{N}(v_t\|0, R_t) \\). 

Alternatively, we can use the probability density functions

$$  \begin{align}x_{t+1} &\sim \mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, Q_t)\\ 
 y_t &\sim \mathcal{N}(y_t|C_tx_t, R_t)\end{align}$$

to describe the system in a more compact fashion.


Linear Gaussian state space models can also be described in the language of [probabilistic graphical models](https://en.wikipedia.org/wiki/Graphical_model) (or more precisely in the language of [Bayesian networks](https://en.wikipedia.org/wiki/Bayesian_network)). The figure below shows such a model up to time \\(T = 4\\).



<svg class="pgm_centered" onload="draw_ssm(this);"></svg>


Every node represents a random variable and the edges are representing conditional dependencies between the respective nodes. Random variables, that are observed (or given) are shaded in light blue. In our case this is the output \\(y_t\\) and the input \\(u_t\\). The state \\(x_t\\) is not observed (or latent).

## Bayesian inference

In simplest terms Bayesian inference tries to update a hypothesis/belief of something, that is not directly observable, in the face of new information by using [Bayes' rule](https://en.wikipedia.org/wiki/Bayes%27_theorem). A bit more formal: The goal is to update the prior distribution \\(p(x)\\) given new data \\(\mathcal{D}\\) to obtain the posterior distribution \\(p(x\|\mathcal{D})\\) with help of Bayes rule

$$ p(x|\mathcal{D}) = \frac{p(\mathcal{D}|x)p(x)}{p(\mathcal{D})} $$

with likelihood \\(p(\mathcal{D}\|x)\\) and evidence \\(p(\mathcal{D})\\).

This idea is very general and can be applied to dynamical models quite easily. The most common inference tasks in dynamical models are filtering, smoothing and prediction. These methods differ only in the form of the posterior distribution.

* **Filtering**: What is my belief about the **current state** \\(x_t\\) given all observations and inputs?

<div class="big_eq"> 	$$ p(x_t|y_0,...,y_t,u_0,...,u_{t-1})  $$ </div>

* **Smoothing**: What is my belief about **all states** \\(x_t, ... ,x_0\\) given all observations and inputs?

<div class="big_eq" > $$ p(x_t,...,x_0|y_0,...,y_t,u_0,...,u_{t-1}) $$ </div>

* **Prediction**: What is my belief about the **next state** \\(x_{t+1}\\) given all observations and inputs?

<div class="big_eq"> $$ p(x_{t+1}|y_0,...,y_t,u_0,...,u_{t-1}) $$ </div>

The name Kalman *filter* reveals, that we will be interested in the filtering problem. Therefore, we want to infer the current state \\(x_t\\) based on all recent observations \\(y_0,...,y_t\\) and inputs \\(u_0,...,u_{t-1}\\).
Now that we have defined what we are looking for, let's try to find a way to efficiently calculate it. We will start by finding a recursive method for *general* dynamical models defined by the probabilistic graphical model above.

## Bayes filter for state space models

We have the task to calculate \\( p(x_{t}\|y_0,...,y_t,u_0,...,u_{t-1}) \\). For this purpose only the structure of the graphical model will matter: it governs the conditional dependencies.
To unclutter the notation we will use \\(\Box_{n:m}\\) for \\(\Box_n,...,\Box_m\\).

With help of **Bayes' rule** we can rewrite the formula as

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t,y_{0:t-1},u_{0:t-1})p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})}. $$

<div class="extra_box" markdown="1">
If you are not very familiar with Bayes' rule this can be quite confusing. There are much more moving parts than in the very simple definition. Nonetheless, there is an intuitive explanation.
It is Bayes' rule applied in a world, where we already observed \\(\mathcal{W}\\) in the past (every term is conditioned on \\(\mathcal{W}\\)):

$$ p(x|\mathcal{D},\mathcal{W}) = \frac{p(\mathcal{D}|x,\mathcal{W})p(x|\mathcal{W})}{p(\mathcal{D}|\mathcal{W})}. $$

In our case \\(x:=x_t \\), \\(\mathcal{D}:=y_t \\) and \\(\mathcal{W}:=(y_{0:t-1},u_{0:t-1}) \\).

</div>
We note that \\(y_t\\) is independent of \\(y_{0:t-1}\\) and  \\(u_{0:t-1}\\) given \\(x_t\\). It follows

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})}. $$

<div class="extra_box" markdown="1">
This conditional independence property is not obvious as well. When it comes to conditional dependencies, it is always a good idea to look at the graphical model. 

<svg class="pgm_centered" onload="draw_ssm_ind(this);"></svg>
In the figure above we notice that the node \\(x_t\\) is shaded (observed). This node blocks the way of \\(y_{0:t-1}\\) and  \\(u_{0:t-1}\\) to \\(y_t\\). We have proven the conditional independence _visually_. You can learn more about conditional independence in probabilistic graphical models in [Pattern Recognition and Machine Learning](https://www.microsoft.com/en-us/research/people/cmbishop/#!prml-book) (Chapter 8.2).
</div>
The denominator is simply the integral of the numerator 

$$ p(y_t|y_{0:t-1},u_{0:t-1}) = \int_{x_t} p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1}) dx_t .$$

Great! We successfully expressed our equation in simpler terms. In return, we obtained the new expression \\(p(x_t\|y_{0:t-1},u_{0:t-1})\\), which we have to calculate as well. Using marginalization we can express it as 

$$ p(x_t|y_{0:t-1},u_{0:t-1}) = \int_{x_{t-1}} p(x_t,x_{t-1}|y_{0:t-1},u_{0:t-1}) dx_{t-1}. $$ 

We can split the expression in the integral with product rule, which leads to 

$$p(x_t|y_{0:t-1},u_{0:t-1}) = \int_{x_{t-1}} p(x_t|x_{t-1},y_{0:t-1},u_{0:t-1})p(x_{t-1}|y_{0:t-1},u_{0:t-1}) dx_{t-1}.  $$

Note that \\(x_t\\) is independent of \\(y_{0:t-1}\\) and \\(u_{0:t-2}\\) given \\(x_{t-1}\\). Furthermore, \\(x_{t-1}\\) is independent of \\(u_{t-1}\\). We obtain

$$ p(x_t|y_{0:t-1},u_{0:t-1}) = \int_{x_{t-1}} p(x_t|x_{t-1}, u_{t-1})p(x_{t-1}|y_{0:t-1},u_{0:t-2}) dx_{t-1}. $$


We note that \\(p(x_{t-1}\|y_{0:t-1},u_{0:t-2})\\) has the same form as our expression we started from only shifted by one time step. Our recursive formula is complete!

Let's summarize our results!


<div class="important_box" markdown="1">
<h1>Bayes filter for state space models</h1>

The recursive formula for the Bayes filter in state space models consists of the **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} .$$

The recursion is started with the prior distribution over the initial state \\(p(x_0)\\).

</div>


Up to this point, we assumed that we obtain exactly one observation at every timestep. This rather limiting assumption is violated in many real-life scenarios. Multiple or even no observations per timestep are possible. This behavior is exemplified in the probabilistic graphical model below.

<svg class="pgm_centered" onload="draw_ssm_obs(this);"></svg>

Fortunately, handling these cases is very simple. For every observation we make, we calculate the update step with the newest estimate available. Furthermore, it is not necessary that the observations are coming from the same output function (illustrated by the outputs \\(y_2\\) and \\(z_2\\) at \\(t=2\\)). [Information integration/fusion](https://en.wikipedia.org/wiki/Information_integration) is very natural in Bayesian inference.




Nice! We just derived the equations of the Bayes filter for general state space models!
Now let's translate this into the linear state space scenario. 

## Bayes filter in linear Gaussian state space models

Let's start by identifying the probability distributions we already know: 


$$  \begin{align}
p(x_{t+1}|x_{t}, u_{t})  &= \mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, Q_t) \\
p(y_t|x_t) &=  \mathcal{N}(y_t|C_tx_t, R_t). 
 \end{align}$$




Furthermore, we assume that the prior distribution of the initial state is Gaussian as well. All probability distributions in our model are Gaussian. Therefore, the distributions \\(p(x_t\|y_{0:t-1},u_{0:t-1})\\) and \\(p(x_t\|y_{0:t},u_{0:t-1})\\) will also be in form of Gaussian distributions, because our recursive formula is only using marginalization and Bayes' rule, which are closed under Gaussian distributions. In the context of Kalman filtering, these are normally defined by


$$  \begin{align}
p(x_t|y_{0:t},u_{0:t-1}) &:= \mathcal{N}(x_{t}|\hat x_{t|t}, P_{t|t}) \\
p(x_t|y_{0:t-1},u_{0:t-1}) &:= \mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1}) .
 \end{align}$$


Please note, that these distributions are still implicitly dependent on the inputs and outputs. The mean and the covariance are a _sufficient statistic_ of the in- and outputs. 


The index \\(\Box_{n\|m}\\) of the parameters indicates that the state at time \\(n\\) is estimated, based on the outputs upto time \\(m\\).
The expression \\(\hat x_{t\|t}\\) is called the _updated_ state estimate and \\( P_{t\|t}\\) the _updated_ error covariance. Moreover, \\(\hat x_{t\|t-1}\\) is called the _predicted_ state estimate and \\( P_{t\|t-1}\\) the _predicted_ error covariance.

In summary, these are the equations for the Bayes filter in linear Gaussian state space models:
<div class="important_box" markdown="1">

**Prediction step**

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t})  = \int_{x_t}\mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, Q_t)\mathcal{N}(x_t|\hat x_{t|t}, P_{t|t}) dx_t.$$

**Update step**

$$ \mathcal{N}(x_{t}|\hat x_{t|{t}}, P_{t|t} ) = \frac{\mathcal{N}(y_{t}|C_tx_{t}, R_t )\mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1})}{\int_{x_{t}}\mathcal{N}(y_{t}|C_tx_{t}, R_t )\mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1}) dx_{t}}   $$ 

</div>

Let's try to simplify these equations!

### Prediction step

We will start with the prediction step

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t})  = \int_{x_t}\mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, Q_t)\mathcal{N}(x_t|\hat x_{t|t}, P_{t|t}) dx_t.$$

In order to find a closed form solution of this integral, we could simply plug in the corresponding expressions of the Gaussian distributions and solve the integral. Fortunately, Marc Toussaint already gathered the most important [Gaussian identities](https://ipvs.informatik.uni-stuttgart.de/mlr/marc/notes/gaussians.pdf), which will lighten our workload a lot.  To find an expression for our prediction step we can simply use the *propagation* formula (Formula 37, Toussaint)

$$ \int_{y}\mathcal{N}(x|a + Fy, A)\mathcal{N}(y|b,B) dx_t = \mathcal{N}(x|a + Fb, A + FBF^T ). $$

By comparison with our expression, we see that

$$ \hat x_{t+1|t} =  A_t \hat x_{t|t} + B_tu_t, $$


$$ P_{t+1|t} = Q_t + A_t P_{t|t} A_t^T  .$$

### Update step

We will start to simplify the update step 

$$ \mathcal{N}(x_{t}|\hat x_{t|{t}}, P_{t|t} ) = \frac{\mathcal{N}(y_{t}|C_tx_{t}, R_t )\mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1})}{\int_{x_{t}}\mathcal{N}(y_{t}|C_tx_{t}, R_t )\mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1}) dx_{t}}   $$ 

by focussing on the numerator first. We notice that we can rewrite it as a joint distribution (Formula 39, Toussaint)

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) .$$

Then again, this joint distribution can be rewritten as 

$$ \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}d\\e \end{matrix},\begin{matrix}D & F\\E^T & E\end{matrix}\right) = \mathcal{N}(y|e,E)\mathcal{N}(x|d + F^TE^{-1}(y-e),D - F^T E^{-1}F) .$$

We can combine the two previous equations to the following expression

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}(y|b + Fa,B + FA^TF^T) \mathcal{N}(x|a + A^TF^T(B + FA^TF^T)^{-1}(y-b -Fa),A - A^TF^T (B + FA^TF^T)^{-1}FA) .$$ 

By comparison with the numerator of our update step, we obtain

$$ \mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1})\mathcal{N}(y_{t}|C_tx_{t}, R_t ) = \mathcal{N}(y_{t}|C_t\hat x_{t|t},R_t + C_tP_{t|t-1}C_t^T)  \mathcal{N}(x_{t}|\hat x_{t|t-1} + P_{t|t-1}C_t^T(R_t + C_tP_{t|t-1}C_t^T)^{-1}(y_{t}-C_t\hat x_{t}),  P_{t|t-1} - P_{t|t-1}C_t^T (R_t + C_tP_{t|t-1}C_t^T)^{-1}C_tP_{t|t-1}). $$ 

At a first glance, this is not looking like a simplification at all. Conceptually, we only transformed 

$$ \frac{p(y|x)p(x)}{p(y)} \to \frac{p(y,x)}{p(y)} \to \frac{p(x|y)p(y)}{p(y)}. $$


If we look closely at the final expression, we see that \\(p(y)\\) is canceling out. Therefore, the result is simply the remaining part

$$ \mathcal{N}(x_{t}|\hat x_{t|{t}}, P_{t|t} ) = \mathcal{N}(x_{t}|\hat x_{t|t-1} + P_{t|t-1}C_t^T(R_t + C_tP_{t|t-1}C_t^T)^{-1}(y_{t}-C_t\hat x_{t}),P_{t|t-1} - P_{t|t-1}C_t^T (R_t + C_tP_{t|t-1}C_t^T)^{-1}C_tP_{t|t-1}). $$ 

If our reasoning is correct the denominator should be equal to \\(\mathcal{N}(y_{t}\|C_t\hat x_{t\|t},R_t + C_tP_{t\|t-1}C_t^T)\\), which was canceled out. The denominator can be simplified with the *propagation* formula (Formula 37, Toussaint)

$$ \int_{x_{t}}\mathcal{N}(y_{t}|C_tx_{t}, R_t )\mathcal{N}(x_{t}|\hat x_{t|t-1}, P_{t|t-1}) dx_{t} =  \mathcal{N}({y_{t}}|C_t\hat x_{t|t-1}, R_t + C_tP_{t|t-1}C_t^T ).$$

Yay! We see, that the denominator is exactly the same as the canceled factor in the numerator.

Let's summarize our results:

<div class="important_box" markdown="1">
<h1>Bayes filter in linear Gaussian state space models</h1>

The recursive formula for the Bayes filter in linear Gaussian state space models consists of the **prediction step**

$$ \begin{align}\hat x_{t+1|t} &=  A_t \hat x_{t|t} + B_tu_t \\ 
P_{t+1|t} &= Q_t + A_t P_{t|t} A_t^T  \end{align} $$


and the **update step**


$$ \begin{align}\hat x_{t|t} &= \hat x_{t|t-1} + P_{t|t-1}C_t^T(R_t + C_tP_{t|t-1}C_t^T)^{-1}(y_{t}-C_t\hat x_{t}) \\ 
P_{t|t} &= P_{t|t-1} - P_{t|t-1}C_t^T (R_t + C_tP_{t|t-1}C_t^T)^{-1}C_tP_{t|t-1}.  \end{align} $$


</div>
That's it! We derived the equations of the Bayes filter in linear Gaussian state space models, which is nothing else but the good old Kalman filter.
In the next section, we will split these equations up to finally obtain the formulation normally used for the Kalman filter.


## Kalman filter

In order to obtain the familiar equations of the Kalman filter we have to define

* **Innovation**

	$$ z_t = y_{t}-C_t\hat x_{t|t-1} $$

* **Innovation covariance**

	$$ S_t = R_t + C_tP_{t|t-1}C_t^T $$ 

* **Optimal Kalman gain**

	$$ K_t = P_{t|t-1}C_t^TS_t^{-1}  $$ 

<div class="extra_box" markdown="1">

**What is the meaning of \\(z_t\\) and \\(S_t\\)?**

The denominator of the update step is 

$$ \mathcal{N}(y_{t}|C_t\hat x_{t|t-1},R_t + C_tP_{t|t-1}^TC_t^T) $$

and can be transformed by (Formula 34, Toussaint)

$$ \mathcal{N}(x|a,A) = \mathcal{N}(x+f|a+f,A)  $$

to obtain the expression

$$ \mathcal{N}(y_{t} - C_t\hat x_{t|t-1}|0,R_t + C_tP_{t|t-1}^TC_t^T) = \mathcal{N}(z_t|0,S_t).  $$

Therefore, the innovation \\(z_t\\) is the derivation of the expected output and the observed output.
The random variable \\(z_t\\) has a Gaussian distribution with zero mean and variance \\(S_t\\).
</div>

Let's plug these definitions into the equations of our update step


$$ \hat x_{t|t} = \hat x_{t|t-1} + \underbrace{P_{t|t-1}C_t^T(\underbrace{R_t + C_tP_{t|t-1}C_t^T}_{S_t})^{-1}}_{K_t}(\underbrace{y_{t}-C_t\hat x_{t}}_{z_t}) $$

$$ P_{t|t} = P_{t|t-1} - \underbrace{P_{t|t-1}C_t^T(\underbrace{R_t + C_tP_{t|t-1}C_t^T}_{S_t})^{-1}}_{K_t}P_{t|t-1} .$$

This leads us to the final equations of the Kalman filter.

<div class="important_box" markdown="1">
<h1>Equations of the Kalman filter</h1>

The recursive formula for the Kalman filter consists of the **prediction step**

$$ \begin{align}\hat x_{t+1|t} &=  A_t \hat x_{t|t} + B_tu_t \\ 
P_{t+1|t} &= Q_t + A_t P_{t|t} A_t^T \end{align} $$


and the **update step**

$$ \begin{align}
z_t &= y_{t}-C_t\hat x_{t|t-1}\\
S_t &= R_t + C_tP_{t|t-1}C_t^T\\
K_t &= P_{t|t-1}C_t^TS_t^{-1} \\
\hat x_{t|t} &= \hat x_{t|t-1} + K_t z_t\\
P_{t|t} &= (I - K_tC_t)P_{t|t-1}.
\end{align} $$

</div>

## Summary

This article presented the derivation of the Kalman filter from first principles using Bayesian inference. The goal was to derive the Kalman filter in a clear and straightforward fashion. The steps were designed to be as atomic as possible, in order to be comprehensible for readers, who are not so familiar with the tools we used. Summarized, the derivation was performed in the following four subsequent steps: 

1. We realized, that we have to calculate \\( p(x_{t}\|y_0,...,y_t,u_0,...,u_{t-1}) \\).
2. Derived the recursive equations of the Bayes filter to efficiently calculate this distribution.
3. Inserted the corresponding distributions of the linear Gaussian state space model.
4. Added some "sugar" to obtain the usual equations of the Kalman filter.




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



