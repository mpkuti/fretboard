const dataset = [10, 20, 30];
const w = 500
const h = 100

const svg = d3.select("body").append("svg")
	.attr("width", w)
	.attr("height", h);

svg.selectAll("circle")
	.data("dataset")
	.enter()
	.append("circle")
	.attr("cx", (d) => d)
	.attr("cy", (d, i) => 10 * i)
	.attr("r", (d) => d);
