---
layout: post
title:  "Fourier curves"
date:   2018-11-24 00:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---
Inspired by [Cliff Pickovers tweet](https://twitter.com/pickover/status/1065227111315767297?s=19) and powered by my fascination about the Fourier transform, I took the time to derive and implement the Fourier series of a two dimensional  piecewise linear parametric curve. 
<!--more-->

By clicking on the empty canvas you can design your custom shape. If you close the path, the Fourier series will be animated similarly to the video mentioned above. Have fun!
<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/euler/mechanical_system.js"></script>

<style>
.button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 25px;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
}

.button:hover {
    background-color: green;
}
</style>





<div id="fourier"></div>

<button onclick="toggle_ellipses();" id="ell_btn" class="button">Toggle ellipses</button> <button onclick="toggle_lines();"  id="lin_btn" class="button">Toggle lines</button>




<div id="yx"></div>

<div id="yy"></div>



<script type="text/javascript">

var show_ellipses = true;
var show_lines = true;

function toggle_ellipses(){
	show_ellipses = !show_ellipses;

	eg.style("visibility",show_ellipses?"visible":"hidden")
}


function toggle_lines(){
	show_lines = !show_lines;
	vg.style("visibility",show_lines?"visible":"hidden")
}



// define path

var points = [];
var r_0 = 7;
var r = 4;
var T = 5;

var omega = 2*Math.PI/T;

var y = {x: [], y: []};

var time;



var N_start = 1;
var N_max = 30;
var N_inc = 1;

var N = N_start;

var cx;
var cy;


var NP;

var curr_step = 0;
var steps = 400;

var dt = T/steps;

var fp;

var vp;

var ells = [];

function calc_coeff(f){
	// pre calculate sin and cos

	var S = Array(N+1).fill(null).map(()=>Array(NP).fill(null));
	var C = Array(N+1).fill(null).map(()=>Array(NP).fill(null));
	a = [];

	A = [];
	phi = [];

	for (var k=0; k<N+1;k++){
		for(var i=0; i<NP; i++){
			S[k][i] = Math.sin(k*omega*time[i]);
			C[k][i] = Math.cos(k*omega*time[i]);
		}
	}

	for(var i=0; i<NP-1; i++){
		a[i] = (f[i+1] - f[i])/(time[i+1] - time[i]);	
	}

	for (var k=0; k<N+1;k++){

		var re = 0;
		var im = 0;

		if(k==0){
			for(var i=0; i<NP-1; i++){
			 	re+= (f[i]-time[i]*a[i])*(time[i+1]-time[i]) + a[i]/2*(time[i+1]*time[i+1]-time[i]*time[i]);
			}
			re = 1/T*re;
		}else{
			for(var i=0; i<NP-1; i++){
			 	re+= -f[i]*S[k][i] + f[i+1]*S[k][i+1] -a[i]/(k*omega)*C[k][i] +a[i]/(k*omega)*C[k][i+1];

			 	im+= -f[i]*C[k][i] + f[i+1]*C[k][i+1] +a[i]/(k*omega)*S[k][i] -a[i]/(k*omega)*S[k][i+1];
			}
			re = 1/(2*Math.PI*k)*re;
			im = 1/(2*Math.PI*k)*im;
		}

		if (k==0){
			A[k] = re; 
		}else{
			A[k] = 2*Math.sqrt(re*re + im*im);
		}

		if (k==0){
			phi[k] = Math.PI/2; 
		}else{
			phi[k] = Math.atan2(re, -im);
		}
	}
	return {A: A, phi:phi};
}

function calc_fourier_ramp(cx,cy){

	fp = [];

	vp = [];
	for(var step=0; step<steps+1;step++){

		var t = step/steps*T;

		var p = [points[0][0],points[0][1]]
		var vpp = [];
		for (var k=0; k<N+1;k++){
			p[0]+=cx.A[k]*Math.sin(k*omega*t+cx.phi[k])
			p[1]+=cy.A[k]*Math.sin(k*omega*t+cy.phi[k])
			vpp.push([p[0], p[1]]);
		}
		vp.push(vpp);
		fp.push(p);
	}

}

function draw_fourier_ramp(){

	fps = fp.slice(0, curr_step+1);


	path_f = path_f.data([fps])
    path_f.attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('fill', 'none');	
    path_f.enter().append('svg:path').attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('fill', 'none');	
    path_f.exit().remove();


	vg.selectAll("path").remove()
    for(var k=0;k<N;k++){
    	vg.append("path")
    		.attr("d","M " + vp[curr_step][k][0] + " " + vp[curr_step][k][1] + " L " + vp[curr_step][k+1][0] + " " + vp[curr_step][k+1][1])
    		.style('stroke-width', 1)
        	.style('stroke', 'red')
        	.style('fill', 'none');	
    }


}

function calc_ellipse(){
	ells = [];
	console.log(eg)
	eg.selectAll("g").remove()
	//var eg = svg.append("g");
	for (var k=1; k<N+1;k++){
		var ell = [];
	    for(var step=0; step<steps+1;step++){

	    	 ell.push([vp[step][k][0]-vp[step][k-1][0],vp[step][k][1]-vp[step][k-1][1]]);
	    }

	    c_x = vp[curr_step][k-1][0];
	    c_y = vp[curr_step][k-1][1];

	    console.log(eg)
		eeg = eg.append("g")
				.attr("transform","translate(" + c_x + "," + c_y + ")")
		path_e = eeg.append("path");


		path_e = path_e.data([ell])
	    path_e.attr('d', function(d){return line(d)})
	        .style('stroke-width', 1)
	        .style('stroke', 'blue')
	        .style('fill', 'none');	
	    path_e.enter().append('svg:path').attr('d', function(d){return line(d)})
	        .style('stroke-width', 1)
	        .style('stroke', 'blue')
	        .style('fill', 'none');	
	    path_e.exit().remove();

	    ells.push(eeg)
	}
}


function draw_ellipse(){

 	for (var k=1; k<N+1;k++){
	    c_x = vp[curr_step][k-1][0];
	    c_y = vp[curr_step][k-1][1];

		ells[k-1].attr("transform","translate(" + c_x + "," + c_y + ")")

	}

}

function update_path(){



	path = path.data([points])
    path.attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'steelblue')
        .style('fill', 'none');
    path.enter().append('svg:path').attr('d', function(d){return line(d)})
        .style('stroke-width', 1)
        .style('stroke', 'steelblue')
        .style('fill', 'none');
    path.exit().remove()	
}

function animate(){
	
	if(curr_step>steps){
		curr_step = 0;
		N+=N_inc;
		if(N>N_max){
			N = N_start;
		}
		cx = calc_coeff(y.x);
		cy = calc_coeff(y.y);
		calc_fourier_ramp(cx,cy);
		calc_ellipse()
	}

	draw_fourier_ramp();
	draw_ellipse()
	curr_step++;
}

function click_circ(i){
	svg.on("mousedown",null)
	points.push(points[0]);
	update_path();
	calc_y();
	//draw_components();

	svg.selectAll("circle").remove()


	cx = calc_coeff(y.x);
	cy = calc_coeff(y.y);
	calc_fourier_ramp(cx,cy);
	calc_ellipse()

	window.setInterval(animate, 1000*dt );
}

function dist(x1,x2){

	return Math.sqrt((x1[0]-x2[0])*(x1[0]-x2[0]) + (x1[1]-x2[1])*(x1[1]-x2[1]) );
}

function calc_y(){
	// compute distances

	time = [];
	time.push(0);
	var total_dist = 0;
	var d;
	for(var i=0; i<points.length-1; i++){
		d = dist(points[i],points[i+1]);
		total_dist+=d
		time.push(d)
	}

	// total time
	for(var i=1; i<points.length; i++){
		time[i] = time[i-1] + time[i]*T/total_dist;
	}




	for(var i=0; i<points.length; i++){
		y.x.push(points[i][0]-points[0][0])
	}

	for(var i=0; i<points.length; i++){
		y.y.push(points[i][1]-points[0][1])
	}

	NP = time.length;

}

function draw_components(){

	pxmax = Math.max.apply(Math, y.x);
	pxmin = Math.min.apply(Math, y.x);
	// compute function
	var px = [];
	for(var i=0; i<y.x.length;i++){
		px.push([time[i],(y.x[i]-pxmin)/(pxmax-pxmin)])
	} 

	var svgyx = d3.select('#yx').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + T +  " " + (pxmax-pxmin)/(pxmax-pxmin))


	var pathyx = svgyx.append("path");


	pathyx = pathyx.data([px])
    pathyx.attr('d', function(d){return line(d)})
        .style('stroke-width', 0.01)
        .style('stroke', 'steelblue')
        .style('fill', 'none');	

	pymax = Math.max.apply(Math, y.y);
	pymin = Math.min.apply(Math, y.y);
	// compute function
	var py = [];
	for(var i=0; i<y.y.length;i++){
		py.push([time[i],(y.y[i]-pymin)/(pymax-pymin)])
	} 

	var svgyy = d3.select('#yy').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + T +  " " + (pymax-pymin)/(pymax-pymin))


	var pathyy = svgyy.append("path");


	pathyy = pathyy.data([py])
    pathyy.attr('d', function(d){return line(d)})
        .style('stroke-width', 0.01)
        .style('stroke', 'steelblue')
        .style('fill', 'none');	

}



function click(){
	var coords = d3.mouse(this);

	points.push(coords);   // Push data to our array

	svg.selectAll("circle")  // For new circle, go through the update process
		.data(points)
		.enter()
		.append("circle")
		.attr("cx", function(d) { return d[0]; })
		.attr("cy", function(d) { return d[1]; })  // Get attributes from circleAttrs var
		.style("fill", function(d,i) { return (i==0)?"#00F":"#000"; })
		.attr("r", function(d,i) { return (i==0)?r_0:r; })
		.on("mousedown", function(d,i) { if(i==0)click_circ(i)})  // Get attributes from circleAttrs var

	update_path();



}

var line = d3.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })

var svg = d3.select('#fourier').append('svg')
			.style("width","100%")
			.style("border","1px solid black")
			.attr("viewBox","0 0 " + 500 +  " " + 300)
			.on("mousedown", click)

var path = svg.append("path");

var path_f = svg.append("path");



var vg = svg.append("g");

var eg = svg.append("g");








</script>

## Derivation
The following derivation shows a way to obtain the equations of the Fourier series of a two dimensional piecewise linear parametric curve. Please be aware, that this is certainly not the most efficient way to derive it. 

We will treat the \\(x\\) and \\(y\\) component of the function separately. Therefore, we calculate the Fourier series for both components separately.

# Fourier series

The complex Fourier series is defined as

$$ y(t) = \sum \limits_{-\infty}^{\infty} \hat{y}_k e^{ik\omega t} $$

with

$$ \hat{y}_k = \frac{1}{T} \int\limits_0^T y(t) e^{-ik\omega t} \,dt .$$

Our component functions \\(y(t)\\) are piecewise linear and can be defined as 

$$ y(t) = y_{i} + (t - T_i)\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}  \,\text{ , }\, T_i \leq t < T_{i+1} $$

Let's calculate the Fourier coefficients. We start with \\(k=0\\):

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} \int\limits_{T_i}^{T_{i+1}} \left(y_{i} + (t - T_i)\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) e^{-i0\omega t} \,dt $$

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} \int\limits_{T_i}^{T_{i+1}} \left(y_{i} + (t - T_i)\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \,dt $$

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} y_{i}\int\limits_{T_i}^{T_{i+1}} 1   \,dt + \frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\int\limits_{T_i}^{T_{i+1}} t \,dt - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\int\limits_{T_i}^{T_{i+1}} 1 \,dt $$

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} y_{i}\left[t\right]_{T_i}^{T_{i+1}}  + \frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\left[\frac{1}{2}t^2\right]_{T_i}^{T_{i+1}} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\left[t\right]_{T_i}^{T_{i+1}} $$

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} y_{i}\left[T_{i+1} - T_i \right]  + \frac{1}{2}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\left[T_{i+1}^2 - T_i^2\right] - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\left[T_{i+1} - T_i\right] $$

$$ \hat{y}_0 = \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \left[T_{i+1} - T_i \right]  + \frac{1}{2}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\left[T_{i+1}^2 - T_i^2\right]  $$


Now we look at the general case \\(k>0\\):

$$ \hat{y}_k = \frac{1}{T} \sum_{i=0}^{N-1} \int\limits_{T_i}^{T_{i+1}} \left(y_{i} + (t - T_i)\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) e^{-ik\omega t} \,dt $$


$$ \hat{y}_k = \frac{1}{T} \sum_{i=0}^{N-1} \int\limits_{T_i}^{T_{i+1}} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) e^{-ik\omega t} \,dt + \frac{1}{T} \sum_{i=0}^{N-1} \int\limits_{T_i}^{T_{i+1}} t\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}e^{-ik\omega t} \,dt $$

$$ \hat{y}_k = \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right)\int\limits_{T_i}^{T_{i+1}}  e^{-ik\omega t} \,dt + \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i} \int\limits_{T_i}^{T_{i+1}} te^{-ik\omega t} \,dt $$


The first term simplifies to

$$ \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \int\limits_{T_i}^{T_{i+1}}  e^{-ik\omega t} \,dt  $$



$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \left[ \frac{1}{-ik\omega}  e^{-ik\omega t} \right]_{T_i}^{T_{i+1}}  $$

$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{i}{k\omega}\left[   e^{-ik\omega T_{i+1}} - e^{-ik\omega T_i} \right]  $$

$$ \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{i}{k\omega}\left[ \cos(-k\omega T_{i+1}) + i\sin(-k\omega T_{i+1})   - \cos(-k\omega T_{i}) - i\sin(-k\omega T_{i})  \right]  $$

$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{1}{k\omega}\left[ i\cos(-k\omega T_{i+1}) -\sin(-k\omega T_{i+1})   - i\cos(-k\omega T_{i}) +\sin(-k\omega T_{i})  \right] $$





$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{1}{k\omega}\left[ i\cos(k\omega T_{i+1}) +\sin(k\omega T_{i+1})   - i\cos(k\omega T_{i}) -\sin(k\omega T_{i})  \right]  $$

$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{1}{k\omega}\left[\sin(k\omega T_{i+1}) -\sin(k\omega T_{i}) + i\left[\cos(k\omega T_{i+1})    - \cos(k\omega T_{i})\right]  \right] $$


We now look at the second term

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i} \int\limits_{T_i}^{T_{i+1}} te^{-ik\omega t} \,dt .$$

Fortunately, we know the identity

$$ \int\limits_0^1 x^n e^{-ax}\,dx = \frac{n!}{a^{n+1}}\left[1 - e^{-a}\sum_{i=0}^n \frac{a^i}{i!}\right]. $$

We can use it, by applying the coordinate transformation to our integral

$$ t = T_i + (T_{i+1} - T_i)x $$

$$ dt = (T_{i+1} - T_i)\,dx $$

$$ x = \frac{t - T_i}{T_{i+1} - T_i} $$


We obtain

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i} \int\limits_{0}^{1} (T_i + (T_{i+1} - T_i)x)e^{-ik\omega (T_i + (T_{i+1} - T_i)x)}(T_{i+1} - T_i) \,dx $$

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}(T_{i+1} - T_i) e^{-ik\omega T_i} \left[T_i\int\limits_{0}^{1}  e^{-ik\omega (T_{i+1} - T_i)x} \,dx + (T_{i+1} - T_i)\int\limits_{0}^{1} xe^{-ik\omega (T_{i+1} - T_i)x} \,dx \right] $$


$$  \frac{1}{T} \sum_{i=0}^{N-1}(y_{i+1}-y_{i}) e^{-ik\omega T_i} \left[T_i\int\limits_{0}^{1}  e^{-ik\omega (T_{i+1} - T_i)x} \,dx + (T_{i+1} - T_i)\int\limits_{0}^{1} xe^{-ik\omega (T_{i+1} - T_i)x} \,dx \right] $$

Now we have to integrals of the identity above. The first integral is

$$ \int\limits_{0}^{1}  e^{-ik\omega (T_{i+1} - T_i)x} \,dx  $$

with \\(a = ik\omega (T_{i+1} - T_i) \\) and \\(n=0\\). It follows


$$ \int\limits_0^1 x^n e^{-ax}\,dx = \frac{0!}{a^{0+1}}\left[1 - e^{-a}\sum_{i=0}^0 \frac{a^i}{i!}\right] =  \frac{1}{a}\left[1 - e^{-a}\right] =  \frac{1}{ik\omega (T_{i+1} - T_i)}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}\right] $$


The second integral is

$$ \int\limits_{0}^{1} xe^{-ik\omega (T_{i+1} - T_i)x} \,dx  $$

with \\(a = ik\omega (T_{i+1} - T_i) \\) and \\(n=1\\).

It follows


$$ \int\limits_0^1 x^n e^{-ax}\,dx = \frac{1!}{a^{1+1}}\left[1 - e^{-a}\sum_{i=0}^1 \frac{a^i}{i!}\right] =  \frac{1}{a^2}\left[1 - e^{-a}(1 + a)\right] =  \frac{1}{-k^2\omega^2 (T_{i+1} - T_i)^2}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}(1 + ik\omega (T_{i+1} - T_i))\right] $$

We insert the results back into our equation


$$  \frac{1}{T} \sum_{i=0}^{N-1}(y_{i+1}-y_{i}) e^{-ik\omega T_i} \left[T_i\frac{1}{ik\omega (T_{i+1} - T_i)}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}\right] + (T_{i+1} - T_i)\frac{1}{-k^2\omega^2 (T_{i+1} - T_i)^2}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}(1 + ik\omega (T_{i+1} - T_i))\right] \right] $$




$$  \frac{1}{T} \sum_{i=0}^{N-1}(y_{i+1}-y_{i}) e^{-ik\omega T_i} \left[-\frac{i T_i}{k\omega (T_{i+1} - T_i)}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}\right] -\frac{1}{k^2\omega^2 (T_{i+1} - T_i)}\left[1 - e^{-ik\omega (T_{i+1} - T_i)}(1 + ik\omega (T_{i+1} - T_i))\right] \right] $$


$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)} e^{-ik\omega T_i} \left[-i T_i\left[1 - e^{-ik\omega (T_{i+1} - T_i)}\right] - \frac{1}{k\omega }\left[1 - e^{-ik\omega (T_{i+1} - T_i)}(1 + ik\omega (T_{i+1} - T_i))\right] \right] $$




$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[-i T_i e^{-ik\omega T_i} +i T_ie^{-ik\omega T_i}e^{-ik\omega (T_{i+1} - T_i)} - \frac{1}{k\omega }e^{-ik\omega T_i} + \frac{1}{k\omega }e^{-ik\omega T_i}e^{-ik\omega (T_{i+1} - T_i)}(1 + ik\omega (T_{i+1} - T_i)) \right] $$




$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[-i T_i e^{-ik\omega T_i} +i T_ie^{-ik\omega T_{i+1}} - \frac{1}{k\omega }e^{-ik\omega T_i} + \frac{1}{k\omega }e^{-ik\omega T_{i+1}}(1 + ik\omega (T_{i+1} - T_i)) \right] $$



$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[-i T_i e^{-ik\omega T_i} +i T_ie^{-ik\omega T_{i+1}} - \frac{1}{k\omega }e^{-ik\omega T_i} + \frac{1}{k\omega }e^{-ik\omega T_{i+1}}+ \frac{1}{k\omega }e^{-ik\omega T_{i+1}}ik\omega (T_{i+1} - T_i) \right] $$



$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[-i T_i e^{-ik\omega T_i} +i T_ie^{-ik\omega T_{i+1}} - \frac{1}{k\omega }e^{-ik\omega T_i} + \frac{1}{k\omega }e^{-ik\omega T_{i+1}}+ iT_{i+1}e^{-ik\omega T_{i+1}} - iT_ie^{-ik\omega T_{i+1}} \right] $$




$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[-i T_i e^{-ik\omega T_i} - \frac{1}{k\omega }e^{-ik\omega T_i} + \frac{1}{k\omega }e^{-ik\omega T_{i+1}}+ iT_{i+1}e^{-ik\omega T_{i+1}} \right] $$

We replace the exponential terms with \\(\sin\\) and \\(\cos\\)

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[
-i T_i (\cos(-k\omega T_{i}) + i\sin(-k\omega T_{i})) 
- \frac{1}{k\omega }(\cos(-k\omega T_{i}) + i\sin(-k\omega T_{i})) 
+ \frac{1}{k\omega }(\cos(-k\omega T_{i+1}) + i\sin(-k\omega T_{i+1}))
+ iT_{i+1}(\cos(-k\omega T_{i+1}) + i\sin(-k\omega T_{i+1})) \right] $$

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[ 
-i T_i\cos(-k\omega T_{i}) 
+ T_i\sin(-k\omega T_{i}) 
- \frac{1}{k\omega }\cos(-k\omega T_{i}) 
-i\frac{1}{k\omega }\sin(-k\omega T_{i}) 
+ \frac{1}{k\omega }\cos(-k\omega T_{i+1}) 
+ i\frac{1}{k\omega }\sin(-k\omega T_{i+1})
+ iT_{i+1}\cos(-k\omega T_{i+1}) 
- T_{i+1}\sin(-k\omega T_{i+1}) \right] $$

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[ 
-i T_i\cos(k\omega T_{i}) 
- T_i\sin(k\omega T_{i}) 
- \frac{1}{k\omega }\cos(k\omega T_{i}) 
+i\frac{1}{k\omega }\sin(k\omega T_{i}) 
+ \frac{1}{k\omega }\cos(k\omega T_{i+1}) 
-i\frac{1}{k\omega }\sin(k\omega T_{i+1})
+ iT_{i+1}\cos(k\omega T_{i+1}) 
+ T_{i+1}\sin(k\omega T_{i+1}) \right] $$


$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[
- T_i\sin(k\omega T_{i})
- \frac{1}{k\omega }\cos(k\omega T_{i})
+ \frac{1}{k\omega }\cos(k\omega T_{i+1})
+ T_{i+1}\sin(k\omega T_{i+1})
 +i\left[-T_i\cos(k\omega T_{i})   
 +\frac{1}{k\omega }\sin(k\omega T_{i})  
 -\frac{1}{k\omega }\sin(k\omega T_{i+1})
 + T_{i+1}\cos(k\omega T_{i+1}) \right]  \right] $$

We now look again at our first term from above and separate it
$$  \frac{1}{T} \sum_{i=0}^{N-1} \left(y_{i} - T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i}\right) \frac{1}{k\omega}\left[\sin(k\omega T_{i+1}) -\sin(k\omega T_{i}) + i\left[\cos(k\omega T_{i+1})    - \cos(k\omega T_{i})\right]  \right] $$

into 

$$  -\frac{1}{T} \sum_{i=0}^{N-1} T_i\frac{y_{i+1}-y_{i}}{T_{i+1} - T_i} \frac{1}{k\omega}\left[\sin(k\omega T_{i+1}) -\sin(k\omega T_{i}) + i\left[\cos(k\omega T_{i+1})    - \cos(k\omega T_{i})\right]  \right] $$

and

$$  \frac{1}{T} \sum_{i=0}^{N-1} y_{i}\frac{1}{k\omega}\left[\sin(k\omega T_{i+1}) -\sin(k\omega T_{i}) + i\left[\cos(k\omega T_{i+1})    - \cos(k\omega T_{i})\right]  \right] .$$



We combine the result of the second term with first equation of the separation

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[
- T_i\sin(k\omega T_{i})
- \frac{1}{k\omega }\cos(k\omega T_{i})
+ \frac{1}{k\omega }\cos(k\omega T_{i+1})
+ T_{i+1}\sin(k\omega T_{i+1})
 +i\left[-T_i\cos(k\omega T_{i})   
 +\frac{1}{k\omega }\sin(k\omega T_{i})  
 -\frac{1}{k\omega }\sin(k\omega T_{i+1})
 + T_{i+1}\cos(k\omega T_{i+1}) \right]

-T_i\sin(k\omega T_{i+1}) 
+T_i\sin(k\omega T_{i}) 
+ i\left[-T_i\cos(k\omega T_{i+1})    
+T_i \cos(k\omega T_{i})\right]
  \right] $$


$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[
\underbrace{- T_i\sin(k\omega T_{i})
+T_i\sin(k\omega T_{i}) }_{0}
- \frac{1}{k\omega }\cos(k\omega T_{i})
+ \frac{1}{k\omega }\cos(k\omega T_{i+1})
+ (T_{i+1}-T_i)\sin(k\omega T_{i+1})
 +i\left[\underbrace{-T_i\cos(k\omega T_{i})  
 +T_i \cos(k\omega T_{i}) }_{0}  
 +\frac{1}{k\omega }\sin(k\omega T_{i})  
 -\frac{1}{k\omega }\sin(k\omega T_{i+1})
 + (T_{i+1}-T_i)\cos(k\omega T_{i+1}) \right]
  \right] $$

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{y_{i+1}-y_{i}}{k\omega (T_{i+1} - T_i)}  \left[
- \frac{1}{k\omega }\cos(k\omega T_{i})
+ \frac{1}{k\omega }\cos(k\omega T_{i+1})
+ (T_{i+1}-T_i)\sin(k\omega T_{i+1})
 +i\left[  
 \frac{1}{k\omega }\sin(k\omega T_{i})  
 -\frac{1}{k\omega }\sin(k\omega T_{i+1})
 + (T_{i+1}-T_i)\cos(k\omega T_{i+1}) \right]
  \right] $$


Now we incorporate the second part of the separation.

With the helping variable

  $$ a = \frac{y_{i+1}-y_{i}}{(T_{i+1} - T_i)} $$

follows

$$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{1}{k\omega}  \left[
 -y_i\sin(k\omega T_{i}) 
+(y_i+a(T_{i+1}-T_i))\sin(k\omega T_{i+1}) 
- \frac{a}{k\omega }\cos(k\omega T_{i})
+ \frac{a}{k\omega }\cos(k\omega T_{i+1})
 +i\left[
 - y_i\cos(k\omega T_{i})
 +(y_i+a(T_{i+1}-T_i))\cos(k\omega T_{i+1})
 +\frac{a}{k\omega }\sin(k\omega T_{i})  
 -\frac{a}{k\omega }\sin(k\omega T_{i+1})
 \right] 

  \right] $$

  $$  \frac{1}{T} \sum_{i=0}^{N-1}\frac{1}{k\omega}  \left[
 -y_i\sin(k\omega T_{i}) 
+y_{i+1}\sin(k\omega T_{i+1}) 
- \frac{a}{k\omega }\cos(k\omega T_{i})
+ \frac{a}{k\omega }\cos(k\omega T_{i+1})
 +i\left[
 - y_i\cos(k\omega T_{i})
 +y_{i+1}\cos(k\omega T_{i+1})
 +\frac{a}{k\omega }\sin(k\omega T_{i})  
 -\frac{a}{k\omega }\sin(k\omega T_{i+1})
 \right] 

  \right] $$



  The resulting formula is 

$$ \hat{y}_k =  \frac{1}{T} \sum_{i=0}^{N-1}\frac{1}{k\omega}  \left[
 -y_i\sin(k\omega T_{i}) 
+y_{i+1}\sin(k\omega T_{i+1}) 
- \frac{a}{k\omega }\cos(k\omega T_{i})
+ \frac{a}{k\omega }\cos(k\omega T_{i+1})
 +i\left[
 - y_i\cos(k\omega T_{i})
 +y_{i+1}\cos(k\omega T_{i+1})
 +\frac{a}{k\omega }\sin(k\omega T_{i})  
 -\frac{a}{k\omega }\sin(k\omega T_{i+1})
 \right] 

  \right] $$


  We note that we can \\(\frac{1}{T}\frac{1}{k\omega} = \frac{1}{2\pi k}\\) and finally obtain

$$ \hat{y}_k =  \frac{1}{2\pi k} \sum_{i=0}^{N-1}  \left[
 -y_i\sin(k\omega T_{i}) 
+y_{i+1}\sin(k\omega T_{i+1}) 
- \frac{a}{k\omega }\cos(k\omega T_{i})
+ \frac{a}{k\omega }\cos(k\omega T_{i+1})
 +i\left[
 - y_i\cos(k\omega T_{i})
 +y_{i+1}\cos(k\omega T_{i+1})
 +\frac{a}{k\omega }\sin(k\omega T_{i})  
 -\frac{a}{k\omega }\sin(k\omega T_{i+1})
 \right] 

  \right] $$


In the final step, we can express our result as 

  $$ y(t) = \sum_{k=0}^N A_k \sin(k\omega t + \varphi_k) $$

with coefficients

  $$ A_k = \begin{cases}
      \hat{y}_0 & k = 0 \\
      2 |\hat{y}_k|      & k>0
    \end{cases} $$

and 

  $$ \varphi_l = \begin{cases}
      \frac{\pi}{2} & k = 0 \\
      \text{atan2}( \Re(\hat{y}_k), - \Im(\hat{y}_k))      & k>0
    \end{cases}. $$






