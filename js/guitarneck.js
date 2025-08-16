/**
 * @fileoverview Main application logic for the interactive guitar fretboard
 * Coordinates between all modules and handles user interactions and initialization
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, DEFAULTS, HIGHLIGHT_MODE_INTERVAL_MAP, CHORD_PALETTE, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, MIN_FRETS, MAX_FRETS } from './constants.js';
import { getZoomLevel, setZoomLevel, containerWidth, containerHeight, padding, setFretCount, getFretCount } from './layout.js';
import { pentatonic, buildPentatonicLabel, getNoteFromInterval, recalcAllNoteCoordinates } from './utils.js';
import { 
    getBaseNote, 
    setBaseNote, 
    getHighlightMode, 
    setHighlightMode, 
    initializeNoteNamesVisibility, 
    getNoteNamesVisibility, 
    initializeIntervalVisibility, 
    getIntervalVisibility,
    getHighlightSet,
    setHighlightSet,
    initializeAllSettings,
    setStringTuning,
    getStringTuning
} from './state.js';
import { EVENTS, on } from './events.js';

// Import the functions from the other files
import { drawBackground, drawNoteLabels, showAllNotes, hideAllNotes, setNoteNamesVisibility } from './background.js';
import { drawSlider, moveSlider, updateIntervalText, showIntervalsWithVisual, hideIntervalsWithVisual, highlightNotes, outlineBaseNoteCircles, highlightNotesMulti } from './slider.js';

// Set a default setting for the base note and highlight mode
// var defaultBaseNote = "C";
// var defaultHighlightMode = "BASENOTE";


// Select the SVG container
var svg = d3.select("#fretboard_container")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .classed('init-fade', true);
// New root group for scalable content
var zoomRoot = svg.append('g').attr('id','zoomRoot');

drawBackground(zoomRoot);
drawSlider(zoomRoot);
drawNoteLabels(zoomRoot);


// Attach the click event handler to the scalable root
zoomRoot.on("click", moveSlider);


// ******************** START FUNCTIONS ********************


/**
 * Initializes the application view with settings from localStorage
 * Sets up opacity, note visibility, interval visibility, base note, and highlight mode
 */
export function initializeView() {
  // setOpacity(DEFAULTS.OPACITY); // removed: opacity now fixed via CIRCLE_OPACITY constant
  initializeNoteNamesVisibility();
  const noteNamesChecked = getNoteNamesVisibility();
  const noteCb = document.getElementById('noteNamesCheckbox');
  if (noteCb) noteCb.checked = noteNamesChecked;
  setNoteNamesVisibility();
  initializeIntervalVisibility();
  const intervalChecked = getIntervalVisibility();
  const intCb = document.getElementById('intervalNamesCheckbox');
  if (intCb) intCb.checked = intervalChecked;
  if (intervalChecked) {
    showIntervalsWithVisual();
  } else {
    hideIntervalsWithVisual();
  }
  // Ensure dropdown reflects persisted base note (event will not fire if unchanged)
  const persistedBase = getBaseNote();
  const baseSelectEl = document.getElementById('baseNoteSelectDropdown');
  if (baseSelectEl) baseSelectEl.value = persistedBase;
  changeBaseNote(persistedBase); // no-op if same, keeps logic consistent
  const currentHighlight = getHighlightMode();
  const radioButton = document.querySelector(`input[name="highlightMode"][value="${currentHighlight}"]`);
  if (radioButton) radioButton.checked = true;
  selectHighlightMode(currentHighlight);

  on(EVENTS.BASE_NOTE_CHANGED, onBaseNoteChanged);
  on(EVENTS.HIGHLIGHT_MODE_CHANGED, onHighlightModeChanged);
}

/**
 * Handles checkbox state changes for note names and intervals
 * @param {HTMLInputElement} checkbox - The checkbox element that changed
 * @param {string} checkboxType - The type of checkbox ('noteNamesCheckbox' or 'intervalNamesCheckbox')
 */
function handleCheckboxChange(checkbox, checkboxType) {
  if (checkbox.checked) {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      showAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      showIntervalsWithVisual();
    }
  } else {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      hideAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      hideIntervalsWithVisual();
    }
  }
}

/**
 * Changes the base note and updates the UI accordingly
 * @param {string} newBaseNote - The new base note (e.g., 'C', 'F#', 'Bb')
 */
function changeBaseNote(newBaseNote) {
  setBaseNote(newBaseNote);
}


/**
 * Selects and applies a highlight mode to the fretboard
 * @param {string} highlightMode - The highlight mode ('NONE', 'BASENOTE', or 'PENTATONIC')
 */
function selectHighlightMode(highlightMode) {
  setHighlightMode(highlightMode);
};

function renderPentatonicLabel() {
  const label = document.getElementById('pentatonicScaleKeyLabel');
  if (!label) return;
  label.textContent = buildPentatonicLabel(getBaseNote(), getHighlightMode());
}

function applyHighlightColors() {
  const mode = getHighlightMode();
  const base = getBaseNote();
  const def = HIGHLIGHT_MODE_INTERVAL_MAP[mode];
  if (!def || def === '') { highlightNotes([], 'green', 'white'); return; }
  if (mode === 'PENTATONIC_SCALE') {
    highlightNotes(pentatonic(base), 'green', 'white');
    return;
  }
  const semis = def.split(',').filter(s => s.length).map(s => parseInt(s,10));
  const notes = semis.map(semi => getNoteFromInterval(base, semi));
  if (mode.endsWith('_CHORD')) {
    const map = {};
    notes.forEach((n,i)=>{ map[n]=CHORD_PALETTE[i%CHORD_PALETTE.length]; });
    highlightNotesMulti(map,'white');
  } else {
    highlightNotes(notes,'green','white');
  }
}

function bindUIEvents() {
  const baseSelect = document.getElementById('baseNoteSelectDropdown');
  if (baseSelect) {
    baseSelect.addEventListener('change', e => {
      changeBaseNote(e.target.value); // event will trigger UI updates
    });
  }
  // Helper to ensure dropdown options reflect current MIN/MAX
  function populateFretCountOptions(selectEl){
    if (!selectEl) return;
    const current = String(getFretCount());
    // Rebuild only if options don't match constants
    const needRebuild = selectEl.options.length !== (MAX_FRETS - MIN_FRETS + 1)
      || (selectEl.options.length && (selectEl.options[0].value !== String(MIN_FRETS) || selectEl.options[selectEl.options.length-1].value !== String(MAX_FRETS)));
    if (needRebuild) {
      selectEl.innerHTML = '';
      for (let i = MIN_FRETS; i <= MAX_FRETS; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        selectEl.appendChild(opt);
      }
    }
    // Ensure value is valid and selected
    const val = (Number(current) < MIN_FRETS || Number(current) > MAX_FRETS) ? String(DEFAULTS.FRET_COUNT) : current;
    selectEl.value = String(val);
  }
  const fretInput = document.getElementById('fretCountInput');
  if (fretInput) {
    populateFretCountOptions(fretInput);
    fretInput.value = String(getFretCount());
    fretInput.addEventListener('change', e => {
      setFretCount(e.target.value);
    });
  }
  const instrumentSelect = document.getElementById('instrumentTypeSelect');
  if (instrumentSelect) {
    instrumentSelect.addEventListener('change', e => {
      const val = e.target.value;
      let tuning;
      if (val === 'bass5') tuning = ['G','D','A','E','B']; // 5-string bass high-to-low visual order
      else if (val === 'bass4') tuning = ['G','D','A','E'];
      else if (val === 'ukulele4') tuning = ['A','E','C','G'];
      else tuning = ['E','B','G','D','A','E'];
      setStringTuning(tuning);
      recalcAllNoteCoordinates();
      rebuildFretboard();
  buildTuningRows(); // rebuild tuning controls for new string count
  detectAndSetPresetFromCurrent();
    });
    // Initialize selection to match current tuning length
    try {
      const cur = getStringTuning();
      if (cur.length === 4) {
        // Distinguish bass vs ukulele heuristically (bass lowest note E, uke highest A). Check presence of low E and A
        if (cur.includes('F#') || cur.includes('C#')) instrumentSelect.value = 'guitar6';
        else if (cur[3] === 'E') instrumentSelect.value = 'bass4';
        else instrumentSelect.value = 'ukulele4';
      } else if (cur.length === 5) {
        instrumentSelect.value = 'bass5';
      } else instrumentSelect.value = 'guitar6';
    } catch {}
  }
  document.getElementById('noteNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'noteNamesCheckbox');
  });
  document.getElementById('intervalNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'intervalNamesCheckbox');
  });
  const select = document.getElementById('highlightModeSelect');
  if (select) {
    select.value = getHighlightMode();
    select.addEventListener('change', e => selectHighlightMode(e.target.value));
  }
  const basicModes = [
    'NONE','BASENOTE','PENTATONIC_SCALE','MAJOR_SCALE','NATURAL_MINOR_SCALE',
    'MAJOR_CHORD','MINOR_CHORD','DOMINANT_SEVEN_CHORD','MAJOR_SEVEN_CHORD','MINOR_SEVEN_CHORD','POWER_CHORD'
  ];
  const advancedGroups = [
    {label:'Basic', modes:basicModes},
    {label:'Triads / Power / Sus', modes:['DIMINISHED_CHORD','AUGMENTED_CHORD','SUSPENDED_2_CHORD','SUSPENDED_4_CHORD']},
    {label:'6 / Add / 7', modes:['SIX_CHORD','MINOR_SIX_CHORD','ADD9_CHORD','MINOR_ADD9_CHORD','SIX_NINE_CHORD','HALF_DIMINISHED_SEVEN_CHORD','DIMINISHED_SEVEN_CHORD','MINOR_MAJOR_SEVEN_CHORD']},
    {label:'Extended (9/11/13)', modes:['MAJOR_NINE_CHORD','DOMINANT_NINE_CHORD','MINOR_NINE_CHORD','MINOR_MAJOR_NINE_CHORD','DOMINANT_ELEVEN_CHORD','MAJOR_ELEVEN_CHORD','MINOR_ELEVEN_CHORD','DOMINANT_THIRTEEN_CHORD','MAJOR_THIRTEEN_CHORD','MINOR_THIRTEEN_CHORD']},
    {label:'Altered / Susp', modes:['DOMINANT_SEVEN_SUS4_CHORD','DOMINANT_FLAT_NINE_CHORD','DOMINANT_SHARP_NINE_CHORD','DOMINANT_FLAT_THIRTEEN_CHORD','DOMINANT_SHARP_ELEVEN_CHORD','ALTERED_DOMINANT_CHORD','DOMINANT_SEVEN_SHARP_NINE_CHORD']},
    {label:'Scales', modes:['HARMONIC_MINOR_SCALE','MELODIC_MINOR_SCALE','BLUES_SCALE','WHOLE_TONE_SCALE','DIMINISHED_HALF_WHOLE_SCALE','DIMINISHED_WHOLE_HALF_SCALE']}
  ];
  function labelFor(mode){
    const map = {
      NONE:'None', BASENOTE:'Basenote', PENTATONIC_SCALE:'Pentatonic Scale', MAJOR_SCALE:'Major Scale', NATURAL_MINOR_SCALE:'Natural Minor Scale', HARMONIC_MINOR_SCALE:'Harmonic Minor Scale', MELODIC_MINOR_SCALE:'Melodic Minor Scale', BLUES_SCALE:'Blues Scale', WHOLE_TONE_SCALE:'Whole Tone Scale', DIMINISHED_HALF_WHOLE_SCALE:'Half-Whole Diminished', DIMINISHED_WHOLE_HALF_SCALE:'Whole-Half Diminished',
      MAJOR_CHORD:'Major Chord', MINOR_CHORD:'Minor Chord', DIMINISHED_CHORD:'Diminished Chord', AUGMENTED_CHORD:'Augmented Chord', SUSPENDED_2_CHORD:'Sus2 Chord', SUSPENDED_4_CHORD:'Sus4 Chord', POWER_CHORD:'Power Chord',
      SIX_CHORD:'6 Chord', MINOR_SIX_CHORD:'Minor 6 Chord', ADD9_CHORD:'Add9 Chord', MINOR_ADD9_CHORD:'Minor Add9 Chord', SIX_NINE_CHORD:'6/9 Chord',
      MAJOR_SEVEN_CHORD:'Maj7 Chord', DOMINANT_SEVEN_CHORD:'7 Chord', MINOR_SEVEN_CHORD:'m7 Chord', HALF_DIMINISHED_SEVEN_CHORD:'m7b5 Chord', DIMINISHED_SEVEN_CHORD:'dim7 Chord', MINOR_MAJOR_SEVEN_CHORD:'mMaj7 Chord',
      MAJOR_NINE_CHORD:'Maj9 Chord', DOMINANT_NINE_CHORD:'9 Chord', MINOR_NINE_CHORD:'m9 Chord', MINOR_MAJOR_NINE_CHORD:'mMaj9 Chord', DOMINANT_ELEVEN_CHORD:'11 Chord', MAJOR_ELEVEN_CHORD:'Maj11 Chord', MINOR_ELEVEN_CHORD:'m11 Chord', DOMINANT_THIRTEEN_CHORD:'13 Chord', MAJOR_THIRTEEN_CHORD:'Maj13 Chord', MINOR_THIRTEEN_CHORD:'m13 Chord',
      DOMINANT_SEVEN_SUS4_CHORD:'7sus4 Chord', DOMINANT_FLAT_NINE_CHORD:'7b9 Chord', DOMINANT_SHARP_NINE_CHORD:'7#9 Chord', DOMINANT_FLAT_THIRTEEN_CHORD:'7b13 Chord', DOMINANT_SHARP_ELEVEN_CHORD:'7#11 Chord', ALTERED_DOMINANT_CHORD:'Altered 7 Chord', DOMINANT_SEVEN_SHARP_NINE_CHORD:'7#9 (Alt) Chord'
    };
    return map[mode] || mode;
  }
  function rebuildSelect(modeSet){
    if (!select) return;
    const current = getHighlightMode();
    select.innerHTML='';
    if (modeSet === 'BASIC') {
      basicModes.forEach(m=>{
        const opt=document.createElement('option'); opt.value=m; opt.textContent=labelFor(m); select.appendChild(opt);
      });
    } else {
      advancedGroups.forEach(group=>{
        const og = document.createElement('optgroup'); og.label = group.label; select.appendChild(og);
        group.modes.forEach(m=>{ const opt=document.createElement('option'); opt.value=m; opt.textContent=labelFor(m); og.appendChild(opt); });
      });
    }
    // Restore selection if present else fallback
    if ([...select.options].some(o=>o.value === current)) select.value = current; else select.value = 'BASENOTE';
    selectHighlightMode(select.value);
  }
  document.querySelectorAll('input[name="highlightSet"]').forEach(r=>{
    r.addEventListener('change', e=>{ setHighlightSet(e.target.value); rebuildSelect(e.target.value); });
  });
  const storedSet = getHighlightSet();
  const radio = document.querySelector(`input[name="highlightSet"][value="${storedSet}"]`);
  if (radio) radio.checked = true;
  rebuildSelect(storedSet || (document.querySelector('input[name="highlightSet"]:checked')?.value || 'BASIC'));
}

// ---------------- TUNING PANEL LOGIC ----------------
const PRESET_MAP = {
  STANDARD: ['E','B','G','D','A','E'],
  DROP_D: ['E','B','G','D','A','D'],
  DADGAD: ['D','A','G','D','A','D'],
  OPEN_G: ['D','B','G','D','G','D'],
  OPEN_D: ['D','A','F#','D','A','D']
};

function tuningEquals(a,b){ if(!a||!b||a.length!==b.length) return false; for(let i=0;i<a.length;i++){ if(a[i]!==b[i]) return false; } return true; }

function currentPresetKey(cur){
  for (const k of Object.keys(PRESET_MAP)) {
    if (tuningEquals(cur, PRESET_MAP[k])) return k;
  }
  return 'CUSTOM';
}

function buildTuningRows(){
  const container = document.getElementById('tuningRows');
  if(!container) return;
  container.innerHTML='';
  const tuning = getStringTuning();
  // Highest string visually at top (current order already highest->lowest in existing logic)
  tuning.forEach((note, idx)=>{
    const row = document.createElement('div'); row.className='tuning-row';
    const label = document.createElement('label'); label.htmlFor = 'tuningString'+idx; label.textContent = (idx+1)+':';
    const sel = document.createElement('select'); sel.id='tuningString'+idx; sel.setAttribute('data-index', String(idx));
    ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].forEach(n=>{
      const opt=document.createElement('option'); opt.value=n; opt.textContent=n; if(n===note) opt.selected=true; sel.appendChild(opt);
    });
    sel.addEventListener('change', ()=>{
      const newTuning = getStringTuning().slice();
      newTuning[idx] = sel.value;
      setStringTuning(newTuning);
      recalcAllNoteCoordinates();
      rebuildFretboard();
      detectAndSetPresetFromCurrent();
      updateTuningSummary();
    });
    row.appendChild(label);
    row.appendChild(sel);
    container.appendChild(row);
  });
  updateTuningSummary();
}

function applyPreset(presetKey){
  const base = PRESET_MAP[presetKey];
  if (!base) return;
  const currentLen = getStringTuning().length;
  // If string count different, slice or repeat nearest
  let target = base.slice();
  if (currentLen !== base.length) {
    if (currentLen < base.length) target = base.slice(0,currentLen);
    else {
      // extend by repeating last (lowest) note
      while (target.length < currentLen) target.push(base[base.length-1]);
    }
  }
  setStringTuning(target);
  recalcAllNoteCoordinates();
  rebuildFretboard();
  buildTuningRows();
  detectAndSetPresetFromCurrent();
  updateTuningSummary();
}

function detectAndSetPresetFromCurrent(){
  const sel = document.getElementById('tuningPresetSelect'); if(!sel) return;
  const cur = getStringTuning();
  const key = currentPresetKey(cur);
  // Enable or disable CUSTOM based on match
  const customOpt = [...sel.options].find(o=>o.value==='CUSTOM');
  if (customOpt) {
    if (key === 'CUSTOM') {
      customOpt.disabled = false;
      customOpt.textContent = 'Custom (' + cur.slice().reverse().join(' ') + ')';
    } else {
      customOpt.disabled = true;
      customOpt.textContent = 'Custom…';
    }
  }
  sel.value = key;
}

function updateTuningSummary(){
  const el = document.getElementById('tuningSummary'); if(!el) return;
  el.textContent = 'Current: ' + getStringTuning().join(' ');
  // Show lowest->highest for user clarity
  const ordered = getStringTuning().slice().reverse().join(' ');
  el.textContent = 'Current: ' + ordered;
}

function bindTuningPanel(){
  const presetSelect = document.getElementById('tuningPresetSelect');
  if (presetSelect){
    presetSelect.addEventListener('change', e=>{
      const val = e.target.value;
  if (val === 'CUSTOM') return; // selection of CUSTOM is managed automatically
  applyPreset(val);
    });
  }
  const resetBtn = document.getElementById('resetTuningBtn');
  if (resetBtn){
    resetBtn.addEventListener('click', ()=>{
      applyPreset('STANDARD');
    });
  }
  buildTuningRows();
  detectAndSetPresetFromCurrent();
}

function updateHeader() {
  const el = document.getElementById('fretboardHeader');
  if (!el) return;
  const base = getBaseNote();
  const mode = getHighlightMode();
  let text;
  const simpleMap = {
    NONE: `Note ${base}`,
    BASENOTE: `Note ${base}`,
    PENTATONIC_SCALE: null, // handled below to include relative minor
    MAJOR_SCALE: `${base} Major Scale`,
    NATURAL_MINOR_SCALE: `${base} Natural Minor Scale`,
    HARMONIC_MINOR_SCALE: `${base} Harmonic Minor Scale`,
    MELODIC_MINOR_SCALE: `${base} Melodic Minor Scale`,
    BLUES_SCALE: `${base} Blues Scale`,
    WHOLE_TONE_SCALE: `${base} Whole Tone Scale`,
    DIMINISHED_HALF_WHOLE_SCALE: `${base} Half-Whole Diminished`,
    DIMINISHED_WHOLE_HALF_SCALE: `${base} Whole-Half Diminished`
  };
  if (mode === 'PENTATONIC_SCALE') {
    // Use utility to show both major and relative minor roots
    text = buildPentatonicLabel(base, mode); // e.g. "Pentatonic Scale, C major / A minor"
  } else if (simpleMap[mode]) { text = simpleMap[mode]; }
  else if (mode.endsWith('_CHORD')) {
    // Format chord name from mode constant
    const name = mode.replace(/_CHORD$/, '')
      .replace(/^MAJOR_SEVEN/, 'Maj7')
      .replace(/^DOMINANT_SEVEN/, '7')
      .replace(/^MINOR_SEVEN/, 'm7')
      .replace(/^MINOR_MAJOR_SEVEN/, 'mMaj7')
      .replace(/^HALF_DIMINISHED_SEVEN/, 'm7b5')
      .replace(/^DIMINISHED_SEVEN/, 'dim7')
      .replace(/^MAJOR_NINE/, 'Maj9')
      .replace(/^DOMINANT_NINE/, '9')
      .replace(/^MINOR_NINE/, 'm9')
      .replace(/^MINOR_MAJOR_NINE/, 'mMaj9')
      .replace(/^DOMINANT_ELEVEN/, '11')
      .replace(/^MAJOR_ELEVEN/, 'Maj11')
      .replace(/^MINOR_ELEVEN/, 'm11')
      .replace(/^DOMINANT_THIRTEEN/, '13')
      .replace(/^MAJOR_THIRTEEN/, 'Maj13')
      .replace(/^MINOR_THIRTEEN/, 'm13')
      .replace(/^DOMINANT_SEVEN_SUS4/, '7sus4')
      .replace(/^DOMINANT_FLAT_NINE/, '7b9')
      .replace(/^DOMINANT_SHARP_NINE/, '7#9')
      .replace(/^DOMINANT_FLAT_THIRTEEN/, '7b13')
      .replace(/^DOMINANT_SHARP_ELEVEN/, '7#11')
      .replace(/^ALTERED_DOMINANT/, 'Alt7')
      .replace(/^DOMINANT_SEVEN_SHARP_NINE/, '7#9');
    text = `${base} ${name.replace(/_/g,' ').replace(/MAJOR/g,'Maj').replace(/MINOR/g,'m')}`;
  } else {
    text = base;
  }
  el.textContent = text;
}

function onBaseNoteChanged(e) {
    const { newValue: base } = e.detail;
    const baseNoteDropdown = document.getElementById('baseNoteSelectDropdown');
    if (baseNoteDropdown) baseNoteDropdown.value = base;
    updateIntervalText();
    renderPentatonicLabel();
    applyHighlightColors();
    outlineBaseNoteCircles(base);
    updateHeader();
}

function onHighlightModeChanged() {
    applyHighlightColors();
    renderPentatonicLabel();
    outlineBaseNoteCircles(getBaseNote());
    updateHeader();
}

function updateZoomUI(){
  const el = document.getElementById('zoomLevelDisplay');
  if (el) el.textContent = `Zoom: ${getZoomLevel().toFixed(1)}`;
}

// Consolidated rebuild routine (used for fret count & zoom changes)
function rebuildFretboard() {
  const container = d3.select('#fretboard_container');
  container.select('svg').remove();
  svg = container.append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .classed('ready', true);
  zoomRoot = svg.append('g').attr('id','zoomRoot');
  drawBackground(zoomRoot);
  drawSlider(zoomRoot);
  drawNoteLabels(zoomRoot);
  zoomRoot.on('click', moveSlider);
  applyHighlightColors();
  outlineBaseNoteCircles(getBaseNote());
  if (getNoteNamesVisibility()) { showAllNotes(); } else { hideAllNotes(); }
  if (getIntervalVisibility()) { showIntervalsWithVisual(); } else { hideIntervalsWithVisual(); }
  updateHeader();
}
// Backward compatibility alias
function rebuildAll(){ rebuildFretboard(); }

function changeZoom(delta){
  const current = getZoomLevel();
  const next = +(current + delta).toFixed(1);
  if (next < ZOOM_MIN || next > ZOOM_MAX) return;
  setZoomLevel(next);
  recalcAllNoteCoordinates();
  updateZoomUI();
  rebuildFretboard();
}

function bindZoomButtons(){
  document.getElementById('zoomInBtn')?.addEventListener('click', ()=> changeZoom(ZOOM_STEP));
  document.getElementById('zoomOutBtn')?.addEventListener('click', ()=> changeZoom(-ZOOM_STEP));
  updateZoomUI();
}

window.addEventListener('DOMContentLoaded', () => {
  initializeAllSettings();
  document.addEventListener('fretCountChanged', () => {
    recalcAllNoteCoordinates();
    rebuildFretboard();
  });
  initializeView();
  bindUIEvents();
  bindTuningPanel();
  bindZoomButtons();
  renderPentatonicLabel();
  applyHighlightColors();
  outlineBaseNoteCircles(getBaseNote());
  updateHeader();
  svg.classed('ready', true).classed('init-fade', false);
});