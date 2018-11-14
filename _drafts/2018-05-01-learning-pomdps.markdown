---
layout: post
title:  "Learning and optimal control in POMDPs"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---

<!--more-->

Learning in POMDPs

The problem of learning and optimal control in POMDPs consists of the two problems of 

* learn a probabilistic model of the environment \\(p_\theta(s_{t+1}\|s_t,a_t)\\) and \\(p_\theta(o_{t+1}\|s_{t+1},a_t)\\)
* learn a policy to maximize the expectation of the cost functional \\(\pi_\theta(a_t\|s_t)\\)


We could first to learn the underlying POMDP with some exploration strategy. If this has converged, we can start to learn a policy.


# Model equations vs. Bayes filter

Should we learn the transition and observation distriubtions? Or should we try to learn directly the equations of the Bayes filter.

We want to use our model for optimal control. Our policy should be conditioned on the (approximate) posterior given the current observations. We obtain our posterior by applying the equations of the Bayes filter, which will be calculated using our model.

Therefore, we are only using the learned model to calculate another quantity. This is an argument for learning the filtering equations directly.

On the other hand, with a model you can simulate the model and learn from these simulations.

The filtering equations consist of the update step and the prediction step. If you learn the two steps separately you can simulate a model as well with the prediction step.


The value function \\(V_\pi(s)\\) gives you the expected reward from this state onwards.

The action-value function \\(Q_\pi(a,s)\\) gives you the expected reward from state \\(s\\) when you take action \\(a\\) onwards.

You can get a better or equal policy by taking the action \\(a\\) that maximizes the action-value function given a state \\(s\\).

You have a distribution over the best action.

Value of information: If you can quantify the value of the information you will get, you can do the exploration explotation tradeoff optimally.


Value function as Lagrange mulitplier

https://editorialexpress.com/jrust/sdp/lagrange.pdf


$$ \lambda (s) = \frac{\partial V(s)}{\partial s} $$


<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

