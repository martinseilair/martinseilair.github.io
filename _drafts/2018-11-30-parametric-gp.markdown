---
layout: post
title:  "Generate 2D parametric curves with Gaussian processes"
date:   2018-11-30 08:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
In this post, I will try to give an intuitive introduction to the main idea of Gaussian processes and Gaussian process regression. With this knowledge we will build a small app to produce two dimensional parametric curves.
<!--more-->

<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/math.min.js" type="text/javascript"></script>




<defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgb(255,255,255);
      stop-opacity:0" />
      <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
    </radialGradient>
  </defs>


<script>
	function draw_pgm_gp(svg){


      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 50;
      var margin_y = 50;
      var markersize = 10;

      var nodes = [];
      var edges = [];

      var svg_w = 500;
      var svg_h = 300;


      var gp_node = {title: "\\( f \\)", type: "prob", x: svg_w/2.0 , y: margin_y, fill:"#e3e5feff"};

      var inducing_node = {title: "\\( f_I \\)", type: "prob", x: svg_w/2.0 + dist_x , y: margin_y + dist_y, fill:"#e3e5feff"};

      var testing_node = {title: "\\( f_T \\)", type: "prob", x: svg_w/2.0 - dist_x, y: margin_y + dist_y, fill:"#e3e5feff"};


    edges.push({source: gp_node, target: inducing_node, dash:""})
    edges.push({source: gp_node, target: testing_node, dash:""})


  	nodes.push(gp_node)
  	nodes.push(inducing_node)
  	nodes.push(testing_node)

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);

    }
 </script>

 <script>
	function draw_pgm_gp_diff(svg){


      var radius = 30;
      var dist_x = 120;
      var dist_y = 120;
      var margin_x = 50;
      var margin_y = 50;
      var markersize = 10;

      var nodes = [];
      var edges = [];

      var svg_w = 500;
      var svg_h = 400;


      var gp_node = {title: "\\( f \\)", type: "prob", x: svg_w/2.0 , y: margin_y, fill:"#e3e5feff"};

      var diff_node = {title: "\\( \\nabla f \\)", type: "prob", x: svg_w/2.0 + dist_x  , y: margin_y + dist_y, fill:"#e3e5feff"};


      var diff_ind_node = {title: "\\( \\nabla f_I \\)", type: "prob", x: svg_w/2.0 + dist_x  , y: margin_y + 2*dist_y, fill:"#e3e5feff"};

      var inducing_node = {title: "\\( f_I \\)", type: "prob", x: svg_w/2.0  , y: margin_y + dist_y, fill:"#e3e5feff"};

      var testing_node = {title: "\\( f_T \\)", type: "prob", x: svg_w/2.0 - dist_x, y: margin_y + dist_y, fill:"#e3e5feff"};


    edges.push({source: gp_node, target: inducing_node, dash:""})
    edges.push({source: gp_node, target: testing_node, dash:""})
    edges.push({source: gp_node, target: diff_node, dash:""})
    edges.push({source: diff_node, target: diff_ind_node, dash:""})


  	nodes.push(gp_node)
  	nodes.push(inducing_node)
  	nodes.push(diff_node)
  	nodes.push(diff_ind_node)
  	nodes.push(testing_node)

    create_graph(d3.select(svg), nodes, edges, radius, markersize, svg_w, svg_h);

    }
 </script>

First of all, let's define Gaussian process

<div class="important_box"  markdown="1">
A **Gaussian process** is a collection of random variables, such that any finite subset has a multivariate Gaussian distribution. 
</div>

In this article, these random variables are indexed by the continuous variable \\(x\\). In this case, a Gaussian process represents a distribution in function space.

In our context, we will notate our Gaussian processes

$$ \mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right) $$

is parameterized by the mean function \\(\mu(x)\\) and the covariance or kernel \\(k(x,x')\\).

In Gaussian process regression this Gaussian process is used as a prior distribution over the functional space. Given a *linear* observation model

$$ \mathcal{N}\left(g(y)\middle|\mathcal{C}f(x) + b(y),r(y,y')\right) $$

with linear operator \\(\mathcal{C}\\), affine function \\(b(y)\\) and covariance function \\(r(y,y')\\), we can perform Bayesian inference

$$ p(f(x)|g(y)) = \frac{\mathcal{N}\left(g(y)\middle|\mathcal{C}f(x) + b(y),r(y,y')\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right)}{\int_{f(x)} \mathcal{N}\left(g(y)\middle|\mathcal{C}f(x) + b(y),r(y,y')\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right) \,df(x)} $$

This will result in the posterior

$$ p(f(x)|g(y)) = \mathcal{N}\left(f(x)\middle|\hat{\mu}(x),\hat{k}(x,x')\right) $$

with 

$$ \begin{align}\hat{\mu}(x) &= \mu(x) + k\mathcal{C}^*(r + \mathcal{C}k\mathcal{C}^*)^{-1}(\hat{g}(y)-\mathcal{C}\mu(x) - b(y)) \\ 
\hat{k}(x,x') &= k - k\mathcal{C}^* (r + \mathcal{C}k\mathcal{C}^*)^{-1}\mathcal{C}k.  \end{align}, $$

where \\(\mathcal{C}^*\\) is the adjoint operator. One application of this framework is the Fourier transform.

But normally, you do not observe complete functions but rather a set of samples at specific points \\(x\\).	For this case, we only have to change our observation distribution:


$$ \mathcal{N}\left(f_I\middle|\mathcal{C}_If(x) + b_I,R_I\right). $$

We call our points where we have measurements for inducing points. We assume we have \\(N_I\\) inducing points \\(x_I = (x^I_1, ... , x^I_{N_I})\\).

The operator \\(\mathcal{C}_I\\) is defined as  

$$ \mathcal{C}_I^i f(x) = \int_x \delta(x-x^I_i) f(x) \,dx = f(x^I_i) $$

for \\( i \in [N_I]\\). 

We assume, that the observations are independent. Therefore, we define

$$ R_I = \beta_I I. $$




Therefore, the operator is discrete-continuous.
The effect of this operator is to select a finite set of points from a continous function.

$$ \mathcal{C}_I f(x) = \begin{pmatrix} f(x^I_1) \\ \vdots \\ f(x^I_{N_I}) \end{pmatrix} $$

Let's write down the joint distribution



$$ \mathcal{N}\left(f_I\middle|\mathcal{C}_If(x) + b_I,R_I\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right) = \mathcal{N}\left(\begin{matrix}f(x) \\ f_I\end{matrix}\middle|\begin{matrix}\mu(x) \\ \mathcal{C}_I\mu(x) + b_I\end{matrix},\begin{matrix}k(x,x') && k(x,x')\mathcal{C}^*_I \\ \mathcal{C}_Ik(x,x') && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I\end{matrix}\right)
=\mathcal{N}\left(\begin{matrix}f(x) \\ f_I\end{matrix}\middle|\begin{matrix}\mu(x) \\ \mathcal{C}_I\mu(x) + b_I\end{matrix},\begin{matrix}k(x,x') && k(x,x')\mathcal{C}^*_I \\ \mathcal{C}_Ik(x,x') && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I\end{matrix}\right) $$

What is the adjoint operator \\(\mathcal{C}^*_I\\) ? 

$$ 
\begin{align}
\langle \mathcal{C}_I f(x),y\rangle  &= \langle f(x),\mathcal{C}^*_Iy\rangle \\
\sum_{i=1}^{N_I} f(x^I_i)y_i &= \int_x f(x) \mathcal{C}^*_I y  \,dx \\
\sum_{i=1}^{N_I} f(x^I_i)y_i &= \int_x f(x) \sum_{i=1}^{N_I} \delta(x-x^I_i)  y_i  \,dx \\
\sum_{i=1}^{N_I} f(x^I_i)y_i &= \sum_{i=1}^{N_I}\int_x f(x)  \delta(x-x^I_i)    \,dx y_i \\
\sum_{i=1}^{N_I} f(x^I_i)y_i &= \sum_{i=1}^{N_I}f(x^I_i) y_i
\end{align}
$$

It follows 

$$ \mathcal{C}^*_Iy = \sum_{i=1}^{N_I} \delta(x-x^I_i)  y_i $$

Test points

$$ \mathcal{N}\left(f_T\middle|\mathcal{C}_Tf(x) + b_T,R_T\right)\mathcal{N}\left(f_I\middle|\mathcal{C}_If(x) + b_I,R_I\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right)
=\mathcal{N}\left(\begin{matrix}f(x) \\ f_I \\ f_T\end{matrix}\middle|\begin{matrix}\mu(x) \\ \mathcal{C}_I\mu(x) + b_I\\ \mathcal{C}_T\mu(x) + b_T\end{matrix},
\begin{matrix}
k(x,x') && k(x,x')\mathcal{C}^*_I && k(x,x')\mathcal{C}^*_T \\
\mathcal{C}_Ik(x,x') && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I && \mathcal{C}_Ik(x,x')\mathcal{C}^*_T \\
\mathcal{C}_Tk(x,x') && \mathcal{C}_Tk(x,x')\mathcal{C}^*_I && R_T +\mathcal{C}_Tk(x,x')\mathcal{C}^*_T 
\end{matrix}\right) $$


Marginalize out \\(f(x)\\)

$$ \mathcal{N}\left(\begin{matrix} f_I \\ f_T\end{matrix}\middle|\begin{matrix} \mathcal{C}_I\mu(x) + b_I\\ \mathcal{C}_T\mu(x) + b_T\end{matrix},
\begin{matrix}
R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I && \mathcal{C}_Ik(x,x')\mathcal{C}^*_T \\
\mathcal{C}_Tk(x,x')\mathcal{C}^*_I && R_T +\mathcal{C}_Tk(x,x')\mathcal{C}^*_T 
\end{matrix}\right) $$



Derivative inducing points

$$ \mathcal{N}\left(f_\nabla\middle|\mathcal{C}_\nabla \nabla f(x),R_\nabla\right)\mathcal{N}\left(\nabla f(x)\middle|\nabla f(x),0\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right)
=\mathcal{N}\left(
\begin{matrix}
f(x) \\ 
\nabla f(x) \\ 
\nabla f_T\end{matrix}\middle|\begin{matrix}
\mu(x) \\ 
\nabla\mu(x)\\ 
\mathcal{C}_\nabla\nabla\mu(x)
\end{matrix},
\begin{matrix}
k(x,x') && \nabla_{x'} k(x,x') && \nabla_{x'}k(x,x')\mathcal{C}^*_\nabla \\
\nabla_{x}k(x,x') && \nabla_{x}\nabla_{x'}k(x,x') &&  \nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^* \\
\mathcal{C}_\nabla \nabla_{x} k(x,x') && \mathcal{C}_\nabla \nabla_{x}\nabla_{x'}k(x,x') && R_\nabla +\mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla 
\end{matrix}\right) $$

Together with normal inducing and testing points

$$ \mathcal{N}\left(f_T\middle|\mathcal{C}_Tf(x) + b_T,R_T\right)\mathcal{N}\left(f_I\middle|\mathcal{C}_If(x) + b_I,R_I\right)\mathcal{N}\left(f_\nabla\middle|\mathcal{C}_\nabla \nabla f(x),R_\nabla\right)\mathcal{N}\left(\nabla f(x)\middle|\nabla f(x),0\right)\mathcal{N}\left(f(x)\middle|\mu(x),k(x,x')\right)
=\mathcal{N}\left(
\begin{matrix}
f(x) \\ 
\nabla f(x) \\ 
f_\nabla \\
f_I \\
f_T
\end{matrix}\middle|\begin{matrix}
\mu(x) \\ 
\nabla\mu(x)\\ 
\mathcal{C}_\nabla\nabla\mu(x) \\
\mathcal{C}_I\mu(x) + b_I\\ 
\mathcal{C}_T\mu(x) + b_T
\end{matrix},
\begin{matrix}
k(x,x') && \nabla_{x'} k(x,x') && \nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && k(x,x')\mathcal{C}_I^* && k(x,x') \mathcal{C}_T^* \\
\nabla_{x}k(x,x') && \nabla_{x}\nabla_{x'}k(x,x') &&  \nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^* && \nabla_{x}k(x,x')\mathcal{C}_I^* && \nabla_{x} k(x,x')\mathcal{C}_T^* \\
\mathcal{C}_\nabla \nabla_{x} k(x,x') && \mathcal{C}_\nabla \nabla_{x}\nabla_{x'}k(x,x') && R_\nabla +\mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_\nabla \nabla_{x} k(x,x') \mathcal{C}_I^* && \mathcal{C}_\nabla \nabla_{x} k(x,x')\mathcal{C}_T^* \\  
\mathcal{C}_Ik(x,x') && \mathcal{C}_I \nabla_{x'} k(x,x') && \mathcal{C}_I\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I && \mathcal{C}_Ik(x,x')\mathcal{C}_T^* \\
\mathcal{C}_Tk(x,x') && \mathcal{C}_T \nabla_{x'} k(x,x') && \mathcal{C}_T\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_Tk(x,x')\mathcal{C}^*_I && R_T +  \mathcal{C}_Tk(x,x')\mathcal{C}_T^*
\end{matrix}\right) $$


Marginalize out \\(f(x)\\) and \\(\nabla f(x) \\)

$$ \mathcal{N}\left(
\begin{matrix} 
f_\nabla \\
f_I \\
f_T
\end{matrix}\middle|\begin{matrix}
\mathcal{C}_\nabla\nabla\mu(x) \\
\mathcal{C}_I\mu(x) + b_I\\ 
\mathcal{C}_T\mu(x) + b_T
\end{matrix},
\begin{matrix}
 R_\nabla +\mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_\nabla \nabla_{x} k(x,x') \mathcal{C}_I^* && \mathcal{C}_\nabla \nabla_{x} k(x,x')\mathcal{C}_T^* \\  
\mathcal{C}_I\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I && \mathcal{C}_Ik(x,x')\mathcal{C}_T^* \\
\mathcal{C}_T\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_Tk(x,x')\mathcal{C}^*_I && R_T +  \mathcal{C}_Tk(x,x')\mathcal{C}_T^*
\end{matrix}\right) $$



Formulate distribution of \\(f_T\\) conditioned on \\(f_I\\) and \\(f_\nabla\\)




$$ \mathcal{N}\left(f_T\middle|\hat{\mu}(x),\hat{k}(x,x')\right) $$

$$ \hat{\mu}(x) = \mathcal{C}_T\mu(x) + b_T + \begin{pmatrix}
\mathcal{C}_\nabla \nabla_{x'}k(x,x')\mathcal{C}^*_T \\ \mathcal{C}_I k(x,x')\mathcal{C}^*_T
\end{pmatrix}^T\begin{pmatrix}
 R_\nabla +\mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_\nabla \nabla_{x} k(x,x') \mathcal{C}_I^* \\  
\mathcal{C}_I\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I 
\end{pmatrix}^{-1}\begin{pmatrix} 
f_\nabla -\mathcal{C}_\nabla\nabla\mu(x) \\
f_I - \mathcal{C}_I\mu(x) + b_I
\end{pmatrix}  $$

$$ \hat{k}(x,x') = R_T +  \mathcal{C}_Tk(x,x')\mathcal{C}_T^* - \begin{pmatrix}
\mathcal{C}_\nabla \nabla_{x'}k(x,x')\mathcal{C}^*_T \\ \mathcal{C}_I k(x,x')\mathcal{C}^*_T
\end{pmatrix}^T \begin{pmatrix}
 R_\nabla +\mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && \mathcal{C}_\nabla \nabla_{x} k(x,x') \mathcal{C}_I^* \\  
\mathcal{C}_I\nabla_{x'}k(x,x')\mathcal{C}^*_\nabla && R_I +  \mathcal{C}_Ik(x,x')\mathcal{C}^*_I 
\end{pmatrix}^{-1} \begin{pmatrix}
\mathcal{C}_\nabla \nabla_{x'}k(x,x')\mathcal{C}^*_T \\ \mathcal{C}_I k(x,x')\mathcal{C}^*_T
\end{pmatrix}  $$


Joint probability of derivatives

$$ \mathcal{N}\left(
\begin{matrix}
f(x) \\ 
\nabla f(x) \\ 
\nabla^2 f(x) \\
\nabla^3 f(x)
\end{matrix}\middle|\begin{matrix}
\mu(x) \\ 
\nabla\mu(x)\\ 
\nabla^2\mu(x) \\
\nabla^3\mu(x)
\end{matrix},
\begin{matrix}
k(x,x') && \nabla_{x'} k(x,x') && \nabla^2_{x'}k(x,x') && \nabla^3_{x'}k(x,x') \\
\nabla_{x}k(x,x') && \nabla_{x}\nabla_{x'}k(x,x') &&  \nabla_{x}\nabla^2_{x'}k(x,x') && \nabla_{x}\nabla^3_{x'}k(x,x') \\
\nabla^2_{x} k(x,x') && \nabla^2_{x}\nabla_{x'}k(x,x') && \nabla^2_{x}\nabla^2_{x'}k(x,x')&& \nabla^2_{x}\nabla^3_{x'}k(x,x') \\
\nabla^3_{x} k(x,x') && \nabla^3_{x}\nabla_{x'}k(x,x') && \nabla^3_{x}\nabla^2_{x'}k(x,x')&& \nabla^3_{x}\nabla^3_{x'}k(x,x') 
\end{matrix}\right) $$



$$ \begin{pmatrix}
I \\ 
\nabla_x  \\ 
\vdots \\
\nabla_x^{n-1}  \\
\nabla_x^n 
\end{pmatrix}^T
\begin{pmatrix}
I \\ 
\nabla_{x'}  \\ 
\vdots \\
\nabla_{x'}^{n-1}  \\
\nabla_{x'}^n 
\end{pmatrix}
k(x,x')
$$

Corresponding inducing points

$$ \mathcal{N}\left(
\begin{matrix}
f(x) \\ 
\nabla f(x) \\ 
\nabla^2 f(x) \\
\nabla^3 f(x) \\
f \\
f_\nabla \\
f_{\nabla^2} \\
f_{\nabla^3} 
\end{matrix}\middle|\begin{matrix}
\mu(x) \\ 
\nabla\mu(x)\\ 
\nabla^2\mu(x) \\
\nabla^3\mu(x)  \\
\mathcal{C}\mu(x) \\ 
\mathcal{C}_\nabla\nabla\mu(x)\\ 
\mathcal{C}_{\nabla^2}\nabla^2\mu(x) \\
\mathcal{C}_{\nabla^3}\nabla^3\mu(x)
\end{matrix},
\begin{matrix}
k(x,x') && \nabla_{x'} k(x,x') && \nabla^2_{x'}k(x,x') && \nabla^3_{x'}k(x,x') && 													k(x,x')\mathcal{C}^* && \nabla_{x'} k(x,x')\mathcal{C}_\nabla^* && \nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* \\
\nabla_{x}k(x,x') && \nabla_{x}\nabla_{x'}k(x,x') &&  \nabla_{x}\nabla^2_{x'}k(x,x') && \nabla_{x}\nabla^3_{x'}k(x,x') && 			\nabla_{x}k(x,x')\mathcal{C}^* && \nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^*  &&  \nabla_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \nabla_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* \\
\nabla^2_{x} k(x,x') && \nabla^2_{x}\nabla_{x'}k(x,x') && \nabla^2_{x}\nabla^2_{x'}k(x,x')&& \nabla^2_{x}\nabla^3_{x'}k(x,x') && 	\nabla^2_{x} k(x,x')\mathcal{C}^* && \nabla^2_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^*  && \nabla^2_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \nabla^2_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* \\
\nabla^3_{x} k(x,x') && \nabla^3_{x}\nabla_{x'}k(x,x') && \nabla^3_{x}\nabla^2_{x'}k(x,x')&& \nabla^3_{x}\nabla^3_{x'}k(x,x') && 	\nabla^3_{x} k(x,x')\mathcal{C}^* && \nabla^3_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^*  && \nabla^3_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \nabla^3_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* \\

\mathcal{C}k(x,x') && \mathcal{C}\nabla_{x'} k(x,x') && \mathcal{C}\nabla^2_{x'}k(x,x') && \mathcal{C}\nabla^3_{x'}k(x,x') 																		&&	R + \mathcal{C}k(x,x')\mathcal{C}^* && \mathcal{C}\nabla_{x'} k(x,x')\mathcal{C}_\nabla^* && \mathcal{C}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \mathcal{C}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* \\
\mathcal{C}_\nabla\nabla_{x}k(x,x') && \mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x') &&  \mathcal{C}_\nabla\nabla_{x}\nabla^2_{x'}k(x,x') && \mathcal{C}_\nabla\nabla_{x}\nabla^3_{x'}k(x,x') 	&&	\mathcal{C}_\nabla\nabla_{x}k(x,x')\mathcal{C}^* && R_\nabla + \mathcal{C}_\nabla\nabla_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^* &&  \mathcal{C}_\nabla\nabla_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^* && \mathcal{C}_\nabla\nabla_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^*\\
\mathcal{C}_{\nabla^2}\nabla^2_{x} k(x,x') && \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla_{x'}k(x,x') && \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla^2_{x'}k(x,x')&& \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla^3_{x'}k(x,x') 																																		 	&& \mathcal{C}_{\nabla^2}\nabla^2_{x} k(x,x')\mathcal{C}^* && \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^* && R_{\nabla^2} + \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^*&& \mathcal{C}_{\nabla^2}\nabla^2_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^* 																																		 	 \\
\mathcal{C}_{\nabla^3}\nabla^3_{x} k(x,x') && \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla_{x'}k(x,x') && \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla^2_{x'}k(x,x')&& \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla^3_{x'}k(x,x') 																																			&& \mathcal{C}_{\nabla^3}\nabla^3_{x} k(x,x')\mathcal{C}^* && \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla_{x'}k(x,x')\mathcal{C}_\nabla^* && \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla^2_{x'}k(x,x')\mathcal{C}_{\nabla^2}^*&& R_{\nabla^3} +  \mathcal{C}_{\nabla^3}\nabla^3_{x}\nabla^3_{x'}k(x,x')\mathcal{C}_{\nabla^3}^*
\end{matrix}\right) $$




$$ \bar{\nabla}_x = \begin{pmatrix}
I \\ 
\nabla_x  \\ 
\vdots \\
\nabla_x^n 
\end{pmatrix}
$$

$$ \mathcal{C}_f = \begin{pmatrix}
\mathcal{C} &&  && 0 \\ 
 &&  \ddots &&  \\ 
0 && && \mathcal{C}_{\nabla^n}
\end{pmatrix}
$$


$$ \mathcal{N}\left(
\begin{matrix}
\bar{\nabla}_x f(x) \\
f_{\bar{\nabla}_x} \\
t_{\bar{\nabla}_x}
\end{matrix}\middle|
\begin{matrix}
\bar{\nabla}_x\mu(x) \\
\mathcal{C}_{f}\bar{\nabla}_x\mu(x) \\
\mathcal{C}_{t}\bar{\nabla}_x\mu(x)
\end{matrix}
,
\begin{matrix}
\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x') &&  \bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{f}^* && \bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{t}^*\\
\mathcal{C}_{f}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x') && R_{f} + \mathcal{C}_{f}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{f}^* && \mathcal{C}_{f}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{t}^* \\
\mathcal{C}_{t}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x') &&  \mathcal{C}_{t}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{f}^* && R_{t} + \mathcal{C}_{t}\bar{\nabla}_x^T\bar{\nabla}_{x'}k(x,x')\mathcal{C}_{t}^*
\end{matrix}
\right) $$







<svg class="pgm_centered" onload="draw_pgm_gp(this);"></svg>


<svg class="pgm_centered" onload="draw_pgm_gp_diff(this);"></svg>


GP prior


Inducing points \\((f(x_i),x_i)\\)

$$ \mathcal{N}\left(f_I\middle|Af(x),c(x,x')\right) $$

with \\( A_i = \delta(x - x_i)  \\)

Testing points \\((x_j)\\)

$$ \mathcal{N}\left(f^*\middle|Bf(x),d(x,x')\right) $$

with \\( B_j = \delta(x - x_j)  \\)


Derivative 

$$ \mathcal{N}\left(\frac{df}{dt}\middle|\frac{d}{dt} f(x), e(x,x')\right) $$

Derivative points \\((\frac{df(x_d)}{dt},x_d)\\)

$$ \mathcal{N}\left(\frac{df}{dt}\middle|C\frac{df(x_d)}{dt},d(x,x')\right) $$




Joint probability



$$ \mathcal{N}(x_{0:T}|\mu,\Sigma) = \mathcal{N}\left(\begin{matrix}f(x) \\ f_I \end{matrix}\middle|\begin{matrix}\mu(x) \\  A\mu(x) \end{matrix},\begin{matrix}k(x,x') & c(x,x')k(x,x') \\ c(x,x')k(x,x') &  c(x,x')k(x,x')c(x,x') \end{matrix}\right) $$ 



<div id="fourier"></div>

<div id="yx"></div>

<div id="yy"></div>




<script type="text/javascript">



// define path

var points = [];
var r_0 = 7;
var r = 4;
var y = {x: [], y: []};
var T = 5;


var svg;
var path;


var width = 500;
var height = 300;

var cs;

gppc = null;

sigma = 15.0;
l = 0.2;

function squared_exp_kernel(x,xd){
	return sigma*sigma*Math.exp(-(x-xd)*(x-xd)/(2*l*l));
}




function reset(){
	d3.select('#fourier').selectAll("svg").remove();


	points = [];
	y = {x: [], y: []};

	svg = d3.select('#fourier').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + width +  " " + height)
			.on("mousedown", click)

	cs = svg.append("g")
			.attr("transform","translate(" + width/2.0 + "," + height/2.0 + ")")

	path = cs.append("path");


	// initialize gps 
	gppc = new GaussianProcessParametricCurve([squared_exp_kernel]);

	// define start and end point
	ds = [[-width/4.0],[0]];
	fs = [[true],[true]];
	ts = 0;

	d1 = [[-width/4.0],[0]];
	f1 = [[true],[true]];
	t1 = 0;

	de = [[width/4.0],[0]];
	fe = [[true],[true]];
	te = 1;

	// add observations
	gppc.new_observation([[-width/4.0],[0]], [[true],[true]], 0);

	gppc.new_observation([[-width/8],[height/3]], [[true],[true]], 0.25);

	gppc.new_observation([[0.0],[height/4]], [[true],[true]], 0.5);

	gppc.new_observation([[width/8],[-height/3]], [[true],[true]], 0.75);

	gppc.new_observation([[-width/4.0],[height/4]], [[true],[true]], 1);



	// create sample points
	n = 100;
	var ps = [...Array(n)].map((e,i)=>i/(n-1))


	gppc.compute_posterior(ps)


	var mus = gppc.get_mu();
	var Ks = gppc.get_K();
	var xs = gppc.get_points();



	var mup = [];
	for (var i = 0; i<mus[0]._data.length; i++){
		mup.push([mus[0]._data[i][0], mus[1]._data[i][0]]);
	}

	var sigmas = [];
	for (var i = 0; i<mus[0]._data.length; i++){
		sigmas.push([mup[i][0], mup[i][1], Ks[0]._data[i][i], Ks[1]._data[i][i]]);
	}


	cs.selectAll("circle")  // For new circle, go through the update process
	.data(xs)
	.enter()
	.append("circle")
	.attr("cx", function(d) { return d[0]; })
	.attr("cy", function(d) { return d[1]; })  // Get attributes from circleAttrs var
	.style("fill", function(d,i) { return "#000"; })
	.attr("r", function(d,i) { return r; }) // Get attributes from circleAttrs var

	cs.selectAll("ellipse")  // For new circle, go through the update process
	.data(sigmas)
	.enter()
	.append("ellipse")
	.attr("cx", function(d) { return d[0]; })
	.attr("cy", function(d) { return d[1]; })  // Get attributes from circleAttrs var
	.attr("rx", function(d) { return d[2]; }) // Get attributes from circleAttrs var
	.attr("ry", function(d) { return d[3]; }) // Get attributes from circleAttrs var
	.style("fill", function(d,i) { return "#000"; })
	.style("opacity",0.05)
	path = path.data([mup])
    path.attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'steelblue')
        .style('fill', 'none');
    path.enter().append('svg:path').attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'steelblue')
        .style('fill', 'none');
    path.exit().remove()	


}

class GaussianProcess{

	constructor(kernels){
		this.data = [];
		this.kernels = kernels;
		this.mu = [];
		this.K
	}

	update(data){
		this.data = data;
	}

	compute_K(x, xd){
		var K = math.zeros(x.length, xd.length) 
		for (var i = 0; i<x.length; i++){
			for (var j = 0; j<xd.length; j++){
				K._data[i][j] = this.kernels[0](x[i],xd[j]);
			}
		}
		return K;
	}

	compute_posterior(p){
		var x = [];
		var f = [];

		for (var i = 0; i<this.data.length; i++){
			x.push(this.data[i].t)
			f.push(this.data[i].d[0]) 
		}

		var kxx = this.compute_K(x, x)
		var kpx = this.compute_K(p, x) 
		var kxp = this.compute_K(x, p) 
		var kpp = this.compute_K(p, p) 


		this.mu = math.multiply(kpx,math.lusolve(kxx,f));
		this.K = math.subtract(kpp, math.multiply(kpx,math.inv(kxx),kxp));

	}

	sample(){

	}
}



class GaussianProcessParametricCurve{

	constructor(kernels){
		this.gp_x = new GaussianProcess(kernels);
		this.gp_y = new GaussianProcess(kernels);
		this.gp_x_data = [];
		this.gp_y_data = [];
	}

	new_observation(d, f, t){
		this.gp_x_data.push({d: d[0], f:f[0], t: t});
		this.gp_y_data.push({d: d[1], f:f[1], t: t});
		this.gp_x.update(this.gp_x_data);
		this.gp_y.update(this.gp_y_data);

		return [this.gp_x_data.length-1, this.gp_y_data.length-1];
	}

	update_observation(d, f, t, i){
		this.gp_x_data[i] = {d: d[0], f:f[0], t: t};
		this.gp_y_data[i] = {d: d[1], f:f[1], t: t};
		this.gp_x.update(this.gp_x_data)
		this.gp_y.update(this.gp_y_data)
	}

	compute_posterior(ps){
		this.gp_x.compute_posterior(ps);
		this.gp_y.compute_posterior(ps);
	}

	sample(){
		this.gp_x.sample();
		this.gp_y.sample();
	}

	get_mu(){
		return [this.gp_x.mu, this.gp_y.mu];
	}

	get_K(){
		return [this.gp_x.K, this.gp_y.K];
	}

	get_points(){
		var points = [];
		for (var i = 0; i<this.gp_x.data.length; i++){
			points.push([this.gp_x.data[i].d[0], this.gp_y.data[i].d[0]]) 
		}	
		return points;
	}

}



function update_path(){


}



function click_circ(i){
	svg.on("mousedown",null)
	points.push(points[0]);
	update_path();
	calc_y();
	draw_components();

	svg.selectAll("circle").remove()
}

function dist(x1,x2){

	return Math.sqrt((x1[0]-x2[0])*(x1[0]-x2[0]) + (x1[1]-x2[1])*(x1[1]-x2[1]) );
}

function calc_y(){
	// compute distances

	time = [];
	time.push(0);
	var total_dist = 0;
	var d;
	for(var i=0; i<points.length-1; i++){
		d = dist(points[i],points[i+1]);
		total_dist+=d
		time.push(d)
	}

	// total time
	for(var i=1; i<points.length; i++){
		time[i] = time[i-1] + time[i]*T/total_dist;
	}




	for(var i=0; i<points.length; i++){
		y.x.push(points[i][0]-points[0][0])
	}

	for(var i=0; i<points.length; i++){
		y.y.push(points[i][1]-points[0][1])
	}

	NP = time.length;

}

function draw_components(){

	pxmax = Math.max.apply(Math, y.x);
	pxmin = Math.min.apply(Math, y.x);
	// compute function
	var px = [];
	for(var i=0; i<y.x.length;i++){
		px.push([time[i],(y.x[i]-pxmin)/(pxmax-pxmin)])
	} 

	var svgyx = d3.select('#yx').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + T +  " " + (pxmax-pxmin)/(pxmax-pxmin))


	var pathyx = svgyx.append("path");


	pathyx = pathyx.data([px])
    pathyx.attr('d', function(d){return line(d)})
        .style('stroke-width', 0.01)
        .style('stroke', 'steelblue')
        .style('fill', 'none');	

	pymax = Math.max.apply(Math, y.y);
	pymin = Math.min.apply(Math, y.y);
	// compute function
	var py = [];
	for(var i=0; i<y.y.length;i++){
		py.push([time[i],(y.y[i]-pymin)/(pymax-pymin)])
	} 

	var svgyy = d3.select('#yy').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + T +  " " + (pymax-pymin)/(pymax-pymin))


	var pathyy = svgyy.append("path");


	pathyy = pathyy.data([py])
    pathyy.attr('d', function(d){return line(d)})
        .style('stroke-width', 0.01)
        .style('stroke', 'steelblue')
        .style('fill', 'none');	

}



function click(){
	var coords = d3.mouse(this);

	points.push(coords);   // Push data to our array

	svg.selectAll("circle")  // For new circle, go through the update process
		.data(points)
		.enter()
		.append("circle")
		.attr("cx", function(d) { return d[0]; })
		.attr("cy", function(d) { return d[1]; })  // Get attributes from circleAttrs var
		.style("fill", function(d,i) { return "#000"; })
		.attr("r", function(d,i) { return r; })
		.on("mousedown", function(d,i) { if(i==0)click_circ(i)})  // Get attributes from circleAttrs var

	update_path();



}

var line = d3.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })


reset();







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