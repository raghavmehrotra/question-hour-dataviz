// 30 Nov 2025: Keeping this here as I might create a line chart later on


const categories = ["TopPt1", "RemainingTop1", "Next9", "Next40", "Bottom50"];

function drawLineChart(svg, rawData, mode) {
  const lineChartLayout = { top: 20, right: 30, bottom: 50, left: 60 };
  lineChartLayout.width = 700 - lineChartLayout.left - lineChartLayout.right;
  lineChartLayout.height = 400 - lineChartLayout.top - lineChartLayout.bottom;

  // make a copy of the data so it can be mutated
  let chartData = rawData.map((d) => Object.assign({}, d));
  let maxY = 60_000_000;

  if (mode === "percent") {
    for (let row of chartData) {
      let quarterTotal = categories
        .map((c) => +row[c])
        .reduce((partialSum, a) => partialSum + a, 0);
      categories.forEach((c) => (row[c] /= quarterTotal / 100));
      maxY = 100;
    }
  } else {
    maxY = 60_000_000;
  }

  // set up SVG
  svg
    .selectAll("g.chart-content")
    .data([null]) // bind a single (unused) data element to ensure a single <g>
    .join("g")
    .attr(
      "transform",
      `translate(${lineChartLayout.left},${lineChartLayout.top})`,
    )
    .attr("class", "chart-content");

  // convert the Date field to DateTime type for d3 scaling
  const parseDate = d3.timeParse("%Y:Q%q");
  chartData.forEach((d) => (d.DateQ = parseDate(d.Date)));

  // Create scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(chartData, (d) => d.DateQ))
    .range([0, lineChartLayout.width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxY])
    .nice()
    .range([lineChartLayout.height, 0]);

  // Axes (use null join trick again to update instead of append)
  const xAxis = d3.axisBottom(xScale).ticks(20);
  const yAxis = d3.axisLeft(yScale);
  svg
    .selectAll(".x-axis")
    .data([null])
    .join("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${lineChartLayout.height})`)
    .call(xAxis);
  svg
    .selectAll(".y-axis")
    .data([null])
    .join("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // line path generator from D3, will use x/y range to map data to line
  const line = d3
    .line()
    .x((d) => xScale(d.DateQ))
    .y((d) => yScale(d.value));

  // create a line per category
  svg
    .selectAll(".catLine")
    .data(categories)
    .join("path")
    .attr("class", "catLine")
    .attr("fill", "none")
    .attr("stroke", (d, i) => d3.schemeOranges[5][i])
    .attr("stroke-width", 2)
    .attr("d", (category) =>
      line(chartData.map((d) => ({ DateQ: d.DateQ, value: d[category] }))),
    );
}
