var margin = {top: 60, right: 100, bottom: 20, left: 250},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");


// Create the svg canvas in the "linechart" div
var svg3 = d3.select("#linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

// Import the CSV data
d3.csv("line_chart_data.csv", function(error, datafile) {
if (error) throw error;
    
      datafile.forEach(function(d) {
      d.location = d.location;
      d.cause = d.cause;
      d.year = parseYear(d.year);
      d.val = +d.val;
      d.upper = +d.upper;
      d.lower = +d.lower;
  });
    

// Get the location values from the data    
  var locationData = d3.nest()
	  .key(function(d){
	    return d.location;
	  }).sortKeys(d3.ascending)
	  .entries(datafile);
    
// Add all the location values to the filter
    d3.select("#filter1")
      .selectAll('myOptions')
     	.data(locationData)
      .enter()
    	.append('option')
      .text(function (d) { return d.key; }) 
      .attr("value", function (d) { return d.key; }) 
    
//Filter the data according to location
var linedata = datafile.filter(function(d) { 
    var loc = d3.select("#filter1").property("value");
    return d.location === loc;
  });
    
//Nest the data according to causes of death

  var nest2 = d3.nest()
	  .key(function(d){
	    return d.cause;
	  }).sortKeys(d3.ascending)
  .sortValues(function(u, v){ return d3.ascending(u.year, v.year); })
	  .entries(linedata);

    console.log(nest2)

// Set up the domain and range for X axis      
var x2 = d3.scaleTime()
.domain(d3.extent(linedata, function(d) { return d.year; }))
.range([0, width]);
    
// Set up the domain and range for Y axis      
var y2 = d3.scaleLinear()
.domain([0, d3.max(nest2, function(d){
        return d3.max(d.values, function(d){
            return d.val;
        })
})])
.range([height, 0]);
    
    
  // Set up the x axis
  var xaxis2 = svg3.append("g")
       .attr("transform", "translate(0," + height + ")")
       .attr("class", "x axis")
       .call(d3.axisBottom(x2).ticks(5));

  // Add the Y Axis
   var yaxis2 = svg3.append("g")
       .attr("class", "y axis")
       .call(d3.axisLeft(y2));

// Set up the domain and range for colours
var colors2 = d3.scaleOrdinal()
  .domain(nest2.map(function(d) { return d.key; }))
.range(["#EF5285","#88F284","#EF5285","#EF5285","#88F284","#88F284","#ffcc00","#EF5285","#EF5285","#88F284","#EF5285","#EF5285","#ffcc00","#88F284","#EF5285","#88F284","#5965A3","#EF5285","#EF5285","#5965A3","#5965A3"]);
    
// Add the line chart
  svg3.append("g").selectAll(".line")
      .data(nest2)
      .enter()
      .append("path")
      .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function(d){ return colors2(d.key) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x2(d.year); })
            .y(function(d) { return y2(+d.val); })
            (d.values)
        });
    
// Add the dot chart
  svg3.append('g')
      .selectAll(".dot")
      .data(linedata)
      .enter()
      .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return x2(d.year); } )
        .attr("cy", function (d) { return y2(+d.val); } )
        .attr("r", 12)
        .style("fill", function(d){ return colors2(d.cause) })
        .style("opacity", "0")
        .append("title")
        .text(function(d) {
            return d.cause + "\n" + "Year: " + formatYear(d.year) + "\n" + "Total deaths: " + d3.format(".0f")(d.val);
           });
    
// If the filter value is changed, call function applyFilter()
d3.select("#filter1").on("change", function() {
   applyFilter(this.value);
});
    
    
function applyFilter(value) {
    
// filter the data
var linedata = datafile.filter(function(d) {return d.location === value;})

//Nest the data according to causes of death
var nest2 = d3.nest()
	  .key(function(d){
	    return d.cause;
	  }).sortKeys(d3.ascending)
      .sortValues(function(u, v){ return d3.ascending(u.year, v.year); })
	  .entries(linedata);

        console.log(nest2)
    
// Set up the domain for Y axis again and transition according to new data 
y2.domain([0, d3.max(nest2, function(d){
        return d3.max(d.values, function(d){
            return d.val;
        })
})])
        
yaxis2.transition().duration(1000).call(d3.axisLeft(y2));
    
// Change the line chart and dot chart according to new data
  d3.selectAll(".line")
      .data(nest2)
      .transition()
      .duration(1000)
        .attr("stroke", function(d){ return colors2(d.key) })
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x2(d.year); })
            .y(function(d) { return y2(+d.val); })
            (d.values)
        });
        
   d3.selectAll(".dot")
      .data(linedata)
      .transition()
      .duration(1000)
        .attr("cx", function (d) { return x2(d.year); } )
        .attr("cy", function (d) { return y2(+d.val); } )
        .style("fill", function(d){ return colors2(d.cause) })
        .select("title")
        .text(function(d) {
            return d.cause + "\n" + "Year: " + formatYear(d.year) + "\n" + "Total deaths: " + d3.format(".0f")(d.val);
           });
        
// Display text if the filter country values are among these
    if (value === "Afghanistan")
    document.getElementById("countrydetail").innerHTML = "Majority of the deaths in Afghanistan occur dur to Cardiovascular diseases but deaths due to respiratory infections and maternal disorders are also dominant. Note the increase in deaths due to interpersonal violence. This is because of the <a href = 'https://www.cfr.org/timeline/us-war-afghanistan' target = '_blank'>war in Afghanistan</a> that includes many players such as the Taliban, Afghan government, USA military and government, etc.";
        
    else if (value === "Chad")
    document.getElementById("countrydetail").innerHTML = "Chad is a middle African country that has one of the lowest HDI values in the world. Majority of the deaths in this country occur due to enteric and respiratory infections along with maternal disorders. Chad is one of the poorest countries in the world without even basic healcare. It's hostile desert environment along with its <a href = 'https://www.borgenmagazine.com/causes-of-poverty-in-chad/' target = '_blank'>socio-political conflicts</a> is mainly responsible for these conditions.";
    
    else if (value === "Niger")
    document.getElementById("countrydetail").innerHTML = "Niger is a middle African country that has one of the lowest HDI values in the world. Majority of the deaths in this country occur due to enteric and respiratory infections along with maternal disorders. It's hostile desert environment and desert conditions along with its <a href = 'https://www.concernusa.org/story/niger-5-things-need-know/' target = '_blank'>socio-political conflicts</a> is mainly responsible for these conditions. ";
        
    else if (value === "Central African Republic")
    document.getElementById("countrydetail").innerHTML = "Central African Republic has most of the deaths because of respiratory infections and HIV/AIDS. This is an extremely poor middle African country which had a serious epidemic of HIV/AIDS over the years. However, with <a href = 'https://www.unaids.org/en/resources/presscentre/featurestories/2018/august/central-african-republic' target = '_blank'>national HIV prevention plan</a> and access of medicine, deaths due to HIV/AIDS have decreased and are now overshawed by cardiovascular diseases";
        
    else if (value === "Syrian Arab Republic")
    document.getElementById("countrydetail").innerHTML = "Syria has a large number of deaths due to cardiovascular diseases but the deaths because of interpersonal violence overshadow everything else. This is because of the <a href = 'https://www.bbc.co.uk/newsround/16979186' target = '_blank'>civil war in Syria</a> that has been going on since 2010 when the deaths due to interpersonal violence started rising. The war is mainly between the Syrian government, various groups known as known as rebels and the Islamic State of Iraq and Syria (ISIS)"; 
        
    else if (value === "United States of America")
    document.getElementById("countrydetail").innerHTML = "United States of America has one of the highest HDI values in the world. Since it has excellent healthcare and medical facilities, there are very few deaths due to communicable diseases as they are preventable. Instead, most of the deaths occur due to Cardiovascular diseases and Neoplasms, with a steady increase in deaths due to Neurological disorders along the years.";
        
    else if (value === "United Kingdom")
    document.getElementById("countrydetail").innerHTML = "United Kingdom has one of the highest HDI values in the world. Since it has excellent healthcare and medical facilities, there are very few deaths due to communicable diseases as they are preventable. Instead, most of the deaths occur due to Cardiovascular diseases and Neoplasms, with a steady increase in deaths due to Neurological disorders along the years.";
        
    else if (value === "Australia")
    document.getElementById("countrydetail").innerHTML = "Australia has one of the highest HDI values in the world. Since it has excellent healthcare and medical facilities, there are very few deaths due to communicable diseases as they are preventable. Instead, most of the deaths occur due to Cardiovascular diseases and Neoplasms, with a steady increase in deaths due to Neurological disorders along the years.";
    
    else
    document.getElementById("countrydetail").innerHTML = "";

  }
})