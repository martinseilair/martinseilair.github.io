---
layout: post
title:  "Observability in linear models"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
A particle filter is a very helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding algorithm and play around with examples on the way. In order to follow the steps in this post you should bring some basic knowledge of math, probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<div class="important_box">
  Formally, a system is said to be observable if, for any possible sequence of state and control vectors (the latter being variables whose values one can choose), the current state (the values of the underlying dynamically evolving variables) can be determined in finite time using only the outputs.
</div>

We can formulate this help of Bayesian inference:

<div class="important_box">
  A system is said to be observable if, for any possible sequence of state and control vectors, the probability mass of the posterior of the current state will collapse into a single point in finite time using only the outputs.
</div>


A deterministic linear Gaussian state space model is defined by


$$ \begin{align}x_{t+1} &= A_tx_t + B_t u_t \\ 
y_t &= C_tx_t  \end{align} $$

with state \\(x_t\\), output \\(y_t\\), input \\(u_t\\), system matrix \\(A_t\\), input matrix \\(B_t\\) and output matrix \\(C_t\\).

Furthermore, in order to perform Bayesian inference we need a prior distribution of the initial state \\(\mathcal{N}(x_0\|\mu, \Sigma)\\).

We can describe our deterministic state space models in a probabilistic form using the Dirac delta function

$$ p(x_{t+1}|x_t,u_t) = \delta(x_{t+1} - A_tx_t - B_t u_t) $$

$$ p(y_t|x_t) = \delta(x_{t+1} - C_tx_t). $$

This can also be formulated with the help of Gaussians distributions

$$ \mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, \Sigma) $$

$$ \mathcal{N}(y_{t}|C_tx_t, \Sigma), $$

where \\(\Sigma \to 0\\).

The recursive formula for the Bayes filter in state space models consists of the **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{p(y_t|y_{0:t-1},u_{0:t-1})} .$$

Let's take a moment and think about which form our posterior distribution will have by performing the first prediction step starting with the prior \\(p(x_0)\\):

$$ p(x_{1}|u_{0}) = \int_{x_{0}} \delta(x_{1} - A_0x_0 - B_0 u_0)\mathcal{N}(x_0|\mu, \Sigma) dx_{0}. $$

We note, that we have a composed the Dirac delta function with a function \\(\delta(g(x_0))\\) with the function \\(g(x_0) = x_{1} - A_0x_0 - B_0 u_0\\).

Therefore, we can also write the integral as

$$ p(x_{1}|u_{0}) = \int_{g^{-1}(0)} \frac{\mathcal{N}(x_0|\mu, \Sigma)}{|\det(\nabla_{x_0} g(x)|_{x=x_0})|} dx_{0}. $$

The derivative \\(\nabla_{x_0}g(x_0)\\) is 

$$ \nabla_{x_0}g(x_0) = \nabla_{x_0}\left[x_{1} - A_0x_0 - B_0 u_0\right] = -A_0. $$ 

Which elements are contained in the set \\(g^{-1}(0) \\)?

Linear algebra can help us with this regard.

$$ g(x_0) = x_{1} - A_0x_0 - B_0 u_0 = 0 $$

$$ A_0x_0 = x_{1} - B_0 u_0 $$

Which set of elements \\(x\\) satisfy the equation

$$ Ax = b, $$

with \\(A=A_0\\), \\(x=x_0\\) and \\(b=x_{1} - B_0 u_0\\)?

In general, 

$$ x = x_p + x_h $$

will satisfy this eqaution, where \\(x_p\\) is a particular solution and \\(x_h\\) is coming from the space of the homogeneous solution

$$ Ax_h = 0. $$

All elements \\(x_h\\) form the null space of A.

If we assume, that A is invertibl. The nullspace will only contain the element \\(x=0\\).

$$ g^{-1}(0) = A_0^{-1}(x_1 - B_0u_0)$$

We can plug our results in the integral above

$$ p(x_{1}|u_{0}) = \frac{\mathcal{N}(A_0^{-1}(x_1 - B_0u_0)|\mu, \Sigma)}{|\det(A_0)|} . $$

$$ p(x_{1}|u_{0}) = \frac{\frac{1}{|\det(A_0)|}\mathcal{N}(x_1 - B_0u_0|A_0\mu, A_0^T\Sigma A_0)}{|\det(A_0)|}. $$



$$ p(x_{1}|u_{0}) = \mathcal{N}(x_1 |A_0\mu + B_0u_0, A_0^T\Sigma A_0). $$

# Joint probability of Gaussian with conditional Gaussian

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) .$$




$$ \frac{1}{\sqrt{(2\pi)^k \det(A)}}\exp(-\frac{1}{2}(x-a)^TA^{-1}(x-a))\frac{1}{\sqrt{(2\pi)^k \det(B)}}\exp(-\frac{1}{2}(y-(b + Fx)))^TB^{-1}(y-(b + Fx)))) $$

$$ \exp(-\frac{1}{2}(x-a)^TA^{-1}(x-a))\exp(-\frac{1}{2}(y-(b + Fx)))^TB^{-1}(y-(b + Fx)))) $$




$$ \exp(-\frac{1}{2}(x-a)^TA^{-1}(x-a) -\frac{1}{2}(y-(b + Fx)))^TB^{-1}(y-(b + Fx)))) $$


$$ \exp(-\frac{1}{2}\left[x^TA^{-1}x - x^TA^{-1}a - a^TA^{-1}x + a^TA^{-1}a + y^TB^{-1}y - y^TB^{-1}(b + Fx) - (b + Fx)^TB^{-1}y + (b + Fx)^TB^{-1}(b + Fx) \right]) $$

$$ \exp(-\frac{1}{2}\left[x^TA^{-1}x - x^TA^{-1}a - a^TA^{-1}x + a^TA^{-1}a + y^TB^{-1}y - y^TB^{-1}b- y^TB^{-1}Fx - b^TB^{-1}y- Fx^TB^{-1}y + b^TB^{-1}b+ b^TB^{-1}Fx+x^TF^TB^{-1}b+ x^TF^TB^{-1}Fx \right]) $$

$$ \exp(-\frac{1}{2}\left[
x^TA^{-1}x + x^TF^TB^{-1}Fx  
- x^TA^{-1}a - a^TA^{-1}x + a^TA^{-1}a + 
y^TB^{-1}y - y^TB^{-1}b - b^TB^{-1}y + b^TB^{-1}b
- y^TB^{-1}Fx - Fx^TB^{-1}y + b^TB^{-1}Fx  +  x^TF^TB^{-1}b\right]) $$

$$ \exp(-\frac{1}{2}\left[
x^T(A^{-1} + F^TB^{-1}F)x  - x^TA^{-1}a - a^TA^{-1}x + a^TA^{-1}a 
\underbrace{- x^TF^TB^{-1}Fa + x^TF^TB^{-1}Fa}_{0}
\underbrace{- a^TF^TB^{-1}Fx + a^TF^TB^{-1}Fx}_{0}
\underbrace{- a^TF^TB^{-1}a + a^TF^TB^{-1}Fa}_{0}
+ y^TB^{-1}y - y^TB^{-1}b - b^TB^{-1}y + b^TB^{-1}b
- y^TB^{-1}Fx - Fx^TB^{-1}y + b^TB^{-1}Fx  +  x^TF^TB^{-1}b
\underbrace{+ a^TF^TB^{-1}y - a^TF^TB^{-1}y}_{0}
\underbrace{+ y^TB^{-1}Fa - y^TB^{-1}Fa}_{0}
\underbrace{+ a^TF^TB^{-1}Fa - a^TF^TB^{-1}Fa}_{0}
\underbrace{+ b^TB^{-1}Fa - b^TB^{-1}Fa}_{0}
\underbrace{+ a^TF^TB^{-1}b - a^TF^TB^{-1}b}_{0}
\right]) $$

$$ \exp(-\frac{1}{2}\left[
x^T(A^{-1} + F^TB^{-1}F)x  - x^T(A^{-1} + F^TB^{-1}F)a - a^T(A^{-1} + F^TB^{-1}F)x + a^T(A^{-1} + F^TB^{-1}F)a 
+ x^TF^TB^{-1}Fa
+ a^TF^TB^{-1}Fx
- a^TF^TB^{-1}a
+ y^TB^{-1}y 
- y^TB^{-1}b - y^TB^{-1}Fa
- b^TB^{-1}y - a^TF^TB^{-1}y
+ b^TB^{-1}b + b^TB^{-1}Fa + a^TF^TB^{-1}b + a^TF^TB^{-1}Fa
- y^TB^{-1}Fx - x^TF^TB^{-1}y + b^TB^{-1}Fx  +  x^TF^TB^{-1}b
+a^TF^TB^{-1}y
+y^TB^{-1}Fa 
 - a^TF^TB^{-1}Fa
- b^TB^{-1}Fa 
- a^TF^TB^{-1}b 
\right]) $$

$$ \exp(-\frac{1}{2}\left[
(x-a)^T(A^{-1} + F^TB^{-1}F)(x-a)
+ x^TF^TB^{-1}Fa
+ a^TF^TB^{-1}Fx
- a^TF^TB^{-1}a
- y^TB^{-1}Fx - x^TF^TB^{-1}y + b^TB^{-1}Fx  +  x^TF^TB^{-1}b
+a^TF^TB^{-1}y
+y^TB^{-1}Fa 
 - a^TF^TB^{-1}Fa
- b^TB^{-1}Fa 
- a^TF^TB^{-1}b 
+ y^TB^{-1}y 
- y^TB^{-1}(b+Fa)
- (b+Fa)^TB^{-1}y 
+ (b+Fa)^TB^{-1}(b+Fa)
\right]) $$

$$ \exp(-\frac{1}{2}\left[
(x-a)^T(A^{-1} + F^TB^{-1}F)(x-a)

- x^TF^TB^{-1}y
+ x^TF^TB^{-1}Fa
+ x^TF^TB^{-1}b

+ a^TF^TB^{-1}y
- a^TF^TB^{-1}Fa
- a^TF^TB^{-1}b 

- y^TB^{-1}Fx  
+ a^TF^TB^{-1}Fx
+ b^TB^{-1}Fx  

+ y^TB^{-1}Fa 
- a^TF^TB^{-1}a
- b^TB^{-1}Fa 

+ (y - (b+Fa))^TB^{-1}(y - (b+Fa)) 
\right]) $$

$$ \exp(-\frac{1}{2}\left[
(x-a)^T(A^{-1} + F^TB^{-1}F)(x-a)
- (x-a)^TF^TB^{-1}(y - (b+Fa)) 
- (y - (b+Fa))^TB^{-1}F(x-a)  
+ (y - (b+Fa))^TB^{-1}(y - (b+Fa)) 
\right]) $$


$$\exp\left(\begin{pmatrix}x - a\\ y - (b + Fa) \end{pmatrix}^T\begin{pmatrix}A^{-1} + F^TB^{-1}F & -F^TB^{-1}\\-B^{-1}F & B^{-1}\end{pmatrix}\begin{pmatrix}x-a\\y-(b + Fa) \end{pmatrix}\right) $$

$$\exp\left(\begin{pmatrix}x - a\\ y - (b + Fa) \end{pmatrix}^T\begin{pmatrix}A^{-1} + F^TB^{-1}F & -F^TB^{-1}\\-B^{-1}F & B^{-1}\end{pmatrix}\begin{pmatrix}x-a\\y-(b + Fa) \end{pmatrix}\right) $$



$$ \begin{pmatrix}
A^{-1} 	+ F^TB^{-1}F							& -F^TB^{-1}\\
-B^{-1}F 										& 	B^{-1}
\end{pmatrix}^{-1} 
= \begin{pmatrix}
C_1^{-1} 										& (A^{-1} + F^TB^{-1}F)^{-1}F^TB^{-1}C_2^{-1}\\
C_2^{-1}B^{-1}F(A^{-1}+ F^TB^{-1}F)^{-1} 		& C_2^{-1}
\end{pmatrix}$$

$$ C_1 = A^{-1} + F^TB^{-1}F - F^TB^{-1}(B^{-1})^{-1}B^{-1}F = A^{-1} $$

$$ C_2 = B^{-1} - B^{-1}F(A^{-1} + F^TB^{-1}F)^{-1}F^TB^{-1} = (B + FAF^T )^{-1} $$

$$ (A^{-1} + F^TB^{-1}F)^{-1} = A -AF^T(B + FAF^T)^{-1}FA $$

$$ A_{21} = (B + FAF^T )B^{-1}F(A^{-1}+ F^TB^{-1}F)^{-1} $$

$$ A_{21} = (B + FAF^T )B^{-1}F(A -AF^T(B + FAF^T)^{-1}FA) $$

$$ A_{21} = (B + FAF^T )B^{-1}FA -(B + FAF^T )B^{-1}FAF^T(B + FAF^T)^{-1}FA $$

$$ A_{21} = \left[(B + FAF^T )B^{-1} -(B + FAF^T )B^{-1}FAF^T(B + FAF^T)^{-1}\right]FA $$



$$ A_{21} = \left[(B + FAF^T )B^{-1}\left\{I-FAF^T(B + FAF^T)^{-1}\right\} \right]FA $$






$$ A_{21} = (B + FAF^T )B^{-1}FA - BB^{-1}FAF^T(B + FAF^T)^{-1}FA + FAF^TB^{-1}FAF^T(B + FAF^T)^{-1}FA $$

$$ A_{21} = \left[(B + FAF^T )B^{-1} - FAF^T(B + FAF^T)^{-1} + FAF^TB^{-1}FAF^T(B + FAF^T)^{-1}\right]FA $$

$$ \begin{pmatrix}
A^{+} + F^TB^{+}F 								& -F^TB^{+}\\
-B^{+}F 										& B^{+}
\end{pmatrix}^{+} 
= \begin{pmatrix}
C_1^{+} 										& (A^{+} + F^TB^{+}F)^{+} F^TB^{+}C_2^{+}\\
C_2^{+}B^{+}F(A^{+} + F^TB^{+}F)^{+} 			& C_2^{+}
\end{pmatrix}$$

$$ C_1 = A^{+} + F^TB^{+}F  - F^TB^{+}BB^{+}F = A^{+} + F^TB^{+}F  - F^TB^{+}F =  A^{+} $$

$$ C_2 = B^{+} - B^{+}F(A^{+} + F^TB^{+}F)^{+}F^TB^{+} = (B + FAF^T )^{+} $$



$$\mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) \propto \exp\left(\begin{pmatrix}x - a\\ y - (b + Fa) \end{pmatrix}^T\begin{pmatrix}A & A^TF^T\\FA & B + FA^TF^T\end{pmatrix}^{-1}\begin{pmatrix}x-a\\y-(b + Fa) \end{pmatrix}\right) $$



# Joint probability of Gaussian with invertible linear function

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,0) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA &  FA^TF^T\end{matrix}\right) .$$

# Joint probability of Gaussian with degenerate conditional Gaussian

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) .$$

# Joint probability of Gaussian with degenerate linear function

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,0) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA &  FA^TF^T\end{matrix}\right) .$$

# Joint probability of Degenerate Gaussian with conditional Gaussian

# Joint probability of Degenerate Gaussian with invertible linear function

# Joint probability of Degenerate Gaussian with degenerate conditional Gaussian

# Joint probability of Degenerate Gaussian with degenerate linear function


**prediction step**

$$ \begin{align}\hat x_{t+1|t} &=  A_t \hat x_{t|t} + B_tu_t \\ 
P_{t+1|t} &= A_t P_{t|t} A_t^T  \end{align} $$


and the **update step**


$$ \begin{align}\hat x_{t|t} &= \hat x_{t|t-1} + P_{t|t-1}C_t^T(C_tP_{t|t-1}C_t^T)^{-1}(y_{t}-C_t\hat x_{t|t-1}) \\ 
P_{t|t} &= (I - P_{t|t-1}C_t^T (C_tP_{t|t-1}C_t^T)^{-1}C_t)P_{t|t-1}.  \end{align} $$

Oblique projection

$$ P = A(B^TA)^-1B^T $$

$$ P = P_{t|t-1}C_t^T (C_tP_{t|t-1}C_t^T)^{-1}C_t $$

$$ A = P_{t|t-1}C_t^T $$

$$ B = C_t^T $$

Ortogonal projection with inner product space

$$ P = A(A^TDA)^{-1}A^TD $$

$$ P = P_{t|t-1}C_t^T (C_tP_{t|t-1}C_t^T)^{-1}C_t $$

$$ P = DA(A^TDA)^{-1}A^T $$ 

$$ D = P_{t|t-1} $$

$$ A = C_t^T $$


$$ \hat x_{t|t} = P_{t|t-1}C_t^T(C_tP_{t|t-1}C_t^T)^{-1}y_{t} + (I - P_{t|t-1}C_t^T(C_tP_{t|t-1}C_t^T)^{-1}C_t)\hat x_{t|t-1} $$



















