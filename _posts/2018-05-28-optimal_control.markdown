---
layout: post
title:  "Optimal Control"
date:   2018-05-01 18:04:07 +0900
categories: jekyll update
---
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

In this post I want to connect the dots between terms in optimal control.

Hamilton-Jacobi-Bellman equation
Bellman equation
Riccati Equation
Pontryagin's Maximum Principle 
Control Hamiltonian
Costate Equation
Lagrange Multiplier
Dynamic Programming
Message passing
LQR
Global/trajectory optimal
Backward induction
Open/closed loop


An optimal control problem can be characterized by several properties.
* Deterministic/stochastic
* Discrete/continuous time
* Constrained/unconstrained
* Discrete/continuous states
* Discrete/constinuous actions
* Fully/partially observable
* Known/Unknown dynamics


# Hamilton-Jacobi-Bellman equation

* Is a partial differential equation.
* Solution of the HJB is  the value function, which gives minimum cost.
* The Bellman equation is the time discrete version of the Hamilton-Jacobi-Bellman equation.  https://en.wikipedia.org/wiki/Hamilton%E2%80%93Jacobi%E2%80%93Bellman_equation
* When solved
  * Locally: HJB is a necessary condition
  * Globally: necessary and sufficicent condition for an optimum
  * <span style="color:red">What does it mean, to solve locally or globally?</span>
* can be generalized to stoachstic systems

For optimal control problem

$$ V(x(0),0) = \min_u \left\{\int_0^T C(x(t),u(t))dt + D(x(T)) \right\} $$

with the constraint 

$$ \dot{x}(t) = F(x(t),u(t)) $$

the HJB equation is

$$ \dot{V}(x,t) + \min_u \left\{\nabla V(x,t) F(x,u) + C(x,u) \right\}= 0 $$

with the terminal condition 

$$ V(x,T) = D(x). $$

\\( V(x,t) \\) is the value function.

The formula can be derived with the help of the principle of optimality:

$$ V(x(t),t) = \min_u \left\{V(x(t + dt), t + dt) + \int_t^{t+dt} C(x(t),u(t))dt \right\} $$.

The variable \\(dt\\) is not infinitesimal yet.

The value function at time \\(t\\) is defined recursively as: Every control signal \\(u\\) is leading to another state and is connected with a cost. For all possible control signals, add the corresponding cost and the value function of the state. Choose the control signal, for which this sum is minimized.

Taylor expansion of \\( V(x(t + dt), t + dt)\\) leads to

$$ V(x(t + dt), t + dt) = V(x(t),t) + \dot{V}(x(t),t)dt + \nabla V(x(t),t)\dot{x}(t)dt + o(dt^2). $$

Derivation:

Given the function \\(V(x(t), t)\\) you choose the operating point \\(t\\) and new variable \\(dt\\).

$$ f(dt) = V(x(t),t) + \frac{dV(x(t),t)}{d t}\|_{t = t} (t + dt - t) + o(dt^2) $$

$$ f(dt) = V(x(t),t) + \frac{(\frac{\partial V}{\partial x}\frac{\partial x}{\partial t} + \frac{\partial V}{\partial t})dt}{d t}\|_{t = t} dt + o(dt^2) $$

$$ f(dt) = V(x(t),t) + \frac{\partial V}{\partial x}\frac{\partial x}{\partial t}dt + \frac{\partial V}{\partial t}dt + o(dt^2) $$

$$ f(dt) = V(x(t),t) + \nabla V(x(t),t)\dot{x}(t)dt + \dot{V}(x(t),t)dt + o(dt^2) $$

Insert the result in the optimality equation

$$ V(x(t),t) = \min_u \left\{V(x(t),t) + \nabla V(x(t),t)\dot{x}(t)dt + \dot{V}(x(t),t)dt + o(dt^2) + \int_t^{t+dt} C(x(t),u(t))dt \right\}. $$

\\(V(x(t),t)\\) is cancled out.

$$ 0 = \min_u \left\{\nabla V(x(t),t)\dot{x}(t)dt + \dot{V}(x(t),t)dt + o(dt^2) + \int_t^{t+dt} C(x(t),u(t))dt \right\}. $$

Divided by \\(dt\\)

$$ 0 = \min_u \left\{\nabla V(x(t),t)\dot{x}(t) + \dot{V}(x(t),t) + o(dt) + \frac{1}{dt}\int_t^{t+dt} C(x(t),u(t))dt \right\}. $$

Take the limit as \\(dt\\) apporaches zero.

$$ 0 = \min_u \left\{\nabla V(x(t),t)\dot{x}(t) + \dot{V}(x(t),t) + C(x(t),u(t)) \right\}. $$
<span style="color:red">Why can you take \\(\dot{V}(x(t),t)\\) out of the min but not \\(\nabla V(x(t),t)\dot{x}(t)\\) </span>  <span style="color:green">Because \\(\dot{V}(x(t),t)\\)  is independent of the the control signal?</span> 

# Linear-quadratic-Gaussian (LQG) control

* Combination of 
	* Kalman Filter (linear-quadratic estimator LQE)
	* Linear-quadratic regulator (LQR)
* LQE and LQR can be computed independently because of the separation principle.
* Applies in LTI and LTV

# Linear-quadratic regulator (LQR)




# Sepration principle

* Known as principle of separation of estimation and control.
* Does not hold for non-linear systems


# Kalman filter or linear-quadratic estimator (LQE)

Assume you have a system

$$ x_{t+1} = A_tx_t + B_t u_t + w_t $$

$$ y_t = C_tx_t + v_t $$

with process noise \\( w_t \sim \mathcal{N}(0, Q_t) \\) and observation noise \\( v_t \sim \mathcal{N}(0, R_t) \\).
The posteriori state estimate is denoted as \\(\hat x_{t\|t}\\) and the posteriori error covariance as \\( P_{t\|t}\\). The posteriori is therefore defined as \\( \mathcal{N}(\hat x_{t\|t}, P_{t\|t}) \\).

In the *predict step* the current estimate is transformed by the system dynamics (marginalization of \\(x_t\\)):

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t})  = \int_{x_t}\mathcal{N}(x_{t+1}|A_tx_t + B_t u_t, Q_t)\mathcal{N}(x_t|\hat x_{t|t}, P_{t|t}) dx_t.$$

With the *propagation* formula (37, Toussaint)

$$ \int_{y}\mathcal{N}(x|a + Fy, A)\mathcal{N}(y|b,B) dx_t = \mathcal{N}(x|a + Fb, A + FBF^T ) $$

it follows 

$$ \hat x_{t+1|t} =  A_t \hat x_{t|t} + B_tu_t $$


$$ P_{t+1|t} = Q_t + A_t P_{t|t} A_t^T  .$$

The *update step* updates the estimate according to observations \\(y_t\\). This step is simply Bayes rule applied.

$$ p(x|y) = \frac{p(y|x)p(x)}{p(y)} $$

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t+1} ) = \frac{\mathcal{N}(y_{t+1}|C_tx_{t+1}, R_t )\mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t})}{\int_{x_{t+1}}\mathcal{N}(y_{t+1}|C_tx_{t+1}, R_t )\mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t}) dx_{t+1}}   $$ 

The numerator can be rewritten as a joint distribution (39, Toussaint)

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) $$

This joint distribution can be rewritten as 

$$ \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b \end{matrix},\begin{matrix}A & C\\C^T & B\end{matrix}\right) = \mathcal{N}(y|b,B)\mathcal{N}(x|a + C^TB^{-1}(y-b),A - C^T B^{-1}C) $$

In total this gives

$$ \mathcal{N}(x|a,A)\mathcal{N}(y|b + Fx,B) = \mathcal{N}(y|b + Fa,B + FA^TF^T)\mathcal{N}(x|a + A^TF^T(B + FA^TF^T)^{-1}(y-b -Fa),A - A^TF^T (B + FA^TF^T)^{-1}FA) $$ 

It follows

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t})\mathcal{N}(y_{t+1}|C_tx_{t+1}, R_t ) = \mathcal{N}(y_{t+1}|C_t\hat x_{t+1|t},R_t + C_tP_{t+1|t}^TC_t^T)\mathcal{N}(x_{t+1}|\hat x_{t+1|t} + P_{t+1|t}^TC_t^T(R_t + C_tP_{t+1|t}^TC_t^T)^{-1}(y_{t+1}-C_t\hat x_{t+1}),P_{t+1|t} - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_tP_{t+1|t}). $$ 


The denominator can be further simplified also with the *propagation* formula (37, Toussaint)

$$ \int_{x_{t+1}}\mathcal{N}(y_{t+1}|C_tx_{t+1}, R_t )\mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t}) dx_{t+1} =  \int_{x_{t+1}}\mathcal{N}(x|C_ty, A)\mathcal{N}(y|b,B) dx_t = \mathcal{N}({y_{t+1}}|C_t\hat x_{t+1|t}, R_t + C_tP_{t+1|t}C_t^T ).$$

Therefore, 

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t+1} ) = \frac{\mathcal{N}(y_{t+1}|C_t\hat x_{t+1|t},R_t + C_tP_{t+1|t}^TC_t^T)\mathcal{N}(x_{t+1}|\hat x_{t+1|t} + P_{t+1|t}^TC_t^T(R_t + C_tP_{t+1|t}^TC_t^T)^{-1}(y_{t+1}-C_t\hat x_{t+1}),P_{t+1|t} - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_tP_{t+1|t})}{\mathcal{N}({y_{t+1}}|C_t\hat x_{t+1|t}, R_t + C_tP_{t+1|t}C_t^T )} $$

becomes

$$ \mathcal{N}(x_{t+1}|\hat x_{t+1|t}, P_{t+1|t+1} ) = \mathcal{N}(x_{t+1}|\hat x_{t+1|t} + P_{t+1|t}^TC_t^T(R_t + C_tP_{t+1|t}^TC_t^T)^{-1}(y_{t+1}-C_t\hat x_{t+1}),P_{t+1|t} - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_tP_{t+1|t}) .$$


$$ \hat x_{t+1|t+1} = \hat x_{t+1|t} + P_{t+1|t}^TC_t^T(R_t + C_tP_{t+1|t}^TC_t^T)^{-1}(y_{t+1}-C_t\hat x_{t+1}) $$

$$ P_{t+1|t+1} = P_{t+1|t} - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_tP_{t+1|t} $$

Define \\(S_t = R_t + C_tP_{t+1\|t}C_t^T\\), \\(K_t = P_{t+1\|t}C_t^TS_t^{-1} \\) and \\( z_t = y_{t+1}-C_t\hat x_{t+1\|t}\\).

$$ \hat x_{t+1|t+1} = \hat x_{t+1|t} + K_t z_t $$

$$ P_{t+1|t+1} = (I - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_t)P_{t+1|t} = (I - K_tC_t)P_{t+1|t} $$

Predict and summary step together:

Define \\(S_t = R_t + C_t(Q_t + A_t P_{t\|t} A_t^T)C_t^T\\), \\(K_t = (Q_t + A_t P_{t\|t} A_t^T)C_t^TS_t^{-1} \\) and \\( z_t = y_{t+1}-C_t(A_t \hat x_{t\|t} + B_tu_t))\\).

$$ \hat x_{t+1|t+1} = \hat x_{t+1|t}  + K_t (y_{t+1}-C_t\hat x_{t+1|t}) = (I - K_tC_t)x_{t+1|t} + K_ty_{t+1} = (I - K_tC_t)(A_t \hat x_{t|t} + B_tu_t) + K_ty_{t+1} =  (I - K_tC_t)A_t \hat x_{t|t} + (I - K_tC_t)B_tu_t + K_ty_{t+1} $$

$$ P_{t+1|t+1} = (I - K_tC_t)(Q_t + A_t P_{t|t} A_t^T) $$

What is the meaning of \\(z_t\\) and \\(S_t\\)? The denominator of the update step is 

$$ \mathcal{N}(y_{t+1}|C_t\hat x_{t+1|t},R_t + C_tP_{t+1|t}^TC_t^T) $$

and can be transformed by (34, Toussaint)

$$ \mathcal{N}(x|a,A) = \mathcal{N}(x+f|a+f,A)  $$

to

$$ \mathcal{N}(y_{t+1} - C_t\hat x_{t+1|t}|0,R_t + C_tP_{t+1|t}^TC_t^T).  $$

Therefore, \\(z_t\\) gives you the derivation of the expected observation and the real observation.
The random variable \\(z_t\\) has therefore zero mean. \\(S_t\\) is simply the variance of the expected output.

How does the formulas of the estimator degrade, if you assume a deterministic system (zero variance).

$$ S_t = C_tP_{t+1|t} C_t^T $$

$$ K_t = P_{t+1|t} C_t^T(C_tP_{t+1|t} C_t^T)^{-1} $$

$$ (I - K_tC_t)(A_t \hat x_{t|t} + B_tu_t) + K_ty_{t+1} $$


$$ (I - K_tC_t)(A_t \hat x_{t|t} + B_tu_t) + K_t C_t x_{t+1} $$


$$ (I - P_{t+1|t} C_t^T(C_tP_{t+1|t} C_t^T)^{-1}C_t)\hat x_{t|t+1} + P_{t+1|t} C_t^T(C_tP_{t+1|t} C_t^T)^{-1} y_{t+1} $$


IST WAHRSCHEINLICH FALSCH!

WEIGHTED NULLSPACE PROJECTION!!!!!  If not, it's a weighting of old and new. Special cases : 

If \\(P_{t+1\|t}\\) is zero: Old estimate is preserved.

* \\(P_{t+1\|t}\\) is diagonal. 
	* If \\(P_{t+1\|t}^{ii}\\) is inifinity: If this dimension is in the nullspace of C, than this value will be solely based on the observation. If not it will be zero.
	* If \\(P_{t+1\|t}^{ii}\\) is 1: If this dimension is in the nullspace of C, the estimate of the observation will be taken over. Otherwise it will be the old estimate.
	* If \\(P_{t+1\|t}^{ii}\\) is less than 1: Compromise between old and new estimate. More weight for the old estimate.
	* If \\(P_{t+1\|t}^{ii}\\) is greather than 1: Compromise between old and new estimate. More weight for the new estimate.

* \\(P_{t+1\|t}\\) is not diagonal. Even if a dimension is not in the nullspace of C, through the coupling you can also update the other dimensions. Effectively this could be treated as a transformation of C. You make an LDL transformation of \\(P_{t+1\|t} = L_{t+1\|t} D_{t+1\|t}L_{t+1\|t}^T\\). Then \\(\tilde C_{t+1\|t} = C_{t+1\|t}L_t\\) is the transformed (whitened?) observation matrix. The function becomes

$$ (I - L_{t+1|t} D_{t+1|t} \tilde C_t^T(\tilde C_tD_{t+1|t} \tilde C_t^T)^{-1})\hat x_{t|t+1} + L_{t+1|t} D_{t+1|t} \tilde C_t^T(\tilde C_tD_{t+1|t} \tilde C_t^T)^{-1} x_{t+1} $$

# Bayes rule for deterministic linear dynamical system, but unknown initial state.

$$ p(x|y) = \frac{p(y|x)p(x)}{p(y)} $$

$$ \mathcal{N}(x|\hat a, \hat A ) = \frac{\mathcal{N}(y|b + Fx,B)\mathcal{N}(x|a,A)}{\int_{x}\mathcal{N}(y|b + Fx,B)\mathcal{N}(x|a,A) dx}   $$ 

The numerator can be rewritten as a joint distribution (39, Toussaint)

$$ \mathcal{N}(y|b + Fx,B)\mathcal{N}(x|a,A) = \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b + Fa \end{matrix},\begin{matrix}A & A^TF^T\\FA & B + FA^TF^T\end{matrix}\right) $$

This joint distribution can be rewritten as 

$$ \mathcal{N}\left(\begin{matrix}x \\y\end{matrix}\middle|\begin{matrix}a\\b \end{matrix},\begin{matrix}A & C\\C^T & B\end{matrix}\right) = \mathcal{N}(y|b,B)\mathcal{N}(x|a + C^TB^{-1}(y-b),A - C^T B^{-1}C) $$

In total this gives

$$ \mathcal{N}(y|b + Fx,B)\mathcal{N}(x|a,A) = \mathcal{N}(y|b + Fa,B + FA^TF^T)\mathcal{N}(x|a + A^TF^T(B + FA^TF^T)^{-1}(y-b -Fa),A - A^TF^T (B + FA^TF^T)^{-1}FA) $$ 



The denominator can be further simplified also with the *propagation* formula (37, Toussaint)

$$ \int_x \mathcal{N}(y|b + Fx,B)\mathcal{N}(x|a,A) dx  = \mathcal{N}(y|Fa + b, B + FAF^T)$$



The whole Bayesian expression will be

$$ \mathcal{N}(x|\hat a, \hat A ) = \mathcal{N}(x|a + A^TF^T(B + FA^TF^T)^{-1}(y-b -Fa),A - A^TF^T (B + FA^TF^T)^{-1}FA) $$ 

Now assume deterministic observation without offset

$$ \mathcal{N}(x|\hat a, \hat A ) = \mathcal{N}(x|a + A^TF^T(FA^TF^T)^{-1}(y-Fa),A - A^TF^T (FA^TF^T)^{-1}FA) $$ 

$$ \hat a = a + A^TF^T(FA^TF^T)^{-1}(y-Fa) = (I - A^TF^T(FA^TF^T)^{-1}F)a + A^TF^T(FA^TF^T)^{-1}y $$

$$ \hat A = (I - A^TF^T (FA^TF^T)^{-1}F)A + (A^TF^T (FA^TF^T)^{-1}F) 0 $$


# Information step

If I take an action this will update my estimate of the belief of the observation. Certain observations are giving more information than others. I should try to increase the probability of these observations.
For control problem: Only those observations should have higher probability, which are important for my policy.

$$ a_t^* = \mathrm{argmax}_{a_t} \mathbb{E}_{p(o_{t+1}|a_t)}[ D_{KL}(b(s_t)\|b(s_{t+1}|o_{t+1}, a_t))] $$

$$ b(s_{t+1}|o_{t+1}, a_t) = \frac{p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t}{p(o_{t+1}|a_t)} $$

with 

$$ p(o_{t+1}|a_t) = \int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t ds_{t+1} . $$

The distributions depend on \\(s_t\\) and \\(s_{t+1}\\). Is this a reasonable approach? Or should I just try to minimize the entropy of the new state?

$$ a_t^* = \mathrm{argmax}_{a_t} \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \int_{s_{t+1}} b(s_{t+1}|o_{t+1}, a_t) \log(b(s_{t+1}|o_{t+1}, a_t))  d_{s_{t+1}} $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \int_{s_{t+1}} \frac{p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t}{p(o_{t+1}|a_t)} \log\left(\frac{p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t}{p(o_{t+1}|a_t)}\right)  d_{s_{t+1}} $$


$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(\frac{p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t}{p(o_{t+1}|a_t)}\right)  d_{s_{t+1}} $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)} D_{KL}\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\|p(o_{t+1}|a_t)\right) $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \left(\log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right) + \log\left(p(o_{t+1}|a_t)\right)\right)  d_{s_{t+1}} $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  d_{s_{t+1}} + \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|a_t)\right)  d_{s_{t+1}} $$


$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  d_{s_{t+1}} + \frac{\log\left(p(o_{t+1}|a_t)\right)}{p(o_{t+1}|a_t)}\underbrace{\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t   d_{s_{t+1}}}_{p(o_{t+1}|a_t)} $$

$$ -H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  d_{s_{t+1}} + \log\left(p(o_{t+1}|a_t)\right) $$


 $$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] = \int_{o_{t+1}} p(o_{t+1}|a_t)\left[\frac{1}{p(o_{t+1}|a_t)}\int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  d_{s_{t+1}} + \log\left(p(o_{t+1}|a_t)\right) \right] do_{t+1} $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] = \int_{o_{t+1}} \int_{s_{t+1}} p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  d_{s_{t+1}} + p(o_{t+1}|a_t)\log\left(p(o_{t+1}|a_t)\right)  do_{t+1} $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \int_{o_{t+1}}p(o_{t+1}|s_{t+1}) \log\left(p(o_{t+1}|s_{t+1})\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t\right)  do_{t+1}d_{s_{t+1}} + \int_{o_{t+1}}p(o_{t+1}|a_t)\log\left(p(o_{t+1}|a_t)\right)  do_{t+1} $$


$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \int_{o_{t+1}}p(o_{t+1}|s_{t+1}) \left(\log\left(p(o_{t+1}|s_{t+1})\right) + \log\left(\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \right) \right) do_{t+1}d_{s_{t+1}} + \int_{o_{t+1}}p(o_{t+1}|a_t)\log\left(p(o_{t+1}|a_t)\right)  do_{t+1} $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \int_{o_{t+1}}p(o_{t+1}|s_{t+1}) \log\left(p(o_{t+1}|s_{t+1})\right)  do_{t+1}d_{s_{t+1}} + \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \int_{o_{t+1}}p(o_{t+1}|s_{t+1}) \log\left(\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \right) do_{t+1}d_{s_{t+1}} + \int_{o_{t+1}}p(o_{t+1}|a_t)\log\left(p(o_{t+1}|a_t)\right)  do_{t+1} $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \int_{o_{t+1}}p(o_{t+1}|s_{t+1}) \log\left(p(o_{t+1}|s_{t+1})\right)  do_{t+1}d_{s_{t+1}} + \int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \log\left(\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t \right) \underbrace{\int_{o_{t+1}}p(o_{t+1}|s_{t+1})  do_{t+1}}_{=1}d_{s_{t+1}} + \int_{o_{t+1}}p(o_{t+1}|a_t)\log\left(p(o_{t+1}|a_t)\right)  do_{t+1} $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  -\int_{s_{t+1}} \int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t H[p(o_{t+1}|s_{t+1})]d_{s_{t+1}} - H[\int_{s_t}p(s_{t+1}|s_t,a_t)b(s_t)ds_t] - H[p(o_{t+1}|a_t)] $$

$$ \mathbb{E}_{p(o_{t+1}|a_t)}[ -H(b(s_{t+1}|o_{t+1}, a_t))] =  -\int_{s_{t+1}} p(s_{t+1}|a_t) H[o_{t+1}|s_{t+1}]d_{s_{t+1}} - H[s_{t+1}|a_t] - H[o_{t+1}|a_t] $$

Assume Linear model from Kalman Filter:


$$ H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{2}\log \det (2\pi e P_{t+1|t+1})  $$

$$ H(b(s_{t+1}|o_{t+1}, a_t)) = \frac{1}{2}\log \det (2\pi e (I - P_{t+1|t}^TC_t^T (R_t + C_tP_{t+1|t}^TC_t^T)^{-1}C_t)P_{t+1|t} ))  $$

Entropy of belief state is independent of observation and action! Actions are not used for getting better information. There is no trade off between an reward maximizing step and information step. Every action gives you the same amount of information. Separation principle: Actions are just for reducing controller cost, only the mean of the information state is used, it does not depend on the variance.

# Kalman-Filter for continuous-time systems

# Bayes-Filter for general continuous-time systems



# Observability in general continuous-time systems

# Linear dynamical system with arbitrary state distribution

# Observability in discrete linear dynamical systems

The Kalman filter is only updating the current state. But with the new information also old states can be updated. 

In order to update past states you have to send messages backwards. These messages are again calculated locally:

$$ m(x_{t};d_t, D_t) = \int_{x_{t+1}} \mathcal{N}(x_{t+1}|Ax_t + B u_t, Q_t) m(x_{t+1};d_{t+1}, D_{t+1})  dx_{t+1}  \mathcal{N}(y_{t}|C_tx_{t}, R_t) $$

The first message is 

$$ m(x_T;d_T, D_T) = \frac{\mathcal{N}(y_T|C_Tx_T, R_T)\mathcal{N}(x_T|a, \infty)}{\int_{x_T}\mathcal{N}(y_T|C_Tx_T, R_T)\mathcal{N}(x_T|a, \infty)d_{x_T}} = \mathcal{N}(x|a + \infty^TC_T^T(R_T + C_T\infty^TC_T^T)^{-1}(y_T-C_Ta),\infty - \infty^TC_T^T (R_T + C_T\infty^TC_T^T)^{-1}C_T\infty)  $$

$$ d_T = a + \infty^TC_T^T(R_T + C_T\infty^TC_T^T)^{-1}(y_T-C_Ta) = a + IC_T^T(\frac{1}{\infty}R_T + C_TIC_T^T)^{-1}(y_T-C_Ta) = a + C_T^T(C_TC_T^T)^{-1}(y_T-C_Ta) =  C_T^T(C_TC_T^T)^{-1}y_T $$


$$ D_T = \infty - \infty^TC_T^T (R_T + C_T\infty^TC_T^T)^{-1}C_T\infty = \infty - \infty^TC_T^T (R_T + C_T\infty^TC_T^T)^{-1}C_T\infty $$





[int-trans]: https://jekyllrb.com/docs/home
[matmul]: https://en.wikipedia.org/wiki/Matrix_multiplication
[int-txcvrans]: https://jekyllrb.com/docs/home
[int-trxcvans]: https://jekyllrb.com/docs/home
[int-trxcans]: https://jekyllrb.com/docs/home
[int-trxxcvans]: https://jekyllrb.com/docs/home
[int-trvans]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
