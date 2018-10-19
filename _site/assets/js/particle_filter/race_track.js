

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

		this.trees = [];




		this.track_length = this.map_pos[this.map_pos.length - 1];
    }

    add_tree(p_x,p_y){
    	this.trees.push({x: p_x, y: p_y});
    }

    index_lin_interp(arr, value){

    	if(arr[0]>=value){
    		return [0, 0.0];
    	}
    	if(arr[arr.length - 1]<=value){
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

    draw_function(func){

		var n = 1000;

		var func_data = [];
		var r,x,y;
		var rad,c;
		var angle;
		var p;
		var h;

		for (var i=0; i<n; i++){
			rad = i/(n-1)*2.0*Math.PI;
			c = this.race_track_pos_abs(rad, 0.0)
			angle = this.get_angle(rad);
			h = func(this.get_pos(rad));
			p = {x: c.x + Math.sin(angle)*h, y: c.y  - Math.cos(angle)*h }



			func_data.push(p);
		}

		//This is the accessor function we talked about above
		var lineFunction = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.curve(d3.curveLinear);

		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(func_data)+"Z")
			.attr("stroke", "#000")
			.attr("stroke-width", 2)
			.attr("fill", "none")
		return func_data;

		
    }

    get_pos(rad){
    	rad = rad % Math.PI*2.0;
    	return this.lin_interp(this.map_pos, this.index_lin_interp(this.map_rad, rad));
    }

    get_rad(pos){
    	if(pos <0){
			pos +=this.track_length;
		}
    	pos = pos % this.track_length;

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

	get_curvature_pos(pos){
		return this.get_curvature(this.get_rad(pos));
	}

	get_curvature(rad){
		// approximate curvature

		var eps = 0.000001;

		
		var pm = this.race_track_pos_abs(rad - eps, 0.0);
		var phm = this.race_track_pos_abs(rad - 0.5*eps, 0.0);
		var pc = this.race_track_pos_abs(rad, 0.0);
		var php = this.race_track_pos_abs(rad + 0.5*eps, 0.0);
		var pp = this.race_track_pos_abs(rad + eps, 0.0);

		// first derivative
		var x_d = (php.x - phm.x)/eps;
		var y_d = (php.y - phm.y)/eps;

		// second derivative
		var x_dd = (pp.x - 2.0*pc.x + pm.x)/(eps*eps);
		var y_dd = (pp.y - 2.0*pc.y + pm.y)/(eps*eps);	


		return Math.abs(x_d*y_dd - y_d*x_dd)/Math.pow(x_d*x_d + y_d*y_d,3.0/2.0);
	}

	get_angle(rad){
		var eps = 0.0001;

		var c1 = this.race_track_pos_abs(rad, 0.0);
		var c2 = this.race_track_pos_abs(rad + eps, 0.0);

		return Math.atan2(c2.y-c1.y,c2.x-c1.x);

	}

	init_car(pos,base_url){
		this.g = this.svg.append("g")
		this.g.append("image")
			.attr("x",0)
			.attr("y",-5)
			.attr("width",100)
			.attr("xlink:href",base_url + "/assets/svg/car.svg")
		this.old_pos = pos;
	 	this.update_car(pos,0,0)
	}

	update_car(pos,dur,overflow){
		//pos = pos % this.track_length;
		//var rad = this.get_rad(pos);
		//var c = this.race_track_pos_abs(rad, 0.0)
		//var s = -0.6;
		//var angle = this.get_angle(rad)/Math.PI*180.0;

		//this.g.transition().attr("transform","translate(" + c.x + "," + c.y + ") scale(" + s + ") rotate(" + angle + ") translate(-50.0, -40.0)").duration(dur);
		var old_pos = this.old_pos;


		pos = pos + overflow*this.track_length;


		console.log(old_pos)
		console.log(pos% this.track_length)

		console.log(overflow)
		var foo = function() {
 			return function(t) {
 			if (overflow==-1.0)	{
 				console.log((old_pos + t*(pos-old_pos) ) % this.track_length)
 			}
 			var rad = this.get_rad((old_pos + t*(pos-old_pos) ) % this.track_length);
			var c = this.race_track_pos_abs(rad, 0.0)
			var s = -0.6;
			var angle = this.get_angle(rad)/Math.PI*180.0;
			return "translate(" + c.x + "," + c.y + ") scale(" + s + ") rotate(" + angle + ") translate(-50.0, -40.0)"; 
			}.bind(this);
		}

		this.g.transition().duration(3*dur)
 			.attrTween('transform', foo.bind(this))

 		this.old_pos = pos- overflow*this.track_length;
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

	race_track_pos_abs(rad, r_add){
		var r = this.race_track_radius(rad);
		//return [this.base_x + r*Math.cos(rad),this.base_y + r*Math.sin(rad)];
		return{ "x": this.base_x + (r+r_add)*Math.cos(rad),   "y": this.base_y + (r+r_add)*Math.sin(rad)}
	}


	draw_point_rad(rad, color){
		var c = race_track_pos_abs(rad, 0.0);

		this.svg.append("circle")
			.attr("cx",c.x)
			.attr("cy",c.y)
			.attr("r",5.0)
			.style("fill",color);

	}

	draw_point_pos(pos,color){

		var rad = this.get_rad(pos);

		this.draw_point_rad(rad, color);
	}



	draw_points(points){

		// get biggest point

		var max = points[0].w;
	    for (var i = 0; i < points.length; i++) {
	    	max = Math.max(points[i].w,max);
	    }

		var data = [];
		var c;
		for (var i=0; i<points.length;i++){
			c = this.race_track_pos_abs(this.get_rad(points[i].x), 0.0);
			data.push({ "cx": c.x, "cy": c.y, "r": 6.0*points[i].w/max})
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

		this.race_track_data = [];
		var r,x,y;
		var rad,c;

		for (var i=0; i<n; i++){
			rad = i/(n-1)*2.0*Math.PI;
			c = this.race_track_pos_abs(rad, 0.0)
			this.race_track_data.push(c);
		}

		//this.race_track_data.push(this.race_track_data[0])

		//This is the accessor function we talked about above
		var lineFunction = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.curve(d3.curveLinear);






		//var lineGraph = this.svg.append("path")
		//	.attr("d", lineFunction(this.race_track_data)+"Z")
		//	.attr("stroke", "#000")
		//	.attr("stroke-width", 70)
		//	.attr("fill", "none")
		//	.attr("id", "probability_strip")
		//	.attr("stroke-linejoin","round");



		var defs = this.svg.append("defs");

		var probstrip_clip = defs
			.append("mask")
			.attr("id", "inner_track");  

		probstrip_clip.append("rect")
			.attr("width",this.w)
			.attr("height",this.h)
			.attr("x",0)
			.attr("y",0)
			.attr("fill","#FFF");
		probstrip_clip.append("path")
			.attr("d", lineFunction(this.race_track_data)+"Z")
			.attr("stroke-width", 50)
			.attr("stroke-linejoin","round")
			.attr("fill","#000");

		var obstrip_clip = defs
			.append("mask")
			.attr("id", "outer_track");  
		obstrip_clip.append("rect")
			.attr("width",this.w)
			.attr("height",this.h)
			.attr("x",0)
			.attr("y",0)
			.attr("fill","#000");
		obstrip_clip.append("path")
			.attr("d", lineFunction(this.race_track_data)+"Z")
			.attr("stroke-width", 50)
			.attr("stroke-linejoin","round")
			.attr("fill","#FFF");


		this.svg.append("g")
			.attr("mask", "url(#inner_track)")
			.attr("id", "prob_strip_group");

		this.svg.append("g")
			.attr("mask", "url(#outer_track)")
			.attr("id", "ob_strip_group");


		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(this.race_track_data)+"Z")
			.attr("stroke", "#FFF")
			.attr("stroke-width", 25)
			.attr("fill", "none")
			.attr("stroke-linejoin","round");

		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(this.race_track_data)+"Z")
			.attr("stroke", "#888")
			.attr("stroke-width", 20)
			.attr("fill", "none")
			.attr("stroke-linejoin","round");


		//The line SVG Path we draw
		var lineGraph = this.svg.append("path")
			.attr("d", lineFunction(this.race_track_data)+"Z")
			.attr("stroke", "#EEE")
			.attr("stroke-width", 2)
			.attr("fill", "none")
			.attr("stroke-linejoin","round")
			.style("stroke-dasharray", ("10, 12"));

		for (var i=0;i<this.trees.length;i++){
			this.draw_tree(this.svg, this.trees[i].x, this.trees[i].y, 0.8);
		}
		



	}
}