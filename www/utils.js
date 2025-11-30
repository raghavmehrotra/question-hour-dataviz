
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

function makeChart(id, chartWidth, chartHeight) {
  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`);
  return svg;
}
