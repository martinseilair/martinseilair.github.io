/*
This script is based on the directed-graph-creator by Colorado Reed:
https://bl.ocks.org/cjrd/6863459
*/

function create_graph(svg, nodes, edges, radius,markersize){
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', "0")
    .attr('refY', "0")
    .attr('markerWidth', markersize)
    .attr('markerHeight', markersize)
    .attr('orient', 'auto')
    .attr('markerUnits','userSpaceOnUse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');

  // create svg layers
  var gm = svg.append("g").classed("graphicalmodel", true);
  paths = gm.append("g").selectAll("g");
  circles = gm.append("g").selectAll("g");  
  // draw edges
  paths = paths.data(edges);
  paths.enter()
    .append("path")
    .style("stroke", "#333")
    .style("stroke-width", "2px")
    .style("stroke-dasharray", function(d){return d.dash})
    .style('marker-end','url(#end-arrow)')
    .attr("d", function(d){
      var pc = 1 - (radius+markersize)/Math.sqrt(Math.pow(d.target.x-d.source.x,2)+Math.pow(d.target.y-d.source.y,2));
      return "M" + d.source.x + "," + d.source.y + "L" + (d.source.x + pc*(d.target.x -d.source.x))  + "," + (d.source.y + pc*(d.target.y -d.source.y));
    });

  // draw nodes
  circles = circles.data(nodes);
  var n_circ= circles.enter()
        .append("g")
        .style("fill",function(d){return d.fill})
        .style("stroke","#333")
        .style("stroke-width","2px")
        .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})

  n_circ.append("circle")
    .attr("r", String(radius));
  n_circ.each(function(d){
    var el = d3.select(this).append("text")
        .attr("text-anchor","middle")
        .attr('font-size',15.0)
        .text(d.title);

  });
};