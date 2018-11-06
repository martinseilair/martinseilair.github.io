---
layout: post
title:  "Observability: A Bayesian perspective"
date:   2018-11-07 01:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
Observability is an important concept of classical control theory. Quite often it is motivated by abstract concepts, that are not intuitive at all. In this article, we will take a look at observability from a Bayesian perspective and will find a natural interpretation of observability.
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>


Let's begin by stating the definition of [observability](https://en.wikipedia.org/wiki/Observability) from classical control theory.
<div class="important_box">
  Formally, a system is said to be observable, if for any possible sequence of state and control vectors (the latter being variables whose values one can choose), the current state (the values of the underlying dynamically evolving variables) can be determined in finite time using only the outputs.
</div>

We can easily translate this definition into the language of Bayesian inference:

<div class="important_box">
  A system is said to be observable if for any possible initial state and sequence of control vectors, the probability mass of the posterior of the current state will collapse into a single point in finite time.
</div>

Normally, we are using the idea of observability in the setting of deterministic time-invariant linear state space models, which are defined by


$$ \begin{align}x_{t+1} &= Ax_t + B u_t \\ 
y_t &= Cx_t  \end{align} $$

with state \\(x_t\\), output \\(y_t\\), input \\(u_t\\), system matrix \\(A\\), input matrix \\(B\\) and output matrix \\(C\\).

Based on the methods shown in the last post about [linear algebra with Gauss and Bayes]({% post_url 2018-11-06-linalg-gaussian %}), we can reformulate these deterministic equations with Gaussian distributions


$$ \mathcal{N}(x_{t+1}|Ax_t + Bu_t, \delta I) $$

and 

$$ \mathcal{N}(y_t|Cx_t, \delta I) $$

where \\(\delta \to 0\\). 

Now that we arrived at a probabilistic description, we can use Bayesian inference to infer the current state \\(x_t\\). In particular, we are interested in the uncertainty of our estimate of the current state: Our system will be observable if the covariance of the estimate will go to zero. 

# Derivation

First of all, we are defining a Gaussian prior distribution of the initial state \\(x_0\\)

$$ p(x_0) = \mathcal{N}(x_0|0,I). $$

The choice of the mean and covariance are actually arbitrary, as long as the covariance is positive definite.

Now let's plug our distributions into the equations of the Bayes filter, which are described by the **prediction step**

$$ p(x_{t+1}|y_{0:t},u_{0:t}) = \int_{x_{t}} p(x_{t+1}|x_{t}, u_{t})p(x_{t}|y_{0:t},u_{0:t-1}) dx_{t} $$

and the **update step**

$$ p(x_t|y_{0:t},u_{0:t-1}) = \frac{p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1})}{\int_{x_t}p(y_t|x_t)p(x_t|y_{0:t-1},u_{0:t-1}) \,dx_t} .$$


Fortunately, we already know how to do inference in linear Gaussian state space models. We can simply use the equations of the Kalman filter and obtain the following equations for the **prediction step**

$$ \begin{align}\hat x_{t+1|t} &=  A \hat x_{t|t} + Bu_t \\ 
P_{t+1|t} &= \delta I + A P_{t|t} A^T  \end{align} $$


and the **update step**


$$ \begin{align}\hat x_{t|t} &= \hat x_{t|t-1} + P_{t|t-1}C^T(\delta I + CP_{t|t-1}C^T)^{-1}(y_{t}-C\hat x_{t|t-1}) \\ 
P_{t|t} &= P_{t|t-1} - P_{t|t-1}C^T (\delta I + CP_{t|t-1}C^T)^{-1}CP_{t|t-1} .\end{align} $$

If this was too fast, please check out the earlier blog post on [Kalman filtering]({% post_url 2018-10-10-kalman_filter %}). 

Observability depends only on the covariance of the estimates \\( P \\). Therefore, the question of observability of a linear state space model is reduced to the question, if the equations 

$$ \begin{align}
P_{t+1|t} &= \delta I + A P_{t|t} A^T \\ 
P_{t|t} &=(I-P_{t|t-1}C^T(\delta I + CP_{t|t-1}C^T)^{-1}C)P_{t|t-1}  
\end{align} $$

are going to transform an arbitrary positive definite initial covariance matrix \\(P_0\\) to 0. 
<div class="extra_box" markdown="1">
When we combine the prediction and update to a single equation

$$  P_{t+1} = \delta I + A (I-P_{t}C^T(\delta I + CP_{t}C^T)^{-1}C)P_{t} A^T $$

and look very closely we can identify the [discrete-time algebraic Ricatti equation](https://en.wikipedia.org/wiki/Algebraic_Riccati_equation#Context_of_the_discrete-time_algebraic_Riccati_equation)

$$  P_{t+1} = \delta I + AP_{t} A^T  - AP_{t}C^T(\delta I + CP_{t}C^T)^{-1}CP_{t} A^T. $$

</div>
Let's try to interpret what our two equations are doing with the covariance estimate \\(P\\). As a mental model, it is helpful to imagine the particular covariance matrices as subspaces.
We begin with our prior variance \\(P_0\\). We have selected our prior variance in such a way, that it describes the entire state space. 

We are starting by taking an update step. The update step can be interpreted as calculating the intersection of the prior subspace and the subspace defined by all points \\(x\\) that map to the observed output \\(y_0\\). We will call this last subspace the _inverse subspace_.
We took the intersection of the whole state space and _inverse subspace_. As a result, our posterior will be simply the inverse subspace.
Let's see what happens, if we take the prediction step. If we assume that \\(A\\) has full rank, the dimensionality of the subspace will remain the same. Depending on the matrix \\(A\\) two things can happen:

1. The transformation won't change the subspace, but only the representation of the subspace.
2. The transformation is changing the subspace.

Depending on these two cases we will have two cases for the next update step:

**The transformation didn't change the subspace.** In this case, the update step would have no effect, because we are intersecting again with the _same_ inverse subspace. Formally, after the prediction step our posterior would still be the orthogonal [projector](https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse#Projectors) onto the kernel of \\(C\\)

$$ P_{0|0} = I - C^+C. $$

 We know that \\(C(I - C^+C) = 0\\) and \\((I - C^+C)C^T = 0\\), therefore, our update step simplifies to


$$ P_{t|t} =P_{t|t-1}-\underbrace{P_{t|t-1}C^T}_{0}(\delta I + \underbrace{CP_{t|t-1}}_{0}C^T)^{-1}\underbrace{CP_{t|t-1}}_{0} =  P_{t|t-1}.  $$

It seems, that we can't rid of this _unobservable_ subspace. Therefore, we have **no** observability. 

**The transformation did change the subspace.** In this case, the intersection with the inverse subspace will again have an effect. The dimensionality of the posterior subspace will get smaller. 

We have to repeat the process of prediction and updating until the subspace of our posterior has either dimension zero or the prediction step is again not changing our subspace.
In the first case, we have no uncertainty: The system is observable. In the second case, the system is not observable. 

# Summary

In this post, we looked at the concept of observability from a Bayesian standpoint. We found an intuitive way to reason about the effect of the update step and prediction step in terms of subspaces, described by covariance matrices.

