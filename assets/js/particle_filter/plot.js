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