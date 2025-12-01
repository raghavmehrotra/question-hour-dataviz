// Creates the empty SVG to be rendered upon page load
const topicsBarChart = makeChart("#topicsChartContainer", 500, 300);

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

// Draws charts for the first time (bar chart has a static reference even before interaction)
d3.csv("mini.csv").then((data) => {
  questionsData = data;
  updateCharts();
});

function updateCharts() {
    drawTopicsChart(topicsBarChart)
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

    let maxFreq = d3.max(topicFrequencies, topic => topic.count)
    if(query) {
        topicFrequencies.push({"topic": query, "count": count})
        topicFrequencies.sort((a, b) => b.count - a.count)

        if(count > maxFreq) {
            maxFreq = count
        }    
    }

    let width_scale = d3.scaleLinear([0, maxFreq], [0, 500]);
    
    svg.selectAll("#topicsChartContainer")
    .exit()
    .transition()
    .duration(500)
    .attr("opacity", 0)
    .remove() //TODO: Fix this
    
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
        .attr("style", "fill: #994e0d") // TODO: This is not rendering correctly
   
    console.log(topicFrequencies)
    // delete the queried term from the array so it is not additive
    topicFrequencies = topicFrequencies.filter(item => item.topic !== query);
}