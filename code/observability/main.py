from mpl_toolkits.mplot3d import axes3d
import matplotlib.pyplot as plt
from matplotlib import cm
import numpy as np
from scipy.stats import multivariate_normal

Sigma = np.array([[1, 0], [0, 1]])
C = np.array([[1.0, 0.5]])
mu = np.array([0, 0]).T
x_r = np.array([4.0, 2.5]).T
y = C.dot(x_r)

print("x_r", x_r)
print("mu", mu)
print("Sigma ", Sigma)

print("C", C)
print("y", y)


In = 10 + np.dot(C, Sigma.dot(C.T))
print("In", In)
Inv = np.linalg.solve(In, C)
print("Inverse", Inv)
print(np.dot(Sigma,np.dot(C.T, Inv)))
Proj = np.dot(np.dot(Sigma, C.T), Inv)
print("Proj", Proj)
Nullspace = np.eye(2) - Proj
print("Nullspace", Nullspace)

Sigma_new = Nullspace.dot(Proj)
mu_new = Proj.dot(x_r) + Nullspace.dot(mu)

print("Sigma_new", Sigma_new)

print("mu_new", mu_new)

u, s, vh = np.linalg.svd(Sigma_new, full_matrices=True)

Sigma_T = u.dot(np.diag([s[1], s[0]]).dot(vh))
print(Sigma_T)
print(u,s,vh)

#plot


print(mun)


#Create grid and multivariate normal
x = np.linspace(0,5,100)
y = np.linspace(0,5,100)
X, Y = np.meshgrid(x,y)
pos = np.empty(X.shape + (2,))
pos[:, :, 0] = X; pos[:, :, 1] = Y
rv = multivariate_normal([mu[0],mu[1]], Sigma)

nv = multivariate_normal([mu_new[0], mu_new[1]], Sigma_new+np.eye(2)*0.001)

#Make a 3D plot
fig = plt.figure()
ax = fig.gca(projection='3d')
cset = ax.contour(X, Y, rv.pdf(pos), zdir='z', offset=0, cmap=cm.coolwarm)
cset = ax.contour(X, Y, nv.pdf(pos), zdir='z', offset=0, cmap=cm.coolwarm)
ax.plot_surface(X, Y, C[0,0]*X + C[0,1]*Y,cmap='viridis',linewidth=0)
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.set_zlabel('Z axis')
plt.show()