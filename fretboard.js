const dataset = [10, 20, 30];
const w = 700;
const h = 250;
const padding = 10;
const no_frets = 13; // number of frets

// COLOURS
const fretboard_colour = 'BurlyWood';
const fret_colour      = 'DimGray';
const string_colour    = 'DarkGoldenRod';

const notes = [ 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B' ];
const intervals = [ "1", "p2", "S2", "p3", "S3", "4", '-5', "5", "p6", "S6", "p7", "S7" ];

const fret_h = h - 2 * padding; // height of one fret
const fret_w = (w - 2 * padding) / no_frets; // width of one fret
const string_sep = fret_h / 6;

function romanize(num) {
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// CANVAS
const svg = d3.select("body").append("svg")
	.attr("width", w)
	.attr("height", h);

// GUITAR NECK
svg.append("rect")
.attr("x", padding)
.attr("y", padding)
.attr("width", w - 2 * padding)
.attr("height", h - 2 * padding)
.attr("fill", fretboard_colour);

// FRETS
for ( var x=0; x<=no_frets; x++){
	const x_coord = padding + x * fret_w;
	const line = svg.append("line")
	.attr("x1", x_coord)
	.attr("x2", x_coord)
	.attr("y1", padding)
	.attr("y2", h - padding)
	.attr("stroke", fret_colour)
	.attr("stroke-width", 4);
	// NUT IS BIGGER
	if (x == 0) {
		line.attr("stroke-width", 8);
	}
}

// STRINGS
for (y=0; y<6; y++){
	const y_value = padding + 0.5*string_sep + y*string_sep;
	svg.append("line")
	.attr("x1", padding)
	.attr("x2", w - padding)
	.attr("y1", y_value)
	.attr("y2", y_value)
	.attr("stroke", string_colour)
	.attr("stroke-width", 0.6 * y + 2);
}

// FRET NUMBERS
for ( var x=0; x<=no_frets; x++){
	const fret_number = romanize(x+1);
	svg.append("text")
	.attr("text", romanize(x+1))
	.attr("x", padding + 0.5 * fret_w + x * fret_w)
	.attr("y", 0.5 * padding);
}

svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("cx", (d) => 10 * d )
	.attr("cy", (d, i) => h - 10 * i - 5 )
	.attr("r", 5);
