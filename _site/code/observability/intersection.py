from mpl_toolkits.mplot3d import axes3d
import matplotlib.pyplot as plt
from matplotlib import cm
import numpy as np
from scipy.stats import multivariate_normal

import matplotlib as mpl
from mpl_toolkits.mplot3d import Axes3D

Sigma_b = 0.001*np.eye(1)
A = np.array([[1.0, 0.5]])
x = np.array([0, 0]).T
x_r = np.array([4.0, 2.5]).T
b = A.dot(x_r)

print("x_r", x_r)
print("x", x)

print("A", A)
print("b", b)


In = Sigma_b + np.dot(A, A.T)
print("In", In)
mu = np.dot(A.T,np.linalg.solve(In, b))
Sigma = np.eye(2) - np.dot(A.T, np.linalg.solve(In, A))
print("mu", mu)
print("Sigma", Sigma)


u, s, vh = np.linalg.svd(Sigma, full_matrices=True)
print(u,s,vh)
Sigma_T = u.dot(np.diag([s[1], s[0]]).dot(vh))

#plot

#Create grid and multivariate normal
x = np.linspace(0,5,100)
y = np.linspace(0,5,100)
X, Y = np.meshgrid(x,y)
pos = np.empty(X.shape + (2,))
pos[:, :, 0] = X; pos[:, :, 1] = Y
rv = multivariate_normal([mu[0],mu[1]], Sigma)
nv = multivariate_normal([mu[0], mu[1]], Sigma+np.eye(2)*0.001)

t = np.expand_dims(np.linspace(-5,5,100),axis=0).T
n = np.expand_dims(u[:,0],axis=0)
l =mu + t.dot(n)

print(l)


#Make a 3D plot
fig = plt.figure()
ax = fig.gca(projection='3d')
cset = ax.contour(X, Y, rv.pdf(pos), zdir='z', offset=0, cmap=cm.coolwarm)
cset = ax.contour(X, Y, nv.pdf(pos), zdir='z', offset=0, cmap=cm.coolwarm)
ax.plot_surface(X, Y, A[0,0]*X + A[0,1]*Y,cmap='viridis',linewidth=0)
ax.plot(l[:,0], l[:,1], np.ones_like(l[:,0])*b)
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.set_zlabel('Z axis')
plt.show()