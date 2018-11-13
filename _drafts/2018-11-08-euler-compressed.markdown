---
layout: post
title:  "Euler's equation: Compression"
date:   2018-11-08 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---

<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/euler/mechanical_system.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/euler/springmass.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/euler/springmassdamper.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/euler/rigidbody.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/euler/point_renderer.js"></script>


<script src="{{ base.url | prepend: site.url }}/assets/js/euler/utils.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/math.min.js" type="text/javascript"></script>
    
<style>
svg { border: 1px solid black; }
</style>





<script src="https://unpkg.com/delaunator@3.0.2/delaunator.js"></script>

<div id="smd" style="width:100%"></div>
<div id="rb" style="width:100%"></div>

<script type="text/javascript">

// window size
var width = 500;
var height = 300;

// ball radius
var radius = 10;

// mass per point
var m = 100;

// initialize points
var points = [];
var edges = [];
if(false){
	var N = 12;
	points = [...Array(N)].map(()=> {return [width/2*(Math.random()+0.5),height/2*(Math.random()+0.5), m]})

	// create springs with delaunay
	const delaunay = Delaunator.from(points);


	var rest_length;
	for (let e = 0; e < delaunay.triangles.length; e++) {
	    if (e > delaunay.halfedges[e]) {
			p0 = delaunay.triangles[e];
			p1 = delaunay.triangles[nextHalfedge(e)];
			rest_length = dist(points[p0], points[p1])+ Math.random()*0;
	        edges.push([delaunay.triangles[e], delaunay.triangles[nextHalfedge(e)], rest_length])
	    }
	}
}else{
	var gw = 3;
	var gh = 4;

	var gx = 50;
	var gy = 50;
	var N = gw*gh;
	for (var i=0; i<gw;i++){
		for (var j=0; j<gh;j++){
			points.push([100.0 + i*gx,100.0 + j*gy, m])
		}
	}

	// add springs
	var rest_x = gx;
	var rest_y = gy;
	var rest_d = norm([gx, gy]);

	// add horizontal and vertical springs
	for (var i=0; i<gw;i++){
		for (var j=0; j<gh;j++){
			cp = j+ i*gh;

			// to the right
			if(i<gw-1){
				edges.push([cp , cp + gh, rest_x])
			}

			// to the bottom
			if(j<gh-1){
				edges.push([cp , cp + 1, rest_y])
			}

			// diagonal right
			if((i<gw-1)&&(j<gh-1)){
				edges.push([cp , cp + gh + 1, rest_d])
			}

			// diagonal left
			if((i>0)&&(j<gh-1)){
				edges.push([cp , cp - gh + 1, rest_d])
			}
			
		}
	}

	console.log(edges)


}





// initial state
state = math.zeros(4*N);
u = math.zeros(2*N);

for (var i=0; i<points.length;i++){
	state._data[i*2] = points[i][0];
	state._data[i*2+1] = points[i][1];
	//state._data[2*N+2*i] = 500;
	//state._data[2*N+2*i+1] = -300;
}

smd = new SpringMassDamper(points, edges, radius, width, height);
smd.init_renderer("smd")
smd.start(state)


//state = math.matrix([width/2.0, height/2.0, Math.PI/6.0, 0.0, 0.0, 0.0])
rb = new RigidBody(points, edges, radius, width, height);
rb.init_renderer("rb")

// draw
foo = rb.state;

//foo._data[3] = 300.0;
//foo._data[4] = 300.0;
//foo._data[5] = Math.PI/6.0;
//rb.pr.update(rb.state_to_points(foo))
rb.start(foo)



</script>


https://cs.nyu.edu/~dzorin/numcomp08/springs_notes.pdf




$$
\begin{pmatrix}
m_1 & &  \\
 & \ddots & \\
 & & m_N \\
\end{pmatrix}
\begin{pmatrix}
\ddot{x}_1 \\
\vdots \\
\ddot{x}_N
\end{pmatrix}

+

K(x)
= 

\begin{pmatrix}
u_1 \\
\vdots \\
u_N
\end{pmatrix}
$$

We can also write this as 

$$ M\ddot{x} + Kx = u. $$

Stiffness matrix is symmetric and positive semidefinite.

We assume, that all masses are positive. We can write the equation as:

$$ \ddot{x} + M^{-1}Kx = M^{-1}u. $$

$$ \ddot{x}  = -M^{-1}Kx + M^{-1}u. $$

Now we can transform this second order ordinary differential equation into a first order ode

$$ 

\begin{pmatrix}
\ddot{x} \\
\dot{x}
\end{pmatrix}
 = 

\begin{pmatrix}
0 & -M^{-1}K \\
I & 0
\end{pmatrix}


\begin{pmatrix}
\dot{x} \\
x
\end{pmatrix}

+ 

\begin{pmatrix}
M^{-1} \\
0
\end{pmatrix}
u

$$

We can introduce the new variables

$$ A = \begin{pmatrix}
0 & -M^{-1}K \\
I & 0
\end{pmatrix}
$$

and 

$$ B = \begin{pmatrix}
M^{-1} \\
0
\end{pmatrix} $$

to arrive at the formula


$$ \dot{x} = Ax + Bu $$

which is the defintion of a linear state space model.




The solution of this differential equations is defined by

$$ x(t) = e^{At}x(0) + \int\limits_0^t e^{A(t-\tau)}Bu(\tau)\,d\tau. $$

We want to work with discrete time steps to simplify the treatment. We choose discete time points \\(t_k\\) with 

$$ t_{k+1} - t_k = T $$


What is the value of the state at \\(t_{k+1}\\)?

$$ 
\begin{align}
x(t_{k+1}) &= e^{At_{k+1}}x(0) + \int\limits_0^{t_{k+1}} e^{A(t_{k+1}-\tau)}Bu(\tau)\,d\tau \\
x(t_{k+1}) &= e^{AT}e^{At_{k}}x(0) + \int\limits_0^{t_k} e^{A(t_k + T-\tau)}Bu(\tau)\,d\tau + \int\limits_{t_k}^{t_{k+1}} e^{A(t_{k+1}-\tau)}Bu(\tau)\,d\tau \\ 
x(t_{k+1}) &= e^{AT}e^{At_{k}}x(0) + e^{AT}\int\limits_0^{t_k} e^{A(t_k-\tau)}Bu(\tau)\,d\tau - \int\limits_{t_{k+1} - t_k}^{t_{k+1} - t_{k+1}} e^{Ar}Bu(t_{k+1} - r)\,dr\\ 
x(t_{k+1}) &= e^{AT}\underbrace{\left(e^{At_{k}}x(0) + \int\limits_0^{t_k} e^{A(t_k-\tau)}Bu(\tau)\,d\tau\right) }_{x(t_k)} + \int\limits_0^{T} e^{Ar}Bu(t_{k+1} - r)\,dr \\ 
\end{align}
 $$

 Furthermore we assume, that our input function is a step function, with constant values between \\(t_k\\) and \\(t_{k+1}\\). In this the discretization is not an approximation but will yield the correct state sequence.

$$
x(t_{k+1}) = e^{AT}x(t_k) + \int\limits_0^{T} e^{Ar}\,dr \, Bu_k
$$

We arrive at

$$
x_{t+1} = Ax_t + Bu_t
$$

with 

$$ A = e^{AT} $$

and

$$ B = \int\limits_0^{T} e^{Ar}\,dr \, B. $$

How can we calcualte \\(A\\) and \\(B\\)?

We can calculate \\(A\\) by looking at the series representation of the matrix exponential.


$$ A = e^{AT} = \sum_{k=0}^{\infty} \frac{A^kT^k}{k!} = I + \frac{AT}{1}+ \frac{A^2T^2}{2} + \ldots $$

Therefore, we have to calculate the all the matrix powers. Our matrix has anti-diagonal form.

$$ A = \begin{pmatrix}
0 & C \\
I & 0
\end{pmatrix}
$$


$$ A^2 = \begin{pmatrix}
C & 0 \\
0 & C
\end{pmatrix}
$$

$$ A^3 = \begin{pmatrix}
0 & C^2 \\
C & 0
\end{pmatrix}
$$

$$ A^4 = \begin{pmatrix}
C^2 & 0 \\
0 & C^2
\end{pmatrix}
$$

$$ A^5 = \begin{pmatrix}
0 & C^3 \\
C^2 & 0
\end{pmatrix}
$$

and so on.


The Matrix exponential becomes


$$ e^{AT} = \begin{pmatrix}
I + \frac{CT^2}{2} + \frac{C^2T^4}{24} + \ldots & \frac{CT}{1} + \frac{C^2T^3}{6}+ \ldots\\
\frac{IT}{1} + \frac{CT^3}{6} + \frac{C^2T^5}{120} + \ldots & I + \frac{CT^2}{2} + \frac{C^2T^4}{24} + \ldots
\end{pmatrix}.
$$

We can express 





We can express this with

$$ e^{AT} = \begin{pmatrix}
\cos \left(\sqrt{A}T\right) & A\left(\sqrt{A}\right)^{-1}\sin \left(\sqrt{A}\right) \\
\left(\sqrt{A}t\right)^{-1}\sin \left(\sqrt{A} \right) & \cos \left(\sqrt{A}T\right)
\end{pmatrix}
$$





Now that we have out model, we can add a noise term \\(w_t \sim \mathcal{N}\left(w_t\middle\| 0,\delta I\right)\\) and obtain

 $$ x_{t+1} = Ax_t + Bu_t + w_t $$



 We can represent this also as 

 $$ x_{t+1} \sim p(x_{t+1}|x_t,u_t) =  \mathcal{N}\left(x_{t+1}\middle| Ax_t + Bu_t,\delta I\right) .$$


$$ p(x_{0:T}|u_{0:T}) = p(x_0)\prod\limits_{t=0}^{T-1} p(x_{t+1}|x_t,u_t) $$

If we assume, that the spring are infinitely stiff and we have zero noise, we can decribe the complete system as

$$
\begin{pmatrix}
mI &  0 \\ 
0 &  \Theta_c  \\
\end{pmatrix}
\begin{pmatrix}
\ddot{x}_c \\
\ddot{\phi}
\end{pmatrix}

= 

\begin{pmatrix}
F \\
M
\end{pmatrix}
$$

with \\(m=\sum_{i} m_i\\), \\(\Theta_c = \sum_i m_ir_i^2\\), \\(F = \sum_i u_i\\) and \\(M= \sum_i r_iu_i\\).

We can rewrite this as

$$ M\ddot{x}  = 
Cu
$$

where 

$$ C  = 
\begin{pmatrix}
1 & \ldots & 1 \\
r_1 & \ldots & r_N
\end{pmatrix}
$$

We can convert this second order system into a first order system.

$$ \ddot{x}  = M^{-1}Cu $$

$$ 

\begin{pmatrix}
\ddot{x} \\
\dot{x}
\end{pmatrix}
 = 

\begin{pmatrix}
0 & 0 \\
I & 0
\end{pmatrix}


\begin{pmatrix}
\dot{x} \\
x
\end{pmatrix}

+ 

\begin{pmatrix}
M^{-1}C \\
0
\end{pmatrix}
u

$$

We can introduce the new variables

$$ A = \begin{pmatrix}
0 & 0 \\
I & 0
\end{pmatrix}
$$

and 

$$ B = \begin{pmatrix}
M^{-1}C \\
0
\end{pmatrix} $$

to arrive at the formula


$$ \dot{x} = Az + Bu $$

$$ x_i = x_c + \cos(\phi)x_i + \sin(\phi)y_i $$

$$ \dot{x}_i = \dot{x}_c - \phi\sin(\phi)x_i + \phi\cos(\phi)y_i $$




How can we switch coordinates?





 Can we compress this dynamical system?

 We can imagine a nonlinear state space model

 $$ z_{t+1} \sim \hat{p}(z_{t+1}|z_t, u_t, \theta) $$

 $$ x_t \sim \hat{p}(x_t|z_t, \theta) $$

 with parameters \\(\theta\\). 


We can try to express our sequences \\(\tau = (x_{0:T},u_{0:T})\\) in terms of this model.

$$ p(z_{0:T},x_{0:T}|u_{0:T},\theta) = p(z_0)\prod\limits_{t=0}^{T-1} \hat{p}(z_{t+1}|z_t,u_t, \theta)\hat{p}(x_{t}|z_t, \theta) $$


$$ p(x_{0:T}|u_{0:T}, \theta) = \int_{z_{0:T}} p(z_0)\prod\limits_{t=0}^{T-1} \hat{p}(z_{t+1}|z_t,u_t, \theta)\hat{p}(x_{t}|z_t, \theta) \,dz_{0:T} $$


Therefore, it is our goal to find parameters \\(\theta\\) that can reproduce the state sequence given the outputs as best as possible.

How can we do this? Bayes would suggest to treat the parameter estimation problem as inference. 

If we have \\(N\\) trajectories, we want to find 

$$ p(\theta|x^{1:N},u^{1:N}) \propto p(x^1|u^1,\theta) \ldots p(x^N|u^N,\theta) p(\theta) $$

$$ p(\theta|x^{1:N},u^{1:N}) \propto \exp \left(\log\left(p(x^1|u^1,\theta) \ldots p(x^N|u^N,\theta)  \right)\right)p(\theta) $$

$$ p(\theta|x^{1:N},u^{1:N}) \propto \exp\left( N\frac{1}{N} \sum_{N}\log p(x^i|u^i,\theta) \right) p(\theta) $$

$$ p(\theta|x^{1:N},u^{1:N}) \propto \exp\left(\frac{1}{N} \sum_{N}\log p(x^i|u^i,\theta) \right)^N p(\theta) $$

$$ N \to \infty $$

$$ p(\theta|x^{1:N\to \infty},u^{1:N\to \infty}) \propto \exp\left(\int_{x,u} p(x,u) \log p(x|u,\theta) \,dx\,du\right)^{N \to \infty} p(\theta) $$

$$ p(\theta|x^{1:N\to \infty},u^{1:N\to \infty}) =\frac{\exp\left(\int_{x,u} p(x,u) \log p(x|u,\theta) \,dx\,du\right)^{N \to \infty} p(\theta)}{\int_\theta \exp\left(\int_{x,u} p(x,u) \log p(x|u,\theta) \,dx\,du\right)^{N \to \infty} p(\theta) \,d\theta}   $$

This is a softmax with zero tempreature.

Therefore, the true parameter will be the global maximum of the expression inside the exponential function.

$$ \int_{x,u} p(x,u) \log p(x|u,\theta) \,dx\,du $$

This nothing but the cross entropy of the true model and our model. Therefore, we want to maximize the cross entropy between true and surrogate model.



https://math.stackexchange.com/questions/1105505/sum-of-even-and-odd-terms-in-exponential-taylor-series


https://math.stackexchange.com/questions/2215547/hyperbolic-function-of-matrix-exponential-exp-left-beginsmallmatrix0-p

https://pdfs.semanticscholar.org/f8ed/3316d64312c04c71dc023dc6e36857567793.pdf

https://math.stackexchange.com/questions/2215547/hyperbolic-function-of-matrix-exponential-exp-left-beginsmallmatrix0-p


BERSTE RESSOURCE!
http://ijm2c.iauctb.ac.ir/article_523812_7dbb4eca963733b89fcd5ca77a45f834.pdf S. 9







Is A invertible????? I think so
https://math.stackexchange.com/questions/2035936/determinant-of-a-block-anti-diagonal-matrix

K is invertible if spring system is fixed.
http://people.duke.edu/~hpgavin/cee421/matrix.pdf

https://math.stackexchange.com/questions/921579/quick-way-to-find-eigenvalues-of-anti-diagonal-matrix

So, the eigenvalues of A2 are precisely {a15a51,a24a42,(a33)2}.

Now, note that if λ is an eigenvalue of A, then λ2 must be an eigenvalue of A2. This gives you six candidates for the eigenvalues of A.

https://math.stackexchange.com/questions/1456045/antidiagonal-block-matrix-eigenvalues-and-eigenvectors


https://www.ccg.msm.cam.ac.uk/images/FEMOR_Lecture_1.pdf

https://en.wikipedia.org/wiki/Jordan%E2%80%93Chevalley_decomposition

https://de.wikipedia.org/wiki/Jordansche_Normalform















TM 3
Mehrgrößen
Simulation Koni

https://de.wikipedia.org/wiki/Matrixexponential

http://people.uwm.edu/nosonovs/2017/03/04/why-mechanics-is-a-fundamental-science-1-material-points-particles/

https://people.uwm.edu/nosonovs/2017/03/09/371/

:

I believe the correct date is 1751, the year of publication of EULER’S paper of 1744 which has been mentioned above as the first in which the “Newtonian equations” are recognized as sufficient to give all the mechanical principles determining the motion of a complex system, the case in point being the taut loaded string. 




https://github.com/yigalirani/springmass.js

https://math.stackexchange.com/questions/469146/runge-kutta-method-for-multiple-springs

https://en.wikipedia.org/wiki/Rigid_body


1. Is it possible to describe a spring damper mass system purely by newtons laws? (Are Eulers laws not necessary?)

I guess yes

2. Conservation of momentum and angular momentum is a summary of the system:
	Is it possible to deduce the state of a spring damper mass system from it?
	I guess no.
	Is it possible to deduce the state of rigid body from it? 
	I guess yes. Its a suffiecient statistic for the rigid body

2. If you connect several rigid bodies with springs, dampers or joints. You can use the sufficient statistic to represent the rigid bodies. You can calculate the overall momentum and angular momentum, but you cant deduce the state of the system from it.

It seems, that euler law is simply a nice trick to summarize a system. 

Does it make sense to use eulers laws when no rigid bodies are involved?
The pendulum gets very easy with euler.

https://en.wikipedia.org/wiki/Euler%27s_laws_of_motion :

If a body is represented as an assemblage of discrete particles, each governed by Newton’s laws of motion, then Euler’s equations can be derived from Newton’s laws.

Euler’s equations can, however, be taken as axioms describing the laws of motion for extended bodies, independently of any particle distribution.

Does Varignon's theorem become eulers law if we assume rigid bodies?

https://en.wikipedia.org/wiki/Newton–Euler_equations


Problem: euler equations are non linear. Can we formulate euler equations with quaternions? Will this be linear?


http://www.ams.stonybrook.edu/~coutsias/papers/rrr.pdf

https://onlinelibrary.wiley.com/doi/pdf/10.1002/nme.2586


<canvas id="canvas" style="width:1000" height="500"></canvas>
<script type="text/javascript">

//balls_widget("canvas");

</script>  