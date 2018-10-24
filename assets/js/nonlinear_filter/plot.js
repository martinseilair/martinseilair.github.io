function plot_pdf(div, pdf) {
    var d = 500;

    var data = [
        {
            z: pdf,
            type: "heatmapgl",
            colorscale: "Jet"
        }
    ];
    Plotly.plot(div, data);
}


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

function plot_curvature(div){
    
    var trace1 = {
      x: race_track.map_rad, 
      y: race_track.map_pos, 
      type: 'scatter'
    };


    var curvature = [];
    var rads = [];
    var rad = 0.0;
    var n = 1000000;
    for (var i=0;i<n;i++){
        rad = i/n * 2.0*Math.PI;
        rads.push(rad);
        curvature.push(race_track.get_curvature(rad));
    }

    var trace1 = {
      x: rads, 
      y: curvature, 
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



// Compute quads of adjacent points [p0, p1, p2, p3].
function quads(points) {
  return d3.range(points.length - 1).map(function(i) {
    var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
    return a;
  });
}

// Compute stroke outline for segment p12.
function lineJoin(p0, p1, p2, p3, width) {
  var u12 = perp(p1, p2),
      r = width / 2,
      a = {x: p1.x + u12.x * r, y: p1.y + u12.y * r},
      b = {x: p2.x + u12.x * r, y: p2.y + u12.y * r},
      c = {x: p2.x - u12.x * r, y: p2.y - u12.y * r},
      d = {x: p1.x - u12.x * r, y: p1.y - u12.y * r};

  if (p0) { // clip ad and dc using average of u01 and u12
    var u01 = perp(p0, p1), e = {x: p1.x + u01.x + u12.x, y: p1.y + u01.y + u12.y};
    a = lineIntersect(p1, e, a, b);
    d = lineIntersect(p1, e, d, c);
  }

  if (p3) { // clip ab and dc using average of u12 and u23
    var u23 = perp(p2, p3), e = {x: p2.x + u23.x + u12.x, y: p2.y + u23.y + u12.y};
    b = lineIntersect(p2, e, a, b);
    c = lineIntersect(p2, e, d, c);
  }

  return "M" + a.x + " " + a.y + "L" + b.x + " " + b.y + " " + c.x + " " + c.y + " " + d.x + " " + d.y + "Z";

    //return "M" + a.x + " " + a.y + "L" + b + " " + c + " " + d + "Z";
}

// Compute intersection of two infinite lines ab and cd.
function lineIntersect(a, b, c, d) {
  var x1 = c.x, x3 = a.x, x21 = d.x - x1, x43 = b.x - x3,
      y1 = c.y, y3 = a.y, y21 = d.y - y1, y43 = b.y - y3,
      ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
  return {x: x1 + ua * x21, y: y1 + ua * y21};
}

// Compute unit vector perpendicular to p01.
function perp(p0, p1) {
  var u01x = p0.y - p1.y, u01y = p1.x - p0.x,
      u01d = Math.sqrt(u01x * u01x + u01y * u01y);
  return {x: u01x / u01d, y: u01y / u01d};
}









function create_dirac_plot(div_id,samples, dist, dom, dh, arrow, ratio){



var dp = d3.select(div_id);
var style = window.getComputedStyle(dp.node());

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = parseInt(style.width) - margin.left - margin.right,
    height = parseInt(style.width)*ratio - margin.top - margin.bottom;




var xScale = d3.scaleLinear()
         .range([0, width])
         .domain([0, 1.05*d3.max(samples, function(d) { return (d.x !== undefined)?d.x:d; })]).nice();

         
var yScale = d3.scaleLinear()
   .range([height, 0])
   .domain([0, d3.max(samples, function(d) { return (d.w !== undefined)?d.w:1.0; })]).nice();

var xAxis = d3.axisBottom(xScale).ticks(12),
   yAxis = d3.axisLeft(yScale).ticks(12 * height / width);

let line = d3.line()
  .x(function(d) {
    return xScale(d.x);
  })
  .y(function(d) {
    return yScale(d.y);
  });

var svg = dp.append("svg")
  .attr("viewBox","0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var markersize=5;
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

    markersize=10;
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



// Add dirac
svg.append("g").selectAll("line")
  .data(samples).enter()
  .append("line")
  .style("stroke","#000000")
  .style('marker-end',function() {return (arrow)?'url(#end-arrow)':''})
  .style('opacity',0.5)
  .attr("x1", function(d) {
    return xScale((d.x !== undefined)?d.x:d);
  })
  .attr("y1", function(d) {
    return yScale((d.w !== undefined)?d.w:dh);
  })
  .attr("x2", function(d) {
    return xScale((d.x !== undefined)?d.x:d);
  })
  .attr("y2", function(d) {
    return yScale(0);
  });


var ygScale = d3.scaleLinear()
   .range([height, 0])
   .domain([0, d3.max(dist, function(d) { return d3.max(d.gdata, function(e) { return e.y; }); })]).nice();

var xgScale = d3.scaleLinear()
         .range([0, width])
         .domain([dom[0], 1.05*dom[1]]).nice();


  var gline = d3.line()
      .x(function(d) {return xgScale(d.x); })
        .y(function(d) { return ygScale(d.y); });

for (var i=0;i<dist.length;i++){

  svg.append("svg:path")
    .attr("d", gline(dist[i].gdata))
    .style("stroke",dist[i].color)
    .style("fill","none");

}




}

