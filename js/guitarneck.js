// Import everything from common.js
import * as common from './common.js';

// Import the functions from the other files
import { drawBackground, setNoteTextOpacity } from './background.js';
import { drawSlider, moveSlider, setColor, setOpacity, colorBasenote, colorNotes, setAllColor, colorPentatonic } from './slider.js';

window.changeBaseNote = changeBaseNote;

// Select the SVG container
var svg = d3.select("#container")
            .append("svg")
            .attr("width", common.G_WIDTH)
            .attr("height", common.G_HEIGHT);

drawBackground(svg);
drawSlider(svg);

// Attach the click event handler to the SVG container
svg.on("click", moveSlider);

window.toggleNoteNames = function() {
  var checkbox = document.getElementById('noteNamesCheckbox');
  if (checkbox.checked) {
    setNoteTextOpacity(1); // Show note names
  } else {
    setNoteTextOpacity(0); // Hide note names
  }
};

// Default setup
setOpacity(0.4);
changeBaseNote("C");
setNoteTextOpacity(1);

// Function to change base note
function changeBaseNote(newBaseNote) {
  console.log("Changing base note to " + newBaseNote);
  var baseNote = newBaseNote;
  colorBasenote(baseNote, "red", "blue");
}