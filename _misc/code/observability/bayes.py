from mpl_toolkits.mplot3d import axes3d
import matplotlib.pyplot as plt
from matplotlib import cm
import numpy as np
from scipy.stats import multivariate_normal

import matplotlib as mpl
from mpl_toolkits.mplot3d import Axes3D


delta = 0.5
# define two covariance matrices

s_a = np.array([2,2])
s_b = np.array([0.8,-0.2])



s_a = s_a/np.linalg.norm(s_a)
s_b = s_b/np.linalg.norm(s_b)

U_a = np.array([[s_a[0],s_a[1]],[-s_a[1],s_a[0]]])

U_b = np.array([[s_b[0],s_b[1]],[-s_b[1],s_b[0]]])


dels = np.linspace(0.0001,1000,10000)
mu_abs = np.zeros((2, dels.shape[0]))
print(mu_abs.shape)
for i, delta in reversed(list(enumerate(dels))):
    Sigma_a = U_a.dot(np.diag([1, delta]).dot(U_a.T))
    mu_a = [2.5, 2]

    Sigma_b = U_b.dot(np.diag([1, delta]).dot(U_b.T))
    mu_b = [2.5, 3]

    mu_ab = Sigma_b.dot(np.linalg.solve(Sigma_a + Sigma_b, mu_a)) + Sigma_a.dot(np.linalg.solve(Sigma_a + Sigma_b, mu_b))
    Sigma_ab = Sigma_a.dot(np.linalg.solve(Sigma_a + Sigma_b, Sigma_b))
    print(i)
    mu_abs[:, i] = mu_ab

print(Sigma_ab)

#Create grid and multivariate normal
x = np.linspace(0,5,500)
y = np.linspace(0,5,500)
X, Y = np.meshgrid(x,y)
pos = np.empty(X.shape + (2,))
pos[:, :, 0] = X; pos[:, :, 1] = Y
rv_a = multivariate_normal(mu_a, Sigma_a)
rv_b = multivariate_normal(mu_b, Sigma_b)
rv_ab = multivariate_normal(mu_ab, Sigma_ab)


#Make a 3D plot
fig = plt.figure()
ax = fig.gca()
cset = ax.contour(X, Y, rv_a.pdf(pos),  cmap=cm.coolwarm)
cset = ax.contour(X, Y, rv_b.pdf(pos), cmap=cm.coolwarm)
cset = ax.contour(X, Y, rv_ab.pdf(pos),  cmap=cm.coolwarm)

ax.plot(mu_abs[0, :], mu_abs[1, :])
plt.show()