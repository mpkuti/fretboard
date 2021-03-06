const dataset = [10, 20, 30];
const w = 960;
const h = 250;
const padding = 15;
const no_frets = 12; // number of frets

// COLOURS
const fretboard_colour = "BurlyWood";
const fret_colour = "DimGray";
const string_colour = "DarkGoldenRod";

function rotateRight(arr) {
  let last = arr.pop();
  arr.unshift(last);
  return arr;
}
function rotateLeft(arr) {
  let first = arr.shift();
  arr.push(first);
  return arr;
}

const notes_a = [
  "A",
  "A#/Bb",
  "B",
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
];
const notes_as = rotateLeft(notes_a);
const notes_b = rotateLeft(notes_as);
const notes_c = rotateLeft(notes_b);
const notes_cs = rotateLeft(notes_c);
const notes_d = rotateLeft(notes_cs);
const notes_ds = rotateLeft(notes_d);
const notes_e = rotateLeft(notes_ds);
const notes_f = rotateLeft(notes_e);
const notes_fs = rotateLeft(notes_f);
const notes_g = rotateLeft(notes_fs);
const notes_gs = rotateLeft(notes_g);
//const notes = [ 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B' ];
const intervals = [
  "1",
  "p2",
  "S2",
  "p3",
  "S3",
  "4",
  "-5",
  "5",
  "p6",
  "S6",
  "p7",
  "S7",
];
const dots = [3, 5, 7, 9, 15, 17, 19, 21];
const double_dots = [12, 24];

const fret_numbers = d3.range(1, no_frets + 1);
const fret_h = h - 2 * padding; // height of one fret
const fret_w = (w - 2 * padding) / no_frets; // width of one fret
const string_sep = fret_h / 6;

const xScale = d3
  .scaleLinear()
  .domain([1, no_frets])
  .range([padding + fret_w / 2, padding + (no_frets - 0.5) * fret_w]);

function romanize(num) {
  var lookup = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    },
    roman = "",
    i;
  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// CANVAS
const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

// GUITAR NECK
svg
  .append("rect")
  .attr("x", padding)
  .attr("y", padding)
  .attr("width", w - 2 * padding)
  .attr("height", h - 2 * padding)
  .attr("fill", fretboard_colour)
  .style("opacity", 1);

// DOTS
svg
  .append("g")
  .selectAll("circle")
  .data(dots)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("cy", h / 2)
  .attr("cx", (d) => padding + 0.5 * fret_w + (d - 1) * fret_w);

// DOUBLE DOTS 1
doubledot_group = svg
  .append("g")
  .selectAll("circle")
  .data(double_dots)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("cy", padding + (h - 2 * padding) / 3)
  .attr("cx", (d) => padding + (d - 0.5) * fret_w);

// DOUBLE DOTS 2
svg
  .append("g")
  .selectAll("circle")
  .data(double_dots)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("cy", padding + (2 * (h - 2 * padding)) / 3)
  .attr("cx", (d) => padding + (d - 0.5) * fret_w);

// FRETS
const fret_xscale = d3.scaleLinear([0, no_frets],[padding, w-padding]);
const frets = svg.selectAll(".fret")
  .data(d3.range(no_frets+1))
  .join("line")
  .classed("fret", true)
  .attr("x1", (d) => fret_xscale(d))
  .attr("x2", (d) => fret_xscale(d))
  .attr("y1", padding)
  .attr("y2", h - padding)
  .attr("stroke", fret_colour)
  .attr("stroke-width", 5);


// STRINGS
for (y = 0; y < 6; y++) {
  const y_value = padding + 0.5 * string_sep + y * string_sep;
  svg
    .append("line")
    .attr("x1", padding)
    .attr("x2", w - padding)
    .attr("y1", y_value)
    .attr("y2", y_value)
    .attr("stroke", string_colour)
    .attr("stroke-width", 0.6 * y + 2);
}

// FRET NUMBERS
svg
  .selectAll("text")
  .data(fret_numbers)
  .enter()
  .append("text")
  .text((d) => romanize(d))
  .attr("x", (d) => xScale(d))
  .attr("y", h)
  .attr("text-anchor", "middle");

svg
  .selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", (d) => 10 * d)
  .attr("cy", (d, i) => h - 10 * i - 5)
  .attr("r", 5);
