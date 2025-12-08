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
d3.select("#submitSearchQuery").on("click", function(event) {
    let originalQuery = d3.select("#searchQuery").property("value")
    let query = originalQuery.toLowerCase();
    let count = countQueryOccurrences(query);
    countsPerYear = countQueryOccurrencesByYear(query)
    drawTopicsChart(topicsBarChart, query, count);
    drawTopicsLineChart(topicsLineChart, query, countsPerYear);
    d3.select("#topicsLineChartHeader").text(`Annual Mentions of \"${originalQuery}\" in the Question Hour (2001-2018)`)
})

d3.select("#searchQuery").on("keydown", function(event) {
    if(event.keyCode == 13) {
        let originalQuery = d3.select("#searchQuery").property("value")
        let query = originalQuery.toLowerCase();
        let count = countQueryOccurrences(query);
        countsPerYear = countQueryOccurrencesByYear(query)
        drawTopicsChart(topicsBarChart, query, count);
        drawTopicsLineChart(topicsLineChart, query, countsPerYear);
        d3.select("#topicsLineChartHeader").text(`Annual Mentions of \"${originalQuery}\" in the Question Hour (2001-2018)`);
    }
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
            
    // There are axis labels which are also type "text" so this class is to 
    // distinguish the two types of text
    svg.selectAll(".bar-label")
        .data(newTopicFrequencies)
        .join(
            enter => {updateText(enter.append("text").classed("bar-label", true))},
            updateText,
            exit => exit.remove()
        )
    
    // Drawing the axes and labels here
    svg.append("line")
        .attr("x1", -10)
        .attr("x2", 500)
        .attr("y1", 250)
        .attr("y2", 250)
        .attr("stroke", "white")
        .attr("stroke-width", "2px");

    svg.append("line")
        .attr("x1", -10)
        .attr("x2", -10)
        .attr("y1", 0)
        .attr("y2", 250)
        .attr("stroke", "white")
        .attr("stroke-width", "2px");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("stroke", "white")
        .attr("fill", "white")
        .attr("transform", "translate(-20, 125) rotate(-90)")
        .text("Topic");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("stroke", "white")
        .attr("fill", "white")
        .attr("transform", "translate(200, 265)")
        .text("Frequency");

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
        .attr("x", (d, i) => 10)
        .attr("y", (d, i) => 40*i+20)
        .attr("style", "fill: white; font-size: 12px;")
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
    const innerWidth = lineChartWidth - margin.left - margin.right; // 420
    const innerHeight = lineChartHeight - margin.top - margin.bottom; // 220

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xLineChartScale = d3.scaleLinear()
        .domain([2000, 2021])
        .range([0, innerWidth]);

    const yLineChartScale = d3.scaleLinear()
        .domain([0, d3.max(countsPerYear, d => d.count)])
        .range([innerHeight, 0]);
        //.nice();

    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xLineChartScale).tickFormat(d3.format("d")));
    
    g.append("g")
        .call(d3.axisLeft(yLineChartScale));

    g.append("text")
        .attr("class", "axis-title") 
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)  
        .attr("text-anchor", "middle")
        .text("Year");

    g.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -30)               
        .attr("text-anchor", "middle")
        .text("Questions Containing Term");

    const countsLine = d3.line()
        .x(d => xLineChartScale(d.year))
        .y(d => yLineChartScale(d.count))
        //.curve(d3.curveMonotoneX);

    g.append("path")
        .datum(countsPerYear)
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", countsLine);
}


/*********************************
*  State Map: Time-based heatmap
**********************************/

const minQuestions = 0;
const maxQuestions = 3816;
let currentYear = 2001;
let stateCounts = [];

const choroplethScale = d3.scaleThreshold()
    .domain([50, 100, 500, 1000, 2000, 4000])
    .range(['#edf8fb','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b'])

const choroplethNormalizedScale = d3.scaleThreshold()
    .domain([20, 40, 60, 80, 100, 120])
    .range(["#EDF8FB","#D8CFD1","#C3A6A8","#AE7D7E","#985354","#832A2B","#6E0101"]);

const indiaMap = makeChart("#indiaMapContainer", 800, 800);

let mapWidth = 500;
let mapHeight = 600;

let normalizeCounts = false;

d3.select("#normalizeCountsCheckbox").on("change", function(event) {
    normalizeCounts = !normalizeCounts;
    if(normalizeCounts) {
        title.text(`Average questions asked per MP in ${currentYear}`);
        drawThresholdLegend();
    } else {
        title.text(`Total questions asked by MPs in ${currentYear}`);
        drawThresholdLegend();
    }
    updateIndiaMap();
})

d3.csv("state_counts.csv").then((data) => {
    stateCounts = data;
    console.log(stateCounts)
});

function drawIndiaMap(geojson, path) {
    indiaMap.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d, i) {
            count = findStateCount(d);
            if(normalizeCounts) {
                return choroplethNormalizedScale(count)
            }
            return choroplethScale(count);
        })
        .attr("stroke", "#333") // Make this conditional too -- remove the borders for Ladakh, Telangana?
    drawThresholdLegend();
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
        if(normalizeCounts) {
            return choroplethNormalizedScale(count)
        }
        return choroplethScale(count);
    })
}

function findStateCount(state) {
    stateName = state.properties.st_nm;
    
    // AP was split in 2014 into AP + Telangana
    if(stateName == "Telangana" && currentYear <= 2014) {
        stateName = "Andhra Pradesh"
    }

    if(stateName == "Jammu and Kashmir" || stateName == "Ladakh") {
        stateName = "Jammu & Kashmir"
    }

    if(stateName == "Andaman and Nicobar Islands") {
        stateName = "Andaman & Nicobar Islands"
    }

    let rv = stateCounts.find(
        state_info => state_info.state == stateName 
        && state_info.year == currentYear.toString()
    );

    if(!rv) { // no match means no MP from the state asked questions that year
        return 0
    }

    if(normalizeCounts) {
        return rv.count_per_mp_rounded
    }
    return rv.count
}

let slider = d3
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
    if(normalizeCounts) {
        title.text(`Average questions asked per MP in ${currentYear}`);
    } else {
        title.text(`Total questions asked by MPs in ${currentYear}`);
    }
    
  });

const mapContainerSVG = d3.select("#indiaMapContainer svg");
mapContainerSVG.append("g")
   .attr("transform", "translate(10, 630)")
   .call(slider);

let title = mapContainerSVG
    .append("text")
    .attr("x", 260)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text(`Total questions asked by MPs in ${currentYear}`)

function drawThresholdLegend() {
    // Clear old legend
    indiaMap.selectAll("g.legend").remove();

    const gLegend = indiaMap.append("g").attr("class", "legend")
        .attr("transform", "translate(520,50)"); // adjust position

    const rectWidth = 20;
    const rectHeight = 20;
    const spacing = 5;

    let thresholds = [], colors = [];
    let title = "";
    if(normalizeCounts) {
        thresholds = [20, 40, 60, 80, 100, 120];
        colors = ["#EDF8FB","#D8CFD1","#C3A6A8","#AE7D7E","#985354","#832A2B","#6E0101"];
        title = "Avg Annual Questions per MP"
    } else {
        thresholds = [50, 100, 500, 1000, 2000, 4000];
        colors = ['#edf8fb','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b'];
        title = "Total Annual Questions"
    }

    gLegend.append("text")
        .attr("x", 0)
        .attr("y", -10) // above the first rectangle
        .attr("font-size", 12)
        .attr("stroke", "white")
        .attr("fill", "white")
        .text(title);

    // Manually create labels for N+1 buckets
    const labels = [
        `< ${thresholds[0]}`,
        `${thresholds[0]} - ${thresholds[1]-1}`,
        `${thresholds[1]} - ${thresholds[2]-1}`,
        `${thresholds[2]} - ${thresholds[3]-1}`,
        `${thresholds[3]} - ${thresholds[4]-1}`,
        `${thresholds[4]} - ${thresholds[5]-1}`,
        `≥ ${thresholds[5]}`
    ];

    console.log(colors)
    console.log(gLegend)
    // Draw rectangles
    colors.forEach((color, i) => {
        gLegend.append("rect")
            .attr("x", 0)
            .attr("y", i * (rectHeight + spacing))
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", color);

        gLegend.append("text")
            .attr("x", rectWidth + 5)
            .attr("y", i * (rectHeight + spacing) + rectHeight / 2 + 4)
            .attr("font-size", 10)
            .attr("stroke", "white")
            .attr("fill", "white")
            .text(labels[i]);
    });
}

/*********************************
*  Controlling the rendering logic
**********************************/
d3.selectAll(".button").on("click", function(event) {
    sectionToRender = d3.select(this).attr("data-rendering-id")
    
    d3.selectAll("section:not(.permanent)").classed("hidden", true);
    d3.select(`#${sectionToRender}`).classed("hidden", false);
})

d3.selectAll("a.toggleView").on("click", function(event) {
    sectionToRender = d3.select(this).attr("data-rendering-id")
    
    d3.selectAll("section:not(.permanent)").classed("hidden", true);
    d3.select(`#${sectionToRender}`).classed("hidden", false);
})