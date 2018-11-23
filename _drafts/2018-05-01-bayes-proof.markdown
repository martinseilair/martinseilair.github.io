---
layout: post
title:  "Temp"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---

<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script> 

* cryptography

* Unschärferelation



$$ p(\perp|A,B,C) = \delta\left(\begin{pmatrix}A_x-C_x \\ A_y-C_y\end{pmatrix}^T\begin{pmatrix}B_x-C_x \\ B_y-C_y\end{pmatrix} - \perp\right) $$

$$ = \delta\left((A_x-C_x)(B_x-C_x) + (A_y-C_y)(B_y-C_y) - \perp \right) $$

$$ p(a|B,C) = \delta\left(a - \sqrt{(B_x-C_x)^2 + (B_y-C_y)^2}\right)$$

$$ p(b|A,C) = \delta\left(b - \sqrt{(A_x-C_x)^2 + (A_y-C_y)^2}\right)$$

$$ p(c|A,B) = \delta\left(c - \sqrt{(A_x-B_x)^2 + (A_y-B_y)^2}\right)$$

Is this 

$$ p(a|B,C) = \delta\left(a^2 - (B_x-C_x)^2 - (B_y-C_y)^2\right) $$

$$ p(b|A,C) = \delta\left(b^2 - (A_x-C_x)^2 - (A_y-C_y)^2\right) $$

$$ p(c|A,B) = \delta\left(c^2 - (A_x-B_x)^2 - (A_y-B_y)^2\right) $$

?

$$ p(A,B,C| \perp, a, b) \propto p(\perp = 0|A,B,C)p(a|B,C)p(b|A,C)p(A,B,C) $$

$$ p(A,B,C| \perp, a, b) \propto \delta\left(\left[(A_x-C_x)(B_x-C_x) + (A_y-C_y)(B_y-C_y)\right]\left[a^2 - (B_x-C_x)^2 - (B_y-C_y)^2\right]\left[b^2 - (A_x-C_x)^2 - (A_y-C_y)^2\right]\right) $$

$$ p(c|A,B)p(A,B,C| \perp, a, b) \propto \delta\left(\left([c^2 - (A_x-B_x)^2 - (A_y-B_y)^2\right]\left[(A_x-C_x)(B_x-C_x) + (A_y-C_y)(B_y-C_y)\right]\left[a^2 - (B_x-C_x)^2 - (B_y-C_y)^2\right]\left[b^2 - (A_x-C_x)^2 - (A_y-C_y)^2\right]\right) $$


Is this proprtional to

$$ p(c|A,B)p(A,B,C| \perp, a, b) \propto \delta\left(c^2 - a^2 - b^2\right) $$ 

?


$$ p(c|A,B)p(A,B,C| \perp, a, b) \propto \delta\left(\left([c^2 - A_x^2+2A_xB_x-B_x^2 - A_y^2+ 2A_yB_y - B_y^2\right]\left[A_xB_x - A_xC_x - C_xB_x + C_x^2  + A_yB_y - A_yC_y - C_yB_y + C_y^2\right]\left[a^2 - B_x^2+2B_xC_x-C_x^2 - B_y^2+ 2B_yC_y - C_y^2\right]\left[b^2 - A_x^2+2A_xC_x-C_x^2 - A_y^2+ 2A_yC_y - C_y^2\right]\right) $$

A matrix transformation can be displayed as

$$ y = Ax $$

We can also write this in the language of probability theory

$$ p(y) = \int_x p(y|A,x) p(x) \,dx $$

with 

$$ p(y|x) = \delta(y-Ax) = \delta(y_1-A_1x)\delta(y_2-A_2x) = \delta(y_1-A_{11}x_1-A_{12}x_2)\delta(y_2-A_{21}x_1-A_{22}x_2) = \delta(y_1-A_{11}x_1-A_{12}x_2)\delta(y_2-A_{21}x_1-A_{22}x_2) = \delta(
y_1y_2-A_{21}x_1y_1-y_1A_{22}x_2 
- A_{11}x_1y_2 + A_{11}A_{21}x_1^2 + (A_{12}A_{21} + A_{11}A_{22})x_1x_2
- A_{12}x_2y_2 + A_{12}A_{22}x_2^2 )$$


Let's assume we want a two dimensional transformation that rotates the input. The following conditions have to hold for a rotation matrix: \\(\det(R)=1\\) and orthogonality.

Orthogonality

$$ A^TA = \begin{pmatrix} A_{11} & A_{12} \\ A_{21} & A_{22} \end{pmatrix}^T\begin{pmatrix} A_{11} & A_{12} \\ A_{21} & A_{22} \end{pmatrix} = \begin{pmatrix} A_{11} & A_{21} \\ A_{12} & A_{22} \end{pmatrix}\begin{pmatrix} A_{11} & A_{12} \\ A_{21} & A_{22} \end{pmatrix}$$

determinant is 1

$$ A_{11}A_{22} - A_{12}A_{21} = 1 $$


$$ \begin{pmatrix} 
A_{11}^2 + A_{21}^2 & A_{11}A_{12} + A_{21}A_{22} \\ 
A_{11}A_{12} + A_{21}A_{22} & A_{12}^2 + A_{22}^2 
\end{pmatrix}  = \begin{pmatrix} 
1 & 0 \\ 
0 & 1 
\end{pmatrix} $$

$$ p(R|A) = \delta(A_{11}A_{22} - A_{12}A_{21} - 1)\delta(A_{11}^2 + A_{21}^2 - 1)\delta(A_{12}^2 + A_{22}^2 - 1)\delta(A_{11}A_{12} + A_{21}A_{22}) $$

If you want to have a rotation matrix you simply have to "sample" from \\(p(A\|R=0)\\)



https://pdfs.semanticscholar.org/fa3f/a8e3d83e879097ac6190eb62bb143a1764a5.pdf


https://www.physicsforums.com/threads/multivariable-dirac-delta-functions.444052/

https://www.uio.no/studier/emner/matnat/fys/FYS3140/v18/undervisningsmateriale/delta.pdf

http://www.physics.iitm.ac.in/~labs/dynamical/pedagogy/vb/delta.pdf


Given two implicit functions

$$ f(x,y,z) = 0 $$

and

$$ g(x,y,z) = 0 $$ 

I want to know if there is a third implicit function

$$ h(x,y,z) = 0, $$

whose level set describes the intersection of the level sets of the other two implicit functions.

Graphische Datenverarbeitung II. Surfaces 2 Folie 9

$$ (x, y , z) ∈ O_{f ∩ g} ⇔ \max \{ f (x, y , z), g(x, y , z) \} = 0 $$

https://math.stackexchange.com/questions/1923855/implicit-definition-of-the-intersection-of-n-hypersurfaces