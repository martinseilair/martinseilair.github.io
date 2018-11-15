---
layout: post
title:  "Source of randomness and Markov madness"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
Probabilistic models are used massively in almost any field imaginable. In this short article, I will reason about the notion of randomness in a deterministic contexts.

Just some thoughts
<!--more-->

<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

In engineering, we often assume that some kinf of noise is acting on the system. This noise is treated as purely random. On the other hand, if we assume that the world is deterministic, or at least possible _true_ randomness from the quantum world has no impact on the macro world, something as noise shouldn't exist. 

<div class="important_box">

If the world is deterministic, why are we using the concept of randomness to describe the world?

</div>

This article argues, that if we have a probability distribution, the element of stochasticity always comes from a lack of knowledge.

# Deterministic model

Lets assume we have a deterministc system, that is described by the equation 

$$ y = f(x). $$

In this case \\(x\\) determines \\(y\\) or in other words, \\(x\\) causes \\(y\\). Let's assume we are in a setting, where we _know exactly_ that \\(x=\hat{x}\\). If we want the value of \\(y\\), we simply have to insert this value into our equation

$$ \hat{y} = f(\hat{x}), $$

to obtain the specific value of \\(\hat{y}\\).

We can use the [Dirac delta function](https://en.wikipedia.org/wiki/Dirac_delta_function) to formulate this process of insertion in a fancy way, by using the [sifting property](https://en.wikipedia.org/wiki/Dirac_delta_function#Translation). We can express it as 

$$ \int_x f(x) \delta_{\hat{x}}(x)\,dx = f(\hat{x}) = \hat{y}$$ 

where we use \\(\delta_{\hat{x}}(x)\\) as shorthand for \\(\delta(x-\hat{x})\\).

We can also formuate our deterministic model \\(y=f(x)\\) in the language of probability theory as a conditional distribution

$$ p(y|x) = \delta_{f(x)}(y). $$

Let's plug our \\(\hat{x}\\) again into our distribution.

With this new formulation how would plugging in \\(\hat{x}\\) would look like? We do again our trick with the Dirac delta function and obtain


$$ p(y) = \int_x \delta_{f(x)}(y) \delta_{\hat{x}}(x) \,dx. $$

If we look very closely, we notice that this expression has the form of a marginalization

$$ p(y) = \int_x p(y|x) p(x)\,dx.$$

The Dirac delta function encoding our input \\(\delta_{\hat{x}}(x)\\) can be interpreted as our _belief_ about the input. In our case, we are certain about the input! All probability mass will be at \\(x=\hat{x}\\).
But what will be the result of this marginalization? By using the sifting property again, we obtain

$$ p(y) = \delta_{f(\hat{x})}(y). $$


All the probability mass will is at the point where \\(y = f(\hat{x})\\) is satisfied.
This makes sense.

Up until now, we were sure about our input \\(\hat{x}\\).

Let's assume that we have no full knowledge of our input anymore, but only some belief of it that can be described by a belief distribution \\(p(x)\\).

It is not possible to input this distriubution directly into our deterministic function: it only takes single values of \\(x\\). But we can use our probabilistic interpreation to insert our belief distribution all at once

$$ p(y) = \int_x \delta_{f(x)}(y)p(x)\,dx.$$

In general, even if we have a deterministic \\(p(y\|x)\\), the resulting \\(p(y)\\) will not be a Dirac delta function anymore, but a belief distribution over y.

# Stochastic models

Up until now, we looked only at deterministic functions. Now let's take a look at stchastic models and what meaning they have in deterministic settings. For this purpose we will construct a stochastic from a deterministic function. Let's start

We are starting again the _deterministic_ model 

$$ y = f(x,h), $$

where we have the additional variable \\(h\\).

Now, let's assume that we _exactly know_ that \\(h = \hat{h}\\). We can plug \\(\hat{h}\\) into our equation and obtain the new equation

$$ y =  f(x,\hat{h}) = \hat{f}(x). $$

By inserting \\(\hat{h}\\), we have effectively reduced the dimensionality of our function. Our function is again only depend on one parameter.
Can we also formulate in the probabilistic setting? Yes, we can:


$$
\begin{align}
p(y|x) &= \int_h p(y|x,h) \delta_{\hat{h}}(h)\, dh \\
p(y|x) &= \int_h \delta_{f(x,h)}(y) \delta_{\hat{h}}(h)\, dh \\
p(y|x) &= \delta_{f(x,\hat{h})}(y). 
\end{align}
$$

But what happens, if we don't know our input \\(\hat{h}\\) _not exactly_ and have belief distriubtion \\(p(h)\\)?

By replacing the Dirac delta function \\(\delta_{\hat{h}}(h)\\) with \\(p(h)\\), we note that our formula is equivalent to a marginalization over \\(h\\).

$$ p(y|x) = \int_h p(y|x,h)p(h) \,dh.$$

Even if we have a deterministic function \\(p(y\|x,h)\\) we will obtain a stochastic model \\(p(y\|x)\\). We produced a stochastic model from an deterministic function. But where is the uncertainty coming from? We decided to get rid of the parameter \\(h\\). We did this by marginalizing over \\(h\\) but marginalization in this context is the same as insertion. We can insert a particular value \\(\hat{h}\\) and obtain again a deterministic function or insert a distribution over \\(h\\) and obtain a stochastic model. 

Therefore, the uncertainty comes from the lack of knowledge of the parameter \\(h\\). But even if our model is stochastic, the process itself is still deterministic.

What can we learn from it? If we have stochastic model, we **know** that we missed some hidden variables or left some on purpose.


# Markov processes
Now let's take a look at Markov processes, which are very widely used.

If a stochastic process 

$$ p(x_1, \ldots, x_T) $$

has the Markov property we have a Markov process. A stochastic process has the Markov property if the next state \\(x_{t+1}\\) is only conditionally dependend on the current state \\(x_t\\). In this case we can describe our model by

$$ p(x_0, \ldots, x_T) = p(x_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t). $$

We can visualize this stochastic process with the help of graphical models.

<svg class="pgm_centered" onload="draw_markov(this);"></svg>

You note that there are only arrows, which represent conditional dependencies, connecting adjacent nodes. We assume, that the particular conditional dependencies \\(p(x_{t+1}\|x_t)\\) are stochastic.



Let's use our findings from above and think about this uncertainty. We know, that we are still living in a determinsitic world. Therefore, we know that the uncertainty of \\(p(x_{t+1}\|x_t) \\) has to come from _hidden variables_. By "reversing" the marginalization that was done to obtain \\(p(x_{t+1}\|x_t) \\) we retrieve again the deterministic function of the system

$$ p(x_{t+1}|x_t, h_t). $$




Therefore, our next state \\(x_{t+1}\\) is not only depending on \\(x_t\\) but also on \\(h_t\\). 

We assume, that we are in a closed system, therefore, the hidden variables \\(h\\) will also be states of this closed system.

There will be a hidden _deterministic_ dynamic 

$$ p(h_{t+1}|x_t, h_t). $$


Therefore, our total process will be 

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|x_t, h_t). $$

Again, we can visualize this deterministic model as a probabilistic graphical model:


<svg class="pgm_centered" onload="draw_ssm_joint(this);"></svg>

We changed our model, let's check if the Markov property still holds.
We have to think about conditional dependencies in probabilistic graphical models. For this purpose, we can use D-separation. We are asking us, if \\(x_{t+1}\\) and \\(x_{t-1}\\) are conditionally independent given \\(x_t\\). Let's try to reason graphically.

<svg class="pgm_centered" onload="draw_ssm_hh_sh(this);"></svg>

In the figure, we see that the direct way over \\(x_t\\) is blocked, because \\(x_t\\) is observed. This path is drawn in red. On the other hand, we can reach \\(x_{t-1}\\) over the unobserved node \\(h_t\\). This path is shown in green. Therefore, \\(x_{t+1}\\) will be dependend not only on the current state \\(x_{t}\\), but also on \\(x_{t-1}\\) and all states before. By introducing the hidden variables \\(h\\) we lost the Markov property.

Ok, that is strange. Maybe, our assumptions about the connection between known and unknown dynamics where to strong. We can loose the assumptions, by assuming that the hidden state is only dependend on the last hidden state. But that the next state is still dependent on the hidden variable. We can formulate this as 

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|h_t). $$

Let's again check conditional dependencies using the corresponding graphical model.

<svg class="pgm_centered" onload="draw_ssm_hh(this);"></svg>

Again, we note that the direct way is blocked by the observed node \\(x_t\\). But we see, that \\(x_{t-1}\\) and \\(x_{t+1}\\) are connected through three hidden variable nodes. We still lost the Markov property.


Another assumption we could take is that the hidden state is only depending on the last state. The corresponding stochastic process can be forumulated as

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t, h_t)p(h_{t+1}|x_t) $$

If we take a look at the probabilistic graphical model of this system, we note again, that there is path connecting \\(x_{t-1}\\) and \\(x_{t+1}\\).
<svg class="pgm_centered" onload="draw_ssm_sh(this);"></svg>

There is one last case left. The hidden state has **no** dependencies at all. We can write this as

$$ p(x_0, \ldots, x_T,h_0, \ldots, h_T) = p(x_0)p(h_0) \prod_{t=1}^{T-1} p(x_{t+1}|x_t)p(h_{t}). $$

By taking a look at the graphical model
<svg class="pgm_centered" onload="draw_ssm(this);"></svg>

we can finally confirm, that the stochastic process has the Markov property again. There is no path connecting \\(x_{t-1}\\) and \\(x_{t+1}\\) that is not blocked.


But now we are facing a contradiction. We have deterministic system 

$$ (x_{t+1}, h_{t+1} ) = f(x_t, h_t) $$

that defines the next hidden state \\(h_{t+1}\\) deterministically. On the other hand, in order to keep the Markov property, we have to assume, that the nodes \\(h_t\\) are isolated and are not depending on the state before. We can describe this contradiction in mathematical terms. 


If we plug in determiinsitic inputs into

$$  h_{t+1} = f_h(x_t, h_t) $$

we will obtain an deterministic output

$$
\begin{align} p(h_{t+1}) &= \int\limits_{x_t, h_t}\delta_{f_h(x_t, h_t)}(h_{t+1})\delta_{\hat{x}_t}(x_t)\delta_{\hat{h}_t}(h_t) \,dx_t \, dh_t \\
p(h_{t+1}) &= \delta_{f_h(\hat{x}_t, \hat{h}_t)}(h_{t+1})
\end{align}
$$

in form of a Dirac delta function.

Now, let's assume that have an infitesimal uncertainty about our model, which we will model as 

$$ p(x_t, h_t) =  \mathcal{N}\left(\begin{matrix} x_t\\ h_t \end{matrix}\middle|\begin{matrix} \hat{x}_t\\ \hat{h}_t \end{matrix},\epsilon\begin{pmatrix} I & 0\\ 0 & I \end{pmatrix}\right), $$

where \\(\epsilon\\) is very close to \\(0\\). If we know plug this into our model

$$ \int\limits_{x_t, h_t}\delta_{f(x_t, h_t)}(h_{t+1})\mathcal{N}\left(\begin{matrix} x_t\\ h_t \end{matrix}\middle|\begin{matrix} \hat{x}_t\\ \hat{h}_t \end{matrix},\epsilon\begin{pmatrix} I & 0\\ 0 & I \end{pmatrix}\right) \,dx_t \, dh_t $$

the resulting \\(p(h_{t+1})\\) won't be dependend on the input \\(\hat{x}\\) and \\(\hat{z}\\). If you have at least a bit of uncertainty about your input, you can't tell anything about the following state.



This property is called [mixing](https://en.wikipedia.org/wiki/Mixing_(mathematics)). If we have an deterministic input, we will get an deterministic output. But if we are just slightly uncertain about our input, this will lead to completely random outputs, without any correlation to the input. Totally crazy.

An intuitive example is the mixing of two liquids like wine and water. If you know the exact configuration of the system, in this case the molecules of wine and water, you can determine the exact configuration at the end of the process. But if you have a small uncertainty about your initial state, you can't tell anything about the resulting state. If the behaviour is sensitive to small deviations of the initial conditions we have chaotic system.



<script type="text/javascript">
color_normal = "#333"
color_block = "#F00"
color_pass = "#0F0"




function draw_ssm_joint(svg){

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

      	statefill = "#FFFFFF";
        state_ns.push({title: "\\( x_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:statefill});

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 


        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"", color:ss_col })
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }




function draw_ssm_hh_sh(svg){

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

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 

        if(t==2){
        	sh_col = color_pass
        	ss_col = color_block
        }else if(t==3){
        	hs_col = color_pass
        	ss_col = color_block
        }

        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"", color:ss_col })
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }
function draw_ssm_hh(svg){

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

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 

        if(t==1){
        	hs_col = color_pass
        	hh_col = color_pass
        }else if(t==2){
        	ss_col = color_block
        	hh_col = color_pass
        }else if(t==3){
        	hs_col = color_pass
        	ss_col = color_block
        }

        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"", color:ss_col })
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	//edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    //edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    //edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }

function draw_ssm_sh(svg){

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

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 

        if(t==2){
        	sh_col = color_pass
        	ss_col = color_block
        }else if(t==3){
        	hs_col = color_pass
        	ss_col = color_block
        }

        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"", color:ss_col })
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	//edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    //edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    //edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }


function draw_ssm(svg){

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

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 

        if(t==2){
        	ss_col = color_block
        }else if(t==3){
        	ss_col = color_block
        }

        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"", color:ss_col })
        	edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	//edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	//edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    //edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    //edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    //edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    //edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }


function draw_markov(svg){

      var radius = 30;
      var dist_x = 120;
      var dist_y = 0;
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


      	//hidden_ns.push({title: "\\( h_{" + ind + "}\\)", type: "prob", x: margin_x + dist_x*t , y: margin_y , fill:"#FFFFFF"});

      	statefill = "#FFFFFF";
        state_ns.push({title: "\\( x_{" + ind + "} \\)", type: "prob", x: margin_x + dist_x*t , y: margin_y + dist_y, fill:statefill});

        ss_col = color_normal 
        sh_col = color_normal 
        hs_col = color_normal 
        hh_col = color_normal 

        if(t==2){
        	ss_col = color_block
        }else if(t==3){
        	ss_col = color_block
        }

        if (t>0) {
        	edges.push({source: state_ns[t-1], target: state_ns[t], dash:"" })
        	//edges.push({source: hidden_ns[t-1], target: state_ns[t], dash:"", color:hs_col })
        	//edges.push({source: state_ns[t-1], target: hidden_ns[t], dash:"", color:sh_col })
        	//edges.push({source: hidden_ns[t-1], target: hidden_ns[t], dash:"", color:hh_col })
        }
      }

    e_state_state = {x: state_ns[T-1].x + radius*4, y: state_ns[T-1].y}
    //e_hidden_hidden= {x: hidden_ns[T-1].x + radius*4, y: hidden_ns[T-1].y}
    
    //e_hidden_state = {x: hidden_ns[T-1].x +  radius*3.5, y: hidden_ns[T-1].y+ radius*3.5}
    //e_state_hidden = {x: state_ns[T-1].x + radius*3.5, y: state_ns[T-1].y- radius*3.5}

    

    b_state_state = {x: state_ns[0].x - radius*4, y: state_ns[0].y}
    //b_hidden_hidden = {x: hidden_ns[0].x - radius*4, y: hidden_ns[0].y}
    
    //b_hidden_state = {x: state_ns[0].x - 2*Math.sqrt(2)*radius, y: state_ns[0].y- 2*Math.sqrt(2)*radius}
    //b_state_hidden = {x: hidden_ns[0].x - 2*Math.sqrt(2)*radius, y: hidden_ns[0].y +2*Math.sqrt(2)*radius}


    edges.push({source: state_ns[T-1], target: e_state_state, dash:"5,5"})
    //edges.push({source: hidden_ns[T-1], target: e_hidden_state, dash:"5,5"})

    //edges.push({source: state_ns[T-1], target: e_state_hidden, dash:"5,5"})
    //edges.push({source: hidden_ns[T-1], target: e_hidden_hidden, dash:"5,5"})



    edges.push({source: b_state_state, target: state_ns[0], dash:"5,5"})
    //edges.push({source: b_hidden_state, target: state_ns[0], dash:"5,5"})

    //edges.push({source: b_hidden_hidden, target: hidden_ns[0], dash:"5,5"})
    //edges.push({source: b_state_hidden , target: hidden_ns[0], dash:"5,5"})


  	nodes = hidden_ns.concat(state_ns);
    var svg_w = 2*margin_x + dist_x*(T-1);
    var svg_h = 2*margin_y + 2*dist_y;

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);
    }


</script>





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














