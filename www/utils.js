
const margin = { top: 20, right: 20, bottom: 60, left: 60 };

function makeChart(id, chartWidth, chartHeight) {
  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr("id", `${id}-g`);
  return svg;
}