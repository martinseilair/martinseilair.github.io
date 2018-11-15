function create_graph(svg, nodes, edges, radius, markersize, svg_w, svg_h){

    var defs = svg.append('svg:defs');
    svg.attr("viewBox","0 0 " + svg_w + " " + svg_h);


    colors = [];
    var color, colorname;
    edge_color = [];

    for (var i=0; i<edges.length;i++){

        if ("color" in edges[i]){
            color = edges[i].color;
        }else{
            color = "#333";
        }
        colorname = "end-arrow" + color.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'_');
        edge_color.push(colorname)

        if(!colors.includes(colorname)){
            defs.append('svg:marker')
              .attr('id', colorname)
              .attr('viewBox', '0 -5 10 10')
              .attr('refX', "0")
              .attr('refY', "0")
              .attr('markerWidth', markersize)
              .attr('markerHeight', markersize)
              .attr('orient', 'auto')
              .attr('fill', color)
              .attr('markerUnits','userSpaceOnUse')
              .append('svg:path')
              .attr('d', 'M0,-5L10,0L0,5');

            colors.push(colorname)
        }
    }

    // create svg layers
    var gm = svg.append("g").classed("graphicalmodel", true);
    paths = gm.append("g").selectAll("g");
    circles = gm.append("g").selectAll("g");  


    // draw edges
    paths = paths.data(edges);
    paths.enter()
        .append("path")
        .style("stroke-width", "2px")
        .style("stroke-dasharray", function(d){return d.dash})
        .style("stroke", function(d){return ("color" in d)?d.color:"#333";})
        .style('marker-end',function(d,i){return 'url(#' + edge_color[i] + ')';})
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