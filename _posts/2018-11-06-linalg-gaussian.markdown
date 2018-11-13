---
layout: post
title:  "Linear algebra with Gauss and Bayes"
date:   2018-11-06 12:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
[Linear algebra](https://en.wikipedia.org/wiki/Linear_algebra) is a wonderful field of mathematics with endless applications. Despite its obvious beauty, it can also be quite confusing. Especially, when it comes to subspaces, inverses and determinants. In this article, I want to present a different view on some aspects of linear algebra with the help of [Gaussian distributions](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) and [Bayes theorem](https://en.wikipedia.org/wiki/Bayes%27_theorem).
<!--more-->
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <script type="text/javascript" src="{{ base.url | prepend: site.url }}/assets/js/math.min.js"></script>


This post is about the very basic equation

$$ Ax = b, $$

where \\(A \in \mathbb{R}^{m\times n}\\), \\(x \in \mathbb{R}^{n}\\) and \\(b \in \mathbb{R}^{m}\\). With the help of the Gaussian distribution

$$ \mathcal{N}(x|\mu, \Sigma), $$

we can restate this equation in the language of probability theory. 

# Matrix transformation
The transformation of our vector \\(x\\) with matrix \\(A\\) becomes a marginalization



$$ \int_\hat{x} \mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x) \,d\hat{x}. $$

Please be aware, that this formula is **not** equivalent to our matrix product above. We introduced two new variables \\(\Sigma_x\\) and \\(\Sigma_b\\), which are representing the covariance matrices of the corresponding Gaussian distributions.
The two formulations will become equivalent if the covariance matrices will go to zero.
Let's check if this is true!

We can use the propagation formula 

$$ \int_{y}\mathcal{N}(x|a + Fy, A)\mathcal{N}(y|b,B) dx_t = \mathcal{N}(x|a + Fb, A + FBF^T ). $$

from the [Gaussian identities](https://ipvs.informatik.uni-stuttgart.de/mlr/marc/notes/gaussians.pdf) by Marc Toussaint to reformulate our marginalization. 

In our case, we will end up with 

$$ \int_\hat{x} \mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x) \,d\hat{x} = \mathcal{N}(b|Ax, \Sigma_b + A\Sigma_xA^T ). $$

If we let \\(\Sigma_x\\) and \\(\Sigma_b\\) go to zero, the resulting covariance will go to zero as well. In the limit, the entire probability mass will be concentrated at our mean \\(Ax\\), which is exactly what we wanted to show.
Up until now, there is nothing fancy about this result. It's just a weird way to write the matrix multiplication. But when we think about the inverse of the transformation \\(Ax = b\\), things will become more interesting.

# Inverse

 What does it mean to take the inverse transformation? What is the desired result? By taking the inverse operation, we are simply asking for the set of points \\(x\\) which would be transformed to \\(b\\). We normally express the inverse transformation as

$$ x = A^{-1}b. $$

But you have to be careful: This equations only holds, if the matrix \\(A\\) has full rank. In this case, there is exactly one point \\(x\\) that maps to \\(b\\). But we shouldn't waste our time on special cases. Let's directly look at the general case for an arbitrary matrix \\(A\\).

We come back to our old friends Gauss and Bayes and try to formulate the inverse operation in terms of Gaussian distributions and Bayes theorem

$$ p(x|y) = \frac{p(y|x)p(x)}{\int_x p(y|x)p(x) \,dx}. $$

We insert our Gaussian distributions and obtain

$$ p(\hat{x}|b) =  \frac{\mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x)}{\int_\hat{x} \mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x) \,d\hat{x}}.  $$

To simplify this expression we can use equation 39 and 40 from the [Gaussian identities](https://ipvs.informatik.uni-stuttgart.de/mlr/marc/notes/gaussians.pdf) and obtain





$$ \frac{\mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x)}{\int_\hat{x} \mathcal{N}(b|A\hat{x}, \Sigma_b)\mathcal{N}(\hat{x}|x, \Sigma_x) \,d\hat{x}} = \mathcal{N}(\hat{x}|\mu, \Sigma) $$

with 

$$ \begin{align} \mu &= x + \Sigma_xA^T(\Sigma_b + A\Sigma_xA^T)^{-1}(b-Ax) \\ 
\Sigma &= \Sigma_x - \Sigma_xA^T (\Sigma_b + A\Sigma_xA^T)^{-1}A\Sigma_x. \end{align} $$

In this context, \\(x\\) and \\(\Sigma_x\\) are describing our prior belief about the set of points \\(x\\) that map to \\(b\\). We have no prior information about the inverse and could choose any prior that has probability mass at every point in the space.
We will set \\(x=0\\) and \\(\Sigma_x = I\\). Our equations will simplify to 

$$ \begin{align} \mu &= A^T(\Sigma_b + AA^T)^{-1}b \\ 
\Sigma &= I - A^T (\Sigma_b + AA^T)^{-1}A. \end{align} $$

But what is with \\(\Sigma_b\\)? We want to calculate the inverse of the deterministic linear transformation. Therefore, \\(\Sigma_b\\) has to go to zero. We are doing this in a fancy way by defining

$$ \Sigma_b = \delta I $$

and letting the scalar \\(\delta\\) go to zero.

The resulting formula will be 

$$ \begin{align} \mu &= A^T(\delta I + AA^T)^{-1}b \\ 
\Sigma &= I - A^T (\delta I + AA^T)^{-1}A \end{align} $$

with \\(\delta \to 0 \\).

If we look closely we can identify the exact definition of the [pseudoinverse](https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse)

$$ A^+ = A^T(\delta I + AA^T)^{-1}, $$

where \\(\delta \to 0\\). In this particular form, we don't we have to think about rank or invertibility: It is valid for any matrix!

Ok, but what's going with the covariance matrix \\(\Sigma\\)? It can be identified as the orthogonal [projector](https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse#Projectors) onto the kernel of \\(A\\)

$$ I - A^+A. $$

Ok, nice! But what does it mean? The mean \\(\mu\\) and covariance \\(\Sigma\\) together are describing an affine linear space. The mean \\(\mu\\) can be interpreted as a translation vector to the linear subspace described by the covariance \\(\Sigma\\).

The beautiful thing is, that we don't have to trust the equations. We can simply plot 

$$ \mathcal{N}(\hat{x}|A^+b, I - A^+A) $$

with a very small \\(\delta\\) and _see_ the resulting subspace.

But the niceness doesn't stop here. We can imagine a setting, where we are not getting the whole vector \\(b\\) at once, but each dimension \\(b_i\\) separately. In this case, Bayes theorem tells us quite clearly what to do. We can update our belief of the inverse sequentially


$$ p(\hat{x}|b) =  \frac{\mathcal{N}(b_1|A_1\hat{x}, \Sigma_{b_1})\,\ldots\,\mathcal{N}(b_m|A_m\hat{x}, \Sigma_{b_m})\mathcal{N}(\hat{x}|x, \Sigma_x)}{\int_\hat{x} \mathcal{N}(b_1|A_1\hat{x}, \Sigma_{b_1})\,\ldots\,\mathcal{N}(b_m|A_m\hat{x}, \Sigma_{b_m})\mathcal{N}(\hat{x}|x, \Sigma_x) \,d\hat{x}},  $$

where we assume that \\(\Sigma_b\\) is a diagonal matrix.

We did not only obtain a nice way to describe inverses, but have found a general representation of arbitrary affine linear subspaces

$$ \mathcal{N}(x|a, A(\delta)), $$

with translation vector \\(a\\) and covariance matrix \\(A(\delta)\\), where \\(\delta \to 0\\). 

# Intersection of subspaces

Now, we can ask what the intersection of two affine linear subspaces is. An intuitive example for this are two planes intersecting in a line. With our representation of affine linear subspaces, asking for the intersection is easy! We just have to multiply the Gaussian distributions and we are done. In the [Gaussian identities](https://ipvs.informatik.uni-stuttgart.de/mlr/marc/notes/gaussians.pdf), we find the formula for the product

$$ \mathcal{N}(x|a, A) \mathcal{N}(x|b, B) = \mathcal{N}(x|B(A+B)^{-1}a + A(A+B)^{-1}b, A(A+B)^{-1}B)\mathcal{N}(a|b, A+B). $$

Therefore, the subspace of the intersection can be described by

$$ 
\begin{align}
\mu &= B(\delta)(A(\delta)+B(\delta))^{-1}a + A(\delta)(A(\delta)+B(\delta))^{-1}b \\
\Sigma &=  A(\delta)(A(\delta)+B(\delta))^{-1}B(\delta)
\end{align}
$$

for \\(\delta\to 0\\).

Please be aware, that things will break if there is no intersection at all. In the case of two parallel lines and before you take the limit, the resulting mean \\(\mu\\) will lie directly in the middle of the connecting line of the two means \\(a\\) and \\(b\\) and \\(\Sigma\\) will be the same as \\(A(\delta)=B(\delta)\\). 

# Determinant

Let's assume you have a unit [hypercube](https://en.wikipedia.org/wiki/Hypercube), which is transformed via the regular square matrix \\(A \in \mathbb{R}^{n \times n}\\). The volume of the resulting [parallelepiped](https://en.wikipedia.org/wiki/Parallelepiped) is equal to the absolute value of the [determinant](https://en.wikipedia.org/wiki/Determinant) of \\(A\\). Therefore, the determinant can be described as the scaling factor of \\(A\\).

Can we find this scaling factor with our Gaussian distributions as well? Clearly, probability distributions are always normalized: the probability _volume_ won't change at all. But we remember that the definition of the multivariate Gaussian distribution 

$$ \mathcal{N}(x|\mu, \Sigma) = \underbrace{\frac{1}{\sqrt{(2\pi)^n \det(\Sigma)}}}_{Z} \exp\left(-\frac{1}{2}(x-\mu)^T\Sigma^{-1}(x-\mu)\right) $$

has a normalizer \\(Z\\). If we transform the distribution \\(\mathcal{N}(x\|\mu, \delta_x I)\\) with  \\(\mathcal{N}(b\|Ax, \delta_b I)\\), we will obtain \\(\mathcal{N}(b\|A\mu, A(\delta_xI))A^T + \delta_b I)\\). What will be the ratio of the coprresponding normalizers \\(\frac{Z_b}{Z_x}\\)?

Let's find out! We insert the normalizers

$$ \frac{\sqrt{(2\pi)^n \det(A(\delta_xI)) A^T + \delta_b I)}}{\sqrt{(2\pi)^n \det(\delta_x I)}}, $$

combine the square roots and cancel out \\((2\pi)^n\\) to obtain

$$ \sqrt{\frac{\det(A(\delta_xI)) A^T + \delta_b I)}{ \det(\delta_x I)}}. $$


We assume a deterministic linear transformation, therefore, we let \\(\delta_b\\) go to zero and obtain

$$
\begin{align} 
\sqrt{\frac{\det(\delta_xA^TA)}{\det(\delta_xI)}} &= \sqrt{\frac{\delta_x^n\det(A^TA)}{\delta_x^n}} \\
&= \sqrt{\det(A^TA)} \\
&= \sqrt{\det(A^T)\det(A)} \\
&= \sqrt{\det(A)\det(A)} \\
&= \sqrt{\det(A)^2}  \\
&= \det(A)  \\
\end{align}
$$

Nice! We identified the ratio of the normalizing factors of the Gaussian distributions as the determinant of \\(A\\).


# Summary

In this post, we took a brief look on linear algebra expressed in terms of Gaussian distributions. We saw, that we can perform matrix transformations by marginalization and that the inverse of a matrix \\(A\\) can be obtained naturally with Bayes theorem. As a side product, we learned a natural way to describe affine linear subspaces. The intersection of two affine linear subspaces is again an affine linear space. We saw how to calculate these intersections by simple multiplication of the corresponding Gaussian distributions. Finally, we found a nice interpretation of the determinant in terms of normalizers. Furthermore, we learned that the word natural comes naturally with Bayes.

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

