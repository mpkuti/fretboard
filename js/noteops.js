// Basic musical note operations separated to break circular dependencies
import { NOTES, INTERVALS } from './constants.js';

export function raiseNote(note){
  const i = NOTES.indexOf(note);
  if (i < 0) throw new Error('Unknown note '+note);
  return NOTES[(i+1) % NOTES.length];
}
export function lowerNote(note){
  const i = NOTES.indexOf(note);
  if (i < 0) throw new Error('Unknown note '+note);
  return NOTES[(i+NOTES.length-1) % NOTES.length];
}
export function getIntervalFromNotes(base, note){
  const bi = NOTES.indexOf(base);
  const ni = NOTES.indexOf(note);
  if (bi < 0 || ni < 0) throw new Error('Unknown note(s)');
  return INTERVALS[(ni - bi + NOTES.length) % NOTES.length];
}
