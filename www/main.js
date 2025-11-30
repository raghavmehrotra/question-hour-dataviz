// create empty chart SVGs - pyramid charts start with a centered group
// const dollarsG = makeChart("#pyramidDollars", 200)
//   .append("g")
//   .attr("transform", `translate(${chartWidth / 2}, ${margin.top})`);
// const percentG = makeChart("#pyramidPercent", 200)
//   .append("g")
//   .attr("transform", `translate(${chartWidth / 2}, ${margin.top})`);
// const lineDollars = makeChart("#lineChartDollars", 400);
// const linePercent = makeChart("#lineChartPercent", 400);

// Creates the empty SVG to be rendered upon page load
const topicsBarChart = makeChart("#topicsChartContainer", 500, 300);

// global state
let questionsData = []; 
// These are rough values for now, will update with precise values later.
// Will also consider a rotating set of themes for comparison + handle the edge
// case that the user selects one of the predefined themes
topicFrequencies = [
    {topic: "health", count: 2273},
    {topic: "legal", count: 1314},
    {topic: "border", count: 1085},
    {topic: "nuclear", count: 768},
    {topic: "climate", count: 401},
]
// let yearIndex = 0; // currently displayed year index
// let timerFunc = null; // handle to timer function if animating

// load CSV and parse data -- then draw charts for first time
d3.csv("mini.csv").then((data) => {
  questionsData = data;
  updateCharts();
});

// called every frame of animation -- draw all charts
// actual functions to draw charts are in other JS files (pyramid/linechart.js)
function updateCharts() {
    drawTopicsChart(topicsBarChart)
//   drawPyramid(dollarsG, yearIndex, "dollars");
//   drawPyramid(percentG, yearIndex, "percent");
//   drawLineChart(lineDollars, levelsData, "dollars");
//   drawLineChart(linePercent, levelsData, "percent");
}

d3.select("#submitSearchQuery").on("click", function(event){
    let query = d3.select("#searchQuery").property("value").toLowerCase();
    let count = countQueryOccurrences(query);
    drawTopicsChart(topicsBarChart, query, count);
})

function countQueryOccurrences(query) {
    // AI: I have a JS array of CSV objects with column "subject".
    // I want to count how many times a string "query" appears in a row in this object.
    // Give me the minimal JS code to achieve this.
    return questionsData.filter(
        obj => obj.subject && obj.subject.includes(query)
    ).length;
}

function drawTopicsChart(svg, query, count) {

    let maxFreq = 2500;
    if(query) {
        topicFrequencies.push({"topic": query, "count": count})
        topicFrequencies.sort((a, b) => b.count - a.count)

        if(count > maxFreq) {
            maxFreq = count
        }    
    }

    // Source: https://www.danvega.dev/blog/find-max-array-objects-javascript
    
    // let maxFreq = topicFrequencies.length == 0 ? 2500 : Math.max(...topicFrequencies.map(item => item.count));
    // hardcoding the width and maxFreq for now -- the above code isn't working
    
    let width_scale = d3.scaleLinear([0, maxFreq], [0, 500]);

    svg.selectAll("#topicsChartContainer").exit().remove()

    svg.selectAll("#topicsChartContainer")
        .data(topicFrequencies)
        .enter() 
        .append("rect")
            .attr("id", (d, i) => `rect${i}`)
            .attr("y", (d, i) => 40*i)
            .attr("height", 30)
            .attr("width", d => width_scale(d["count"]))
            .attr("fill", "#073b60")
    svg.selectAll("#topicsChartContainer")
        .data(topicFrequencies)
        .enter()
        .append("text")
            .attr("id", (d, i) => `text${i}`)
            .attr("y", (d, i) => 40*i+10)
            .attr("style", "fill: white; font-size: 12px")
            .text((d, i) => `${d["topic"]}: ${d["count"]}`)


    // Source: https://stackoverflow.com/questions/8668174/using-the-indexof-method-on-an-array-of-objects
    idx = topicFrequencies.map(item => item.topic).indexOf(query)
    svg.select(`#rect${idx}`)
        .attr("style", "fill: #994e0d")
   
    console.log(topicFrequencies)
    // delete the queried term from the array
    topicFrequencies = topicFrequencies.filter(item => item.topic !== query);
}


/*
// disable timer (see below setInterval code)
function stopTimer() {
  clearInterval(timerFunc);
  timerFunc = null;
  d3.select("#playPause").text("Play");
}

// The below global code runs on page load to set up the application.

// color the text in the paragraph to act as a key
d3.selectAll(".pyramidLabel").style("color", (d, i) => d3.schemeOranges[5][i]);

// load CSV and parse data -- then draw charts for first time
d3.csv("levels.csv").then((data) => {
  levelsData = data;
  updateCharts();
});

// if they drag the slider, update charts
d3.select("#timeSlider").on("change", function (e) {
  // update the index & redraw
  yearIndex = e.target.value;
  updateCharts();
});

// if play button is clicked toggle play state
d3.select("#playPause").on("click", function (e) {
  // toggle the playing class -- used for display
  // as well as knowing if the animation is active
  e.target.classList.toggle("playing");

  // if the state is now playing -- start a timer function
  if (e.target.classList.contains("playing")) {
    // toggle button to say 'Pause'
    d3.select(e.target).text("Pause");

    // reset timer if they've gone past the end
    if (yearIndex >= levelsData.length) {
      yearIndex = 0;
    }

    // setInterval will call this function every 100ms until cancelled
    // the variable "timerFunc" stores a reference to the timer so we can
    // pause/cancel it
    timerFunc = setInterval(function () {
      yearIndex += 1;
      const timeSlider = d3.select("#timeSlider");
      if (yearIndex >= levelsData.length && timerFunc) {
        stopTimer();
        yearIndex = levelsData.length - 1;
      }
      timeSlider.attr("value", yearIndex);
      updateCharts();
    }, 100);
  } else if (timerFunc) {
    stopTimer();
  }
});
*/