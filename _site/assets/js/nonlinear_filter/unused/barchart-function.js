

var dp = d3.select("#discretize");

var margin = {top: 20, right: 30, bottom: 30, left: 30},
width = dp.node().getBoundingClientRect().width - margin.right- margin.left,
height = dp.node().getBoundingClientRect().width/2 - margin.bottom - margin.top;


var svg = dp.append("svg")
  .attr("viewBox","0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





  var markersize=10;
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
    .attr('id', 'end-arrow-axis')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');





	var mix = [0.4, 0.6];
	var gs = [[30,15], [60,15]];
	var dom = [0.0, 100];
	var n_plot = 1000;
	var b_plot = 20;
	var v;
	var sum_data = [...Array(n_plot)].map((e,i)=>{return {x:dom[1]*i/n_plot,y:0}});
	var bin_data = [...Array(n_plot)].map((e,i)=>{return {x:dom[1]*i/b_plot,y:0}});

	for (var j = 0; j < mix.length; j++) {
			for (var i = 0; i < n_plot; i++) {	
				v = mix[j]*gaussian(sum_data[i].x,gs[j][0],gs[j][1]);
				sum_data[i].y+=v;
			}
			for (var i = 0; i < b_plot; i++) {	
				v = mix[j]*gaussian(dom[1]*(i+0.5)/b_plot,gs[j][0],gs[j][1]);
				bin_data[i].y+=v;
			}
	}


var x = d3.scaleLinear()
    .domain([0, 100.0])
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, margin.top])
    .domain([0, d3.max(sum_data, function(d) { return d.y })]).nice();



      var bin_width = x(dom[1]/b_plot) - x(0);
      var bin_prc = 0.9;

  svg.append("g")
      .attr("fill", "#bbb")
    .selectAll("rect")
    .data(bin_data)
    .enter().append("rect")
      .attr("x", function(d,i) { return x(d.x) + (1-bin_prc)*bin_width/2; })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return bin_width*bin_prc })
      .attr("height", function(d) { return -y(d.y)+y(0); });

  svg.append("path")
      .datum(sum_data)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); }));

// x-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0-0.03*width;
  })
  .attr("y1", function(d) {
    return height;
  })
  .attr("x2", function(d) {
    return width;
  })
  .attr("y2", function(d) {
    return height;
  });

// y-axis
svg.append("g")
  .append("line")
  .style("stroke","#000000")
  .style('marker-end','url(#end-arrow-axis)')
  .attr("x1", function(d) {
    return 0;
  })
  .attr("y1", function(d) {
    return height+0.03*width;
  })
  .attr("x2", function(d) {
    return 0;
  })
  .attr("y2", function(d) {
    return 0;
  });
