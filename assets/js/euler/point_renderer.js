

class PointRenderer{

	
	constructor(div, points, edges, width, height, radius){

		this.mouse_is_down = false;
		this.mouse_has_left = true;
		this.mouse_coords = math.matrix([0.0, 0.0]);

		this.drag_i = -1;


		this.edges = edges;
		this.points = points;

		this.width = width;
		this.height = height;
		this.radius = radius;

		this.init(div, points)

	}

	init(div, points){
		this.svg = d3.select("#"+div).append("svg")
			.attr("id", "simsvg")
			.attr("viewBox","0 0 " + this.width +  " " + this.height)
			.on("mousemove", this.mouse_move.bind(this))
			.on("mouseup", this.mouse_up.bind(this))
			.on("mouseleave", this.mouse_leave.bind(this))
			.on("mouseenter", this.mouse_enter.bind(this));


		this.svg.selectAll("path")
			.data(this.edges)
			.enter()
			.append("path")
			.attr("d", function(d){return "M " +  points[d[0]][0] + " , " +  points[d[0]][1] + "L " +  points[d[1]][0] + " , " +  points[d[1]][1]}) 
			.style("stroke","#000000")
			.style("fill","#FF0000")

		this.svg.selectAll("circle")
			.data(this.points)
			.enter()
			.append("circle")
			.attr("cx", function(d,i){return d[0]})
			.attr("cy", function(d,i){return d[1]})
			.attr("r", this.radius)
			.style("stroke","#000000")
			.style("fill","#FF0000")
			.on("mousedown", this.mouse_down.bind(this))
	}

	update(points){

		this.svg.selectAll("path")
			.data(this.edges)
			.attr("d", function(d){return "M " +  points[d[0]][0] + " , " +  points[d[0]][1] + "L " +  points[d[1]][0] + " , " +  points[d[1]][1]}) 
			
		this.svg.selectAll("circle")
			.data(points)
			.attr("cx", function(d,i){return d[0]})
			.attr("cy", function(d,i){return d[1]})
	}

	mouse_down(d, i){
		this.mouse_is_down = true;
		this.drag_i = i;
	}

	mouse_move(){
		this.mouse_coords = math.matrix(d3.mouse(this.svg.node()));
	}

	mouse_up(){
		this.mouse_is_down = false;
	}

	mouse_leave(){
		this.mouse_is_down = false;
		this.mouse_has_left = true;
	}

	mouse_enter(){
		this.mouse_has_left = false;
		this.mouse_coords_old = math.matrix(d3.mouse(this.svg.node()));
		this.mouse_coords_d = math.matrix([0.0, 0.0]);
	}




}

