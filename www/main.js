/*********************************
*  Topic-based bar chart
**********************************/

// Creates the empty SVG to be rendered upon page load
const topicsBarChart = makeChart("#topicsChartContainer", 500, 300);

let questionsData = [];
// These are rough values for now, will update with precise values later.
// Will also consider a rotating set of themes for comparison + handle the edge
// case that the user selects one of the predefined themes
topicFrequencies = [
    {topic: "health", count: 2273, original: true},
    {topic: "legal", count: 1314, original: true},
    {topic: "border", count: 1085, original: true},
    {topic: "nuclear", count: 768, original: true},
    {topic: "climate", count: 401, original: true},
]
newTopicFrequencies = [...topicFrequencies]

// Draws charts for the first time (bar chart has a static reference even before interaction)
d3.csv("mini.csv").then((data) => {
  questionsData = data;
  drawTopicsChart(topicsBarChart);
});

let countsPerYear = [];
d3.select("#submitSearchQuery").on("click", function(event){
    let query = d3.select("#searchQuery").property("value").toLowerCase();
    let count = countQueryOccurrences(query);
    countsPerYear = countQueryOccurrencesByYear(query)
    drawTopicsChart(topicsBarChart, query, count);
    drawTopicsLineChart(topicsLineChart, query, countsPerYear);
})

function countQueryOccurrences(query) {
    // AI: I have a JS array of CSV objects with column "subject".
    // I want to count how many times a string "query" appears in a row in this object.
    // Give me the minimal JS code to achieve this.
    return questionsData.filter(
        obj => obj.subject && obj.subject.includes(query)
    ).length;
}

let maxFreq = d3.max(topicFrequencies, topic => topic.count)
function drawTopicsChart(svg, query, count) {
    if(query) {
        newTopicFrequencies = [...topicFrequencies]
        newTopicFrequencies.push({"topic": query, "count": count})
        newTopicFrequencies.sort((a, b) => b.count - a.count)
        if(count > maxFreq) {
            maxFreq = count
        }    
    } else {
        newTopicFrequencies = topicFrequencies
    }

    // topicFrequencies = topicFrequencies.filter(item => item.topic !== query);
    svg.selectAll("rect")
        .data(newTopicFrequencies)
        .join(
            enter => {updateRect(enter.append("rect"))},
            updateRect,
            exit => exit.remove()
        ) 
            
    svg.selectAll("text")
        .data(newTopicFrequencies)
        .join(
            enter => {updateText(enter.append("text"))},
            updateText,
            exit => exit.remove()
        )
}

function updateRect(rect) {
    let maxFreq = d3.max(newTopicFrequencies, topic => topic.count)
    let barWidthScale = d3.scaleLinear([0, maxFreq], [0, 500]);
    
    rect.attr("id", (d, i) => `rect${i}`)
        .attr("y", (d, i) => 40*i)
        .attr("height", 35)
        .attr("width", d => barWidthScale(d["count"]))
        .attr("fill", d => d.original ? "#073b60" : "#e67e22")
}

function updateText(text) {
    text
        .attr("id", (d, i) => `text${i}`)
        .attr("y", (d, i) => 40*i+10)
        .attr("style", "fill: white; font-size: 12px")
        .text((d, i) => `${d["topic"]}: ${d["count"]}`)

}

// Code to generate the line chart for query frequency over time
const lineChartWidth = 500;
const lineChartHeight = 300;
const topicsLineChart = makeChart("#topicsLineChartContainer", lineChartWidth, lineChartHeight);

function countQueryOccurrencesByYear(query) {
    counts = {};

    for(let i=2001; i<=2018; i++) {
        counts[i] = 0;
    }

    questionsData.forEach((d) => {
        const year = +d.year
        if(d.subject.includes(query)) {
            counts[year] = counts[year] + 1;
        }
    })

    // AI: How do I convert a list of regular JS objects into something of the form
    // [{key1: value1, key2: value2}, {key1: value1, key2: value2}...]
    return Object.keys(counts).map(year => ({year: +year, count: counts[year]}));
}


function drawTopicsLineChart(svg, query, countsPerYear) {
    
    // Found a bug that the data contains questions from 2000
    countsPerYear = countsPerYear.filter((d) => +d.year >= 2001 && +d.year <= 2018);

    svg.selectAll("*").remove();

    // AI: My x-axis does not appear inside my SVG in d3. How do I change
    // my width, height and margins to fix this?
    const innerWidth = lineChartWidth - margin.left - margin.right;
    const innerHeight = lineChartHeight - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xLineChartScale = d3.scaleLinear()
        .domain([2001, 2019])
        .range([0, innerWidth]);

    const yLineChartScale = d3.scaleLinear()
        .domain([0, d3.max(countsPerYear, d => d.count)])
        .range([innerHeight*1.10, 0]);
        //.nice();

    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xLineChartScale).tickFormat(d3.format("d")));
    
    g.append("g")
        .call(d3.axisLeft(yLineChartScale));

    const countsLine = d3.line()
        .x(d => xLineChartScale(d.year))
        .y(d => yLineChartScale(d.count))
        //.curve(d3.curveMonotoneX);

    g.append("path")
        .datum(countsPerYear)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", countsLine);
}


/*********************************
*  State Map: Time-based heatmap
**********************************/

const minQuestions = 0;
const maxQuestions = 3816;
let currentYear = 2001;
let stateCounts = [];

choroplethScale = d3.scaleThreshold(
    domain=[0, 50, 100, 500, 1000, 4000, 8000],
    // Source: https://colorbrewer2.org/#type=sequential&scheme=Blues&n=7
    range = ['#edf8fb','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b']
)

const indiaMap = makeChart("#indiaMapContainer", 800, 800);

let mapWidth = 500;
let mapHeight = 600;

d3.csv("state_counts.csv").then((data) => {
  stateCounts = data;
});

function drawIndiaMap(geojson, path) {
    indiaMap.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d, i) {
            count = findStateCount(d);
            return choroplethScale(count);
        })
        .attr("stroke", "#333") // Make this conditional too -- remove the borders for Ladakh, Telangana?
}

d3.json("india_states.geojson").then(function(geojson) {
    const projection = d3.geoMercator().fitSize([mapWidth, mapHeight], geojson);
    const path = d3.geoPath().projection(projection);
    drawIndiaMap(geojson, path);
})

function updateIndiaMap() {
    indiaMap
    .selectAll("path")
    .attr("fill", function(d, i) {
        //console.log(d3.select(this).datum())
        count = findStateCount(d);
        return choroplethScale(count);
    })
}

function findStateCount(state) {
    
    stateName = state.properties.st_nm;
    
    if(stateName == "Telangana" && currentYear <= 2014) {
        stateName = "Andhra Pradesh"
    }

    let rv = stateCounts.find(
        state_info => state_info.state == stateName 
        && state_info.year == currentYear.toString()
    );

    if(!rv) { // no match means no MP from the state asked questions that year
        return 0
    }

    return rv.count
}

var slider = d3
  .sliderBottom()
  .min(2001)
  .max(2018)
  .width(400)
  .ticks(9)
  .tickFormat(d3.format("d"))
  .step(1)
  .default(currentYear)
  .on('onchange', val => {
    currentYear = val;
    updateIndiaMap();
    title.text(`Number of questions asked by MPs from each state in ${currentYear}`);
  });

const mapContainerSVG = d3.select("#indiaMapContainer svg");
mapContainerSVG.append("g")
   .attr("transform", "translate(10, 630)")
   .call(slider);

let title = mapContainerSVG
    .append("text")
    .attr("x", 350)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text(`Number of questions asked by MPs from each state in ${currentYear}`)