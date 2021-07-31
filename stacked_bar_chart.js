var margin = {top: 60, right: 100, bottom: 20, left: 250},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Create the timeFormat and timeParse values
var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");

// Create the svg canvas in the "stackedbarchart" div
var svg4 = d3.select("#stackedbarchart")
        .append("svg")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height + margin.top + margin.bottom + "px")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

// Import the CSV data
d3.csv("stacked_bar_chart_data.csv", function(error, datafile) {
if (error) throw error;
    
      datafile.forEach(function(d) {
      d.location = d.location;
      d.age = d.age;
      d.cause = d.cause;
      d.year = parseYear(d.year);
      d.val = +d.val;
  });
    
// Get the location values from the data   
  var locationData = d3.nest()
	  .key(function(d){
	    return d.location;
	  }).sortKeys(d3.ascending)
	  .entries(datafile);
    
// Add all the location values to the filter
    d3.select("#filter2")
      .selectAll('myOptions1')
     	.data(locationData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
// Get the year values from the data   
      var yearData = d3.nest()
	  .key(function(d){
	    return formatYear(d.year);
	  }).sortKeys(d3.ascending)
	  .entries(datafile);
    
// Add all the year values to the filter
    d3.select("#filter3")
      .selectAll('myOptions2')
     	.data(yearData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
    
//Filter the data according to location and year
    var data = datafile.filter(function(d) { 
    var loc = d3.select("#filter2").property("value");
    var y = d3.select("#filter3").property("value");
    return d.location === loc && formatYear(d.year) === y;
  });
    
    
// Set up the domain and range for colours
var colors3 = d3.scaleOrdinal()
  .domain(d3.map(data, function(d) { return d.cause; }).keys())
  .range(["#5965A3","#EF5285","#88F284","#ffcc00"]);
    
//Nest the data according to age groups
  var groupData = d3.nest()
    .key(function(d) { return d.age; })
  	.rollup(function(d, i){
      
      var d2 = {age: d[0].age}
      d.forEach(function(d){
        d2[d.cause] = d.val
      })
    	return d2;
    })
    .entries(data)
  	.map(function(d){ return d.value; });
    
var keys = colors3.domain();
    
var stackData = d3.stack().keys(keys)(groupData);
  
// Set up the domain and range for X axis   
var x3 = d3.scaleBand()
.domain(d3.map(data, function(d) { return d.age; }).keys())
.range([0, width])
.padding([0.2]);

// Set up the X axis 
 var xaxis3 =   svg4.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x3).ticks(5));

// Set up the domain and range for Y axis 
var y3 = d3.scaleLinear()
.range([height, 0])
.domain([0, d3.max([d3.max(stackData[2], function(d){return d[1];}),d3.max(stackData[3], function(d){return d[1];})])]); 
 
// Set up the Y axis     
    var yaxis3 = svg4.append("g")
       .call(d3.axisLeft(y3));
    
// Add the stacked bar chart
    var series = svg4.append("g").selectAll(".series")
    .data(stackData)
    .enter().append("g")
      .attr("class", "series")
      .attr("fill", function(d) { return colors3(d.key); });
  
  series.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
  		.attr("class", "series-rect")
      .attr("x", function(d) { return x3(d.data.age); })
      .attr("y", function(d) { return y3(d[1]); })
      .attr("height", function(d) { return y3(d[0]) - y3(d[1]); })
      .attr("width", x3.bandwidth())
    .append("title")
    .text(function(d){
			return "Total deaths: " + d3.format(".0f")(d[1] - d[0]);
		});   
    
    
// If the country filter value is changed, call function applyFilter2()          
    d3.select("#filter2").on("change", function() {
      applyFilter1(this.value);
    });
    
// If the year filter value is changed, call function applyFilter3()   
    d3.select("#filter3").on("change", function() {
      applyFilter2(this.value);
    });
    
    function applyFilter1(value) {
    
//Filter the data
    var data = datafile.filter(function(d) { 
    var y = d3.select("#filter3").property("value");
    return d.location === value && formatYear(d.year) === y;
  });
        
//Nest the data according to age
     var groupData = d3.nest()
    .key(function(d) { return d.age; })
  	.rollup(function(d, i){
      
      var d2 = {age: d[0].age}
      d.forEach(function(d){
        d2[d.cause] = d.val
      })
    	return d2;
    })
    .entries(data)
  	.map(function(d){ return d.value; });
    
  var stackData = d3.stack().keys(keys)(groupData);
      
// Set up the domain for Y axis again and transition according to new data 
 y3.domain([0, d3.max([d3.max(stackData[2], function(d){return d[1];}),d3.max(stackData[3], function(d){return d[1];})])]); 
       
 yaxis3.transition().duration(1000).call(d3.axisLeft(y3));
        
// Change the stacked bar chart and dot chart according to new data
    d3.selectAll(".series")
    .data(stackData)
     .transition()
      .duration(1000)
      .attr("fill", function(d) { return colors3(d.key); });
  
  series.selectAll("rect")
    .data(function(d) { return d; })
  		.attr("class", "series-rect")
      .attr("x", function(d) { return x3(d.data.age); })
      .attr("y", function(d) { return y3(d[1]); })
      .attr("height", function(d) { return y3(d[0]) - y3(d[1]); })
      .attr("width", x.bandwidth())
    .select("title")
    .text(function(d){
			return "Total deaths: " + d3.format(".0f")(d[1] - d[0]);
		});
        
  }
    
    function applyFilter2(value) {

//Filter the data
    var data = datafile.filter(function(d) { 
    var loc = d3.select("#filter2").property("value");
    return d.location === loc && formatYear(d.year) === value;
  });
        
//Nest the data according to age
     var groupData = d3.nest()
    .key(function(d) { return d.age; })
  	.rollup(function(d, i){
      
      var d2 = {age: d[0].age}
      d.forEach(function(d){
        d2[d.cause] = d.val
      })
    	return d2;
    })
    .entries(data)
  	.map(function(d){ return d.value; });
    
 var stackData = d3.stack().keys(keys)(groupData);
        
// Set up the domain for Y axis again and transition according to new data 
 y3.domain([0, d3.max([d3.max(stackData[2], function(d){return d[1];}),d3.max(stackData[3], function(d){return d[1];})])]);   
       
 yaxis3.transition().duration(1000).call(d3.axisLeft(y3));
        
        
// Change the stacked bar chart and dot chart according to new data
    d3.selectAll(".series")
    .data(stackData)
     .transition()
      .duration(1000)
      .attr("fill", function(d) { return colors3(d.key); });
  
  series.selectAll("rect")
    .data(function(d) { return d; })
  		.attr("class", "series-rect")
      .attr("x", function(d) { return x3(d.data.age); })
      .attr("y", function(d) { return y3(d[1]); })
      .attr("height", function(d) { return y3(d[0]) - y3(d[1]); })
      .attr("width", x3.bandwidth())
    .select("title")
    .text(function(d){
			return "Total deaths: " + d3.format(".0f")(d[1] - d[0]);
		});

  }
})
