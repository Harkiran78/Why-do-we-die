var margin = {top: 60, right: 100, bottom: 20, left: 250},
  width1 = 800 - margin.left - margin.right,
  height1 = 500 - margin.top - margin.bottom;

var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");

// Create the svg canvas in the "circularpackingchart" div
var svg5 = d3.select("#circularpackingchart")
        .append("svg")
        .attr("width", width1 + margin.left + margin.right)
        .attr("height", height1 + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

// Import the CSV data
d3.csv("GBDdataset.csv", function(error, datafile) {
if (error) throw error;
    
      datafile.forEach(function(d) {
      d.location = d.location;
      d.sex= d.sex;
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
    d3.select("#filter4")
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
    d3.select("#filter5")
      .selectAll('myOptions2')
     	.data(yearData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
// Get the sex values from the data   
      var sexData = d3.nest()
	  .key(function(d){
	    return d.sex;
	  }).sortKeys(d3.ascending)
	  .entries(datafile);
    
// Add all the sex values to the filter
    d3.select("#filter6")
      .selectAll('myOptions3')
     	.data(sexData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
// Get the age values from the data   
      var ageData = d3.nest()
	  .key(function(d){
	    return d.age;
	  }).sortKeys(d3.ascending)
	  .entries(datafile);
    
// Add all the age values to the filter
    d3.select("#filter7")
      .selectAll('myOptions4')
     	.data(ageData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
//Filter the data according to location, year, sex, age
    var data = datafile.filter(function(d) { 
    var l = d3.select("#filter4").property("value");
    var y = d3.select("#filter5").property("value");
    var s = d3.select("#filter6").property("value");
    var a = d3.select("#filter7").property("value");
    return d.location === l && formatYear(d.year) === y && d.sex === s && d.age ===a;
  });
    
// Set up the domain and range for colours
var colors4 = d3.scaleOrdinal()
.domain(data.map(function(d) { return d.cause; }).sort())
.range(["#EF5285","#88F284","#EF5285","#EF5285","#88F284","#88F284","#ffcc00","#EF5285","#EF5285","#88F284","#EF5285","#EF5285","#ffcc00","#88F284","#EF5285","#88F284","#5965A3","#EF5285","#EF5285","#5965A3","#5965A3"]);
    
//Set up the domain and range for size of the nodes
  var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.val; })])
    .range([5,100])    
  
// Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("forceX", d3.forceX().strength(.1).x(width1 * .5))
    .force("forceY", d3.forceY().strength(.1).y(height1 * .5))
    .force("center", d3.forceCenter().x(width1 * .5).y(height1 * .5))
    .force("charge", d3.forceManyBody().strength(-15));
    
// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions, simulations will stop.
    simulation
     .nodes(data)
     .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return size(d.val) + 2.5; }).iterations(1))
     .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        });
    
// Initialize the circles located at the center of the svg area
    var node = svg5.append("g")
        .attr("class", "node")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", function(d) { return size(d.val); })
        .attr("fill", function(d) { return colors4(d.cause); })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
// Add tooltips to circles
    node.append("title")
        .text(function(d){
			return "Cause: " + d.cause + "\n" + "Total deaths: " + d3.format(".1f")(d.val);
		});
    
// Functions to define what happens when a circle is dragged
     function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }
    
// If the location filter value is changed, call function applyFilter1()
      d3.select("#filter4").on("change", function() {
      applyFilter1(this.value);
    });
    
// If the year filter value is changed, call function applyFilter2()
      d3.select("#filter5").on("change", function() {
      applyFilter2(this.value);
    });
    
// If the sex filter value is changed, call function applyFilter3()
      d3.select("#filter6").on("change", function() {
      applyFilter3(this.value);
    });
    
// If the age filter value is changed, call function applyFilter4()
      d3.select("#filter7").on("change", function() {
      applyFilter4(this.value);
    });
    
    function applyFilter1(value) {
    
// filter the data
    var data = datafile.filter(function(d) { 
        
    var y = d3.select("#filter5").property("value");
    var s = d3.select("#filter6").property("value");
    var a = d3.select("#filter7").property("value");
    return d.location === value && formatYear(d.year) === y && d.sex === s && d.age === a;
  });
           
        
// Change the simulation and nodes according to new data
    var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.val; })])
    .range([5,100])    
    
          simulation
          .nodes(data)
          .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return size(d.val) + 2.5; }).iterations(1));
    
        var node = svg5.select("g").selectAll("circle")
                        .data(data);   
        
        
        node.exit().remove().transition()
        .duration(1000);//remove unneeded circles
        node.enter().append("circle").attr("r",0);  
        
        
        node
          .attr("r", function(d) { return size(d.val); })
          .attr("fill", function(d) { return colors4(d.cause); })
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; });
        
        node.select("title")
          .text(function(d){
			return "Cause: " + d.cause + "\n" + "Total deaths: " + d3.format(".1f")(d.val);
		});
        
    }
    
    function applyFilter2(value) {
            
// filter the data
    var data = datafile.filter(function(d) { 
        
    var l = d3.select("#filter4").property("value");
    var s = d3.select("#filter6").property("value");
    var a = d3.select("#filter7").property("value");
    return d.location === l && formatYear(d.year) === value && d.sex === s && d.age === a;
  });
        
// Change the simulation and nodes according to new data        
    var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.val; })])
    .range([5,100])    
    
          simulation
          .nodes(data)
          .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return size(d.val) + 2.5; }).iterations(1));
    
        var node = svg5.select("g").selectAll("circle")
                        .data(data);   
        
        
        node.exit().remove().transition()
        .duration(1000);//remove unneeded circles
        node.enter().append("circle").attr("r",0);  
        
        
        node
          .attr("r", function(d) { return size(d.val); })
          .attr("fill", function(d) { return colors4(d.cause); })
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; });      
        
        node.select("title")
          .text(function(d){
			return "Cause: " + d.cause + "\n" + "Total deaths: " + d3.format(".1f")(d.val);
		});
        
    }
    
    function applyFilter3(value) {
        
// filter the data
    var data = datafile.filter(function(d) { 
        
    var l = d3.select("#filter4").property("value");
    var y = d3.select("#filter5").property("value");
    var a = d3.select("#filter7").property("value");
    return d.location === l && formatYear(d.year) === y && d.sex === value && d.age === a;
  });
       
// Change the simulation and nodes according to new data
     var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.val; })])
    .range([5,100])    
    
          simulation
          .nodes(data)
          .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return size(d.val) + 2.5; }).iterations(1));
    
        var node = svg5.select("g").selectAll("circle")
                        .data(data);   
        
        
        node.exit().remove().transition()
        .duration(1000);//remove unneeded circles
        node.enter().append("circle").attr("r",0);  
        
        
        node
          .attr("r", function(d) { return size(d.val); })
          .attr("fill", function(d) { return colors4(d.cause); })
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; });   
        
        node.select("title")
          .text(function(d){
			return "Cause: " + d.cause + "\n" + "Total deaths: " + d3.format(".1f")(d.val);
		});
        
    }
    
    function applyFilter4(value) {
        
// filter the data
    var data = datafile.filter(function(d) { 
        
    var l = d3.select("#filter4").property("value");
    var y = d3.select("#filter5").property("value");
    var s = d3.select("#filter6").property("value");
    return d.location === l && formatYear(d.year) === y && d.sex === s && d.age === value;
  });
        
// Change the simulation and nodes according to new data
    var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.val; })])
    .range([5,100])    
    
          simulation
          .nodes(data)
          .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return size(d.val) + 2.5; }).iterations(1));
    
        var node = svg5.select("g").selectAll("circle")
                        .data(data);   
        

        node.exit().remove().transition()
        .duration(1000);//remove unneeded circles
        
        node.enter().append("circle").attr("r",0);  
        
        
        node
          .attr("r", function(d) { return size(d.val); })
          .attr("fill", function(d) { return colors4(d.cause); })
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; }); 
        
        node.select("title")
          .text(function(d){
			return "Cause: " + d.cause + "\n" + "Total deaths: " + d3.format(".1f")(d.val);
		});
        
        
    }

    });
