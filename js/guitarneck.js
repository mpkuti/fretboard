// Import everything from common.js
import * as common from './common.js';

// Import the functions from the other files
import { drawBackground } from './background.js';
import { drawSlider, moveSlider } from './slider.js';


// Select the SVG container
var svg = d3.select("#container")
            .append("svg")
            .attr("width", common.G_WIDTH)
            .attr("height", 500);

drawBackground(svg);
drawSlider(svg);

// Attach the click event handler to the SVG container
svg.on("click", moveSlider);
