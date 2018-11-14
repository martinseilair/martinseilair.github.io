---
layout: post
title:  "Learning in state-space models"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
A particle filter is a very helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding algorithm and play around with examples on the way. In order to follow the steps in this post you should bring some basic knowledge of math, probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>


1. Bayes learning: latent state vs. parameter learning
	problem loops: no closed form solution


	system identification

	The sum-product and max-sum algorithms provide efficient and exact solutions
to inference problems in tree-structured graphs. (8.4.6)

Loopy belief propagation (8.4.7)

However, because
the graph now has cycles, information can flow many times around the graph. For
some models, the algorithm will converge, whereas for others it will not.

2. How can we approximate it?
Learning in LDS 13.3.2
	EM-Algorithm

The expectation maximization algorithm, or EM algorithm, is a general technique for
finding maximum likelihood solutions for probabilistic models having latent vari-
ables

Goal is maximize likelihood 

$$ p(x|\theta) = \int_z p(x,z|\theta) $$

		E: calculate p(z|x) given the current parameter
		M: 

		local maximum
	MM-Algorithm

3. Approximate inference
	Variantional inference
	Monte Carlo




How to choose input? Exploration problem
Exploration noise

Learning nonlinear state-space models for control
	https://ieeexplore.ieee.org/document/1555957


Nonlinear dynamical factor analysis : benutzt additive gaussian noise


Learning nonlinear state-space models using smooth particle-filter-based likelihood approximations
https://arxiv.org/abs/1711.10765


NONLINEAR STATE SPACE LEARNING WITH EM
AND NEURAL NETWORKS 
https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=710655


https://ieeexplore.ieee.org/document/5588996

Identification of Gaussian Process State Space Models
https://arxiv.org/abs/1705.10888

Identification of Gaussian Process State Space Models
https://arxiv.org/abs/1406.4905

Structured Inference Networks for Nonlinear State Space Models
https://arxiv.org/abs/1609.09869


