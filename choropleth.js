var width2 = 960;
var height2 = 600;
    
// The svg
var svg2 = d3.select("#choropleth")
.append("svg")
.attr("width", width2)
.attr("height", height2);
    

// Map and projection
var projection = d3.geoMercator()
    .scale(width2 / 7)
.center([0,40])
    .translate([width2 / 2, height2 / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var choroplethdata = d3.map();
var colorScheme = d3.schemeBlues[4];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([0.2,0.4,0.6,0.8])
    .range(colorScheme);

// Legend
var g = svg2.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Human Development Index");
var labels = ['0', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
svg2.select(".legendThreshold")
    .call(legend);

// Load external data and boot
d3.queue()
    .defer(d3.json, "world.geojson")
    .defer(d3.csv, "Human_development_index.csv", function(d) { choroplethdata.set(d.code, +d.HDI_index); })
    .await(ready);  

function ready(error, topo) {
    if (error) throw error;

    // Draw the map
    svg2.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
            .attr("fill", function (d){
                // Pull data for this country
                d.HDI_index = choroplethdata.get(d.id) || 0;
                // Set the color
                return colorScale(d.HDI_index);
            })
            .attr("d", path)
            .append("title")
            .text(function(d){
			return (d.properties.name + "\n" + "HDI Value: " + d.HDI_index);
		});
}