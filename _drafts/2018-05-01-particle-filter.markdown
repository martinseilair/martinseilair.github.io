---
layout: post
title:  "Particle filter"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
excerpt_separator: <!--more-->
---
Particle filter are an extremly helpful tool for tracking dynamic systems. This article is meant to be an introduction to particle filters with a strong focus on visual examples. In the course of this post we will think about the main idea of the particle filter, derive the corresponding equations and look at an interactive example on the way. In order to follow the steps in this post you should bring some basic knowledge of math and probability theory in particular. In the derivations and explanations, I tried to take as small steps as possible, to keep everyone on board. Let's dive into it!
<!--more-->
<script src="//d3js.org/d3.v3.js" charset="utf-8"></script>
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>






<script type="text/javascript">

class ParticleFilter {

	constructor(){
		this.points = [];
		this.n = 100;




	}

	init_samples(){
		this.points = [];
		var rn = this.n + Math.floor(5.0*Math.random());
		for (var i=0; i<rn; i++){
			this.points.push({pos: Math.random(), w:Math.random()})	
		}
	}

}



class RadialRaceTrack {
    constructor(w, h, base_x, base_y, base_radius, race_track_radius) {

		this.base_radius = base_radius;

		this.w = w;
		this.h = h;
		this.base_x = base_x;
		this.base_y = base_y;
		this.base_radius = base_radius;
		this.race_track_radius = race_track_radius
		this.map_rad = [];
		this.map_pos = [];
		this.svg = [];
		this.car = [];

		this.create_map();


		this.track_length = this.map_pos[this.map_pos.length - 1];
    }

    index_lin_interp(arr, value){

    	if(arr[0]>value){
    		return [0, 0.0];
    	}
    	if(arr[arr.length - 1]<value){
    		return [arr.length - 2, 1.0];
    	}

    	for (var i=0; i<arr.length; i++){
    		if(arr[i]>value){
    			return [i-1, (value - arr[i-1])/(arr[i-1] - arr[i])]

    		}
    	}
    }

	lin_interp(arr, par){
    	return arr[par[0]] + par[1]*(arr[par[0]] - arr[par[0]+1])
    }



    get_pos(rad){
    	return this.lin_interp(this.map_pos, this.index_lin_interp(this.map_rad, rad));
    }

    get_rad(pos){
		return this.lin_interp(this.map_rad, this.index_lin_interp(this.map_pos, pos));
    }


    create_map(){
	    var n = 1000;
		var s = 0;

		var r = 0.0;
		var da = 2.0*Math.PI/n;
		var rad = 0.0;

		this.map_rad.push(rad);
		this.map_pos.push(s);
		var r_old = this.race_track_radius(rad);


		for (var p=1;p<=n;p++){
			rad = p*2*Math.PI/n;
			r = this.race_track_radius(rad);
			s+=Math.sqrt(r_old*r_old + r*r - 2.0*r_old*r*Math.cos(da));
			this.map_rad.push(rad);
			this.map_pos.push(s);
			r_old = r;
		}
	}	

	get_angle(rad){
		var eps = 0.0001;

		var c1 = this.race_track_pos_abs(rad);
		var c2 = this.race_track_pos_abs(rad + eps);

		return Math.atan2(c2[1]-c1[1],c2[0]-c1[0]);

	}

	init_car(pos){

		this.g = this.svg.append("g")
		this.g.append("image")
			.attr("x",0)
			.attr("y",-5)
			.attr("width",100)
			.attr("xlink:href","{{ base.url | prepend: site.url }}/assets/svg/car.svg")

	 	this.update_car(pos)
	}

	update_car(pos){
		pos = pos % this.track_length;
		var rad = this.get_rad(pos);
		var c = this.race_track_pos_abs(rad)
		var s = -0.8;
		var angle = this.get_angle(rad)/Math.PI*180.0;

		this.g.transition().attr("transform","translate(" + c[0] + "," + c[1] + ") scale(" + s + ") rotate(" + angle + ") translate(-50.0, -40.0)").duration(dur);



	}

    draw_tree(svg, x, y, s){
	    var trunk_w = 12.0;
	    var trunk_h = 30.0;
	    var d = 10.0;

	    // define clipping path for leaves and trunk
		var defs = svg.append("defs");

		var leaves_clip = defs
			.append("clipPath")
			.attr("id", "leavesshape"); 

		leaves_clip.append("path")
			.attr("d","m 0.0,0.0 c 50.0,0.0 10.0,-100.0 0.0,-100.0 c -10.0,0.0 -50.0,100.0 0.0,100.0")

		var trunk_clip = defs
			.append("clipPath")
			.attr("id", "trunkshape"); 

		trunk_clip.append("rect")
			.attr("x", -trunk_w/2.0)
			.attr("y", -d)
			.attr("width", trunk_w)
			.attr("height", trunk_h);


		// append layer for tree
		var treeg = svg.append("g")
			.attr("transform","translate(" + x  + "," + (y) + ") scale(" + s + ") translate(0.0, " + (- trunk_h + d) +")");

		// shadow
		treeg.append("ellipse")
			.attr("cx",0.0)
			.attr("cy", trunk_h - d)    
			.attr("rx",15.0)
			.attr("ry",5.0)
			.style("fill","#000000")
			.style("opacity",0.1);	

		// trunk
		var trunk = treeg.append("g")
			.attr("clip-path","url(#trunkshape)");

		trunk.append("rect")
			.attr("x", -trunk_w/2.0)
			.attr("y", -d)
			.attr("width", trunk_w)
			.attr("height", trunk_h+d)
			.attr("fill","#795437");	

		trunk.append("rect")
			.attr("x", -trunk_w)
			.attr("y", -d)
			.attr("width", trunk_w)
			.attr("height", trunk_h+d)
			.attr("fill","#9f7b5b");

		// leaves
		var leaves = treeg.append("g")
			.attr("clip-path","url(#leavesshape)");   

		leaves.append("rect")	
			.attr("x", -60.0)
			.attr("y", -110.0)
			.attr("width", 120.0)
			.attr("height", 120.0)
			.attr("fill","#6f9329");	

		leaves.append("rect")	
			.attr("x", 0.0)
			.attr("y", -110.0)
			.attr("width", 60.0)
			.attr("height", 120.0)
			.attr("fill","#557218");   
	}

	race_track_pos_abs(rad){
		var r = this.race_track_radius(rad);
		return [this.base_x + r*Math.cos(rad),this.base_y + r*Math.sin(rad)];
	}


	draw_point_rad(rad, color){
		var c = race_track_pos_abs(rad);

		this.svg.append("circle")
			.attr("cx",c[0])
			.attr("cy",c[1])
			.attr("r",5.0)
			.style("fill",color);

	}

	draw_point_pos(pos,color){

		var rad = this.get_rad(pos);

		this.draw_point_rad(rad, color);
	}



	draw_points(points){


		var data = [];
		var c;
		for (var i=0; i<points.length;i++){
			c = this.race_track_pos_abs(this.get_rad(this.track_length*points[i].pos));
			data.push({ "cx": c[0], "cy": c[1], "r": 10.0*points[i].w+5.0})
		}

		var p = this.svg.selectAll("circle")
			.data(data);
		p
		.attr("cx",function(d){return d.cx})
		.attr("cy",function(d){return d.cy})
		.attr("r",function(d){return d.r})


		p.enter().append("circle")
		.attr("cx",function(d){return d.cx})
		.attr("cy",function(d){return d.cy})
		.attr("r",function(d){return d.r})
		.style("fill","red")
		.style("opacity",0.3);

		// EXIT
		// Remove old elements as needed.
		p.exit().remove();


	}

	draw_race_track(svg_dom){

		// define race track
		this.svg = d3.select(svg_dom);
		this.svg.attr("viewBox","0 0 " + this.w + " " + this.h);


		var n = 500;

		var race_track_data = [];
		var r,x,y;
		var rad,c;

		for (var i=0; i<n; i++){
			rad = i/n*2.0*Math.PI;
			c = this.race_track_pos_abs(rad)
			race_track_data.push({ "x": c[0],   "y": c[1]});
		}

		//race_track_data.push(race_track_data[0])

		//This is the accessor function we talked about above
		var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("linear");

		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(race_track_data)+"Z")
			.attr("stroke", "#FFF")
			.attr("stroke-width", 35)
			.attr("fill", "none")
			.attr("stroke-linejoin","round");

		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(race_track_data)+"Z")
			.attr("stroke", "#888")
			.attr("stroke-width", 30)
			.attr("fill", "none")
			.attr("stroke-linejoin","round");


		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(race_track_data)+"Z")
			.attr("stroke", "#EEE")
			.attr("stroke-width", 2)
			.attr("fill", "none")
			.attr("stroke-linejoin","round")
			.style("stroke-dasharray", ("10, 12"));

		this.draw_tree(this.svg, this.base_x, this.base_y, 0.8);
		this.init_car(aa);


	}
}


</script>


<script type="text/javascript">


	function gaussian(x, mu, sigma){
		return 1/(2*Math.PI*sigma*sigma)*Math.exp(-(x-mu)*(x-mu)/(sigma*sigma));
	}

	function race_track_radius(rad){

		function derivation(x){
			return 30.0*Math.cos(8*x) + 300*gaussian(x,Math.PI-0.4,0.5) + 330*gaussian(x,Math.PI+0.3,0.4);
		}

		return r = this.base_radius + derivation(rad);


	}


	var w = 800;
	var h = 500;
	var base_radius = 150;
	var base_x = w - base_radius - 80;
	var base_y = 250;

	race_track = new RadialRaceTrack(w, h, base_x, base_y, base_radius, race_track_radius);

	pf = new ParticleFilter();

	var aa = 0;

	var dur = 50;



</script>



<script type="text/javascript">

function plot_rad_to_s(div){
	
	var trace1 = {
	  x: race_track.map_rad, 
	  y: race_track.map_pos, 
	  type: 'scatter'
	};

	var trace2 = {
	  x: race_track.map_pos, 
	  y: race_track.map_rad, 
	  type: 'scatter'
	};


	var data = [trace1];

	var layout1 = {
	  yaxis: {rangemode: 'tozero',
	          showline: true,
	          zeroline: true}
	};


	Plotly.newPlot('div1', [trace1], layout1);

	// plot points on track
// Grab a random sample of letters from the alphabet, in alphabetical order.






}


function sampler(){

	pf.init_samples();
	race_track.draw_points(pf.points);
}

function ani(){
	console.log("foo")
	var inter = setInterval(function() {
                aa=aa+10.0;
                console.log("foo")
                race_track.update_car(aa);
        }, dur);
}
	

</script>



<div id="rad_to_s" style="width:100px"></div>
## Rad to x,y
<div id="div1"></div>
<div id="div2"></div>



<svg id="race_track" style="background-color:#f7f3ef;width:100%" onload="race_track.draw_race_track(this);plot_rad_to_s(this)" onclick="sampler();ani()"></svg>






In this first post I want to take a closer look at the Bernoulli distribution.

<h1> Definition </h1>

The Bernoulli distribution is most of the time defined as

$$ \mathrm{Bernoulli}(x|\mu) = \mu^x(1-\mu)^{1-x}, $$

where \\(x \in \\{0,1\\}\\) and \\(\mu \in \[0,1]\\\).

At a first glance this looks very random and in some sense it also is. 



<a href='https://www.freepik.com/free-vector/flat-car-collection-with-side-view_1505022.htm'>Designed by Freepik</a>
