var margin = {top: 60, right: 100, bottom: 20, left: 250},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


// Create the svg canvas in the "barchart" div
var svg1 = d3.select("#barchart")
        .append("svg")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height + margin.top + margin.bottom + "px")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");
    
// Create the legend
svg1.append("circle").attr("cx",420).attr("cy",300).attr("r", 6).style("fill", "#EF5285")
svg1.append("circle").attr("cx",420).attr("cy",330).attr("r", 6).style("fill", "#88F284")
svg1.append("circle").attr("cx",420).attr("cy",360).attr("r", 6).style("fill", "#5965A3")
svg1.append("circle").attr("cx",420).attr("cy",390).attr("r", 6).style("fill", "#ffcc00")
svg1.append("text").attr("x", 440).attr("y", 300).text("Non-Communicable Diseases").style("font-size", "15px").attr("alignment-baseline","middle")
svg1.append("text").attr("x", 440).attr("y", 330).text("Communicable Diseases").style("font-size", "15px").attr("alignment-baseline","middle")
svg1.append("text").attr("x", 440).attr("y", 360).text("Injuries & Violence").style("font-size", "15px").attr("alignment-baseline","middle")
svg1.append("text").attr("x", 440).attr("y", 390).text("Maternal & Nutritional disorders").style("font-size", "15px").attr("alignment-baseline","middle")

// Import the CSV data
d3.csv("gbdDataset.csv", function(error, datafile) {
if (error) throw error;
    
      datafile.forEach(function(d) {
      d.location = d.location;
      d.sex = d.sex;
      d.age = d.age;
      d.cause = d.cause;
      d.year = d.year;
      d.val = +d.val;
      d.upper = +d.upper;
      d.lower = +d.lower;
  });
    
//Filter the data according to year
    var bardata = datafile.filter(function(d) { 
    var y1 = d3.select("#year_filter").property("value");
    return d.year === y1;
  });
    

//Nest and rollup the data according to causes of death
  var nest1 = d3.nest()
	  .key(function(d){
	    return d.cause;
	  })
	  .rollup(function(v){
	 		return d3.sum(v, function(d) {return (d.val)});
		})
	  .entries(bardata)
      .sort(function(u, v){ return d3.ascending(u.value, v.value); });

    console.log(nest1)

// Set up the domain and range for X axis  
var x1 = d3.scaleLinear()
.domain([0, d3.max(nest1, function(d) { return d.value; })])
.range([0, width]);
    

// Set up the domain and range for Y axis  
var y1 = d3.scaleBand()
.domain(nest1.map(function(d) { return d.key; }))
.range([height, 0])
.padding(.1);
    
// Set up the x axis
var xaxis1 = svg1.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
    .call(d3.axisBottom(x1)
    .ticks(8));

// Add the Y Axis
var yaxis1 = svg1.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y1)
    .ticks(21));

// Set up the domain and range for colours
var colors1 = d3.scaleOrdinal()
  .domain(nest1.map(function(d) { return d.key; }))
.range(["#EF5285","#EF5285","#EF5285","#EF5285","#ffcc00","#88F284","#88F284","#EF5285","#5965A3","#5965A3","#EF5285","#EF5285","#EF5285","#88F284","#5965A3","#88F284","#ffcc00","#88F284","#88F284","#EF5285","#EF5285"]);
    
// Add the bar chart    
  svg1.append("g").selectAll(".myRect")
    .data(nest1)
    .enter()
    .append("rect")
    .attr("class", "myRect")
    .attr("x", x1(0) )
    .attr("y", function(d) { return y1(d.key);})
    .attr("width", function(d) { return x1(d.value); })
    .attr("height", y1.bandwidth())
    .attr('fill', function(d) {
            return colors1(d.key);
        })
    .append("title")
    .text(function(d){
			return "Global deaths: " + d3.format(".2s")(d.value);
		});
            
    
// If the slider value is changed, call function applyFilter()
    d3.select("#year_filter").on("change", function() {
      applyFilter(this.value);
    });
    
    
function applyFilter(value) {
    
// filter the data according to new year value
  var bardata = datafile.filter(function(d) {return d.year === value;})

//Nest and rollup the data according to causes of death
  var nest1 = d3.nest()
	  .key(function(d){
	    return d.cause;
	  })
	  .rollup(function(v){
	 		return d3.sum(v, function(d) {return (d.val)});
		})
	  .entries(bardata)
      .sort(function(u, v){ return d3.ascending(u.value, v.value); });

 
// Set up the domain for X axis again and transition according to new data
x1.domain([0, d3.max(nest1, function(d) { return d.value; })]);
        
xaxis1.transition().duration(1000).call(d3.axisBottom(x1).ticks(8));
     
// Set up the domain for Y axis again and transition according to new data 
y1.domain(nest1.map(function(d) { return d.key; }));
        
yaxis1.transition().duration(1000).call(d3.axisLeft(y1).ticks(21));
    
// Change the bar chart according to new data
  d3.selectAll(".myRect")
    .data(nest1)
    .transition()
    .duration(1000)
    .attr("x", x1(0) )
    .attr("y", function(d) { return y1(d.key);})
    .attr("width", function(d) { return x1(d.value); })
    .attr("height", y1.bandwidth())
    .attr('fill', function(d) {
            return colors1(d.key);
        })
    .select("title")
    .text(function(d){
			return "Global deaths: " + d3.format(".2s")(d.value);
		});   

  }
})