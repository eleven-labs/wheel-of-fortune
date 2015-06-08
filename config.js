// 'use strict';
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;
// canvas settings
var viewWidth = 768,
  viewHeight = 600,
  viewCenterX = viewWidth * 0.5,
  viewCenterY = viewHeight * 0.5,
  drawingCanvas = document.getElementById('canvas'),
  ctx,
  timeStep = (1 / 60),
  time = 0;

var ppm = 24, // pixels per meter
  physicsWidth = viewWidth / ppm,
  physicsHeight = viewHeight / ppm,
  physicsCenterX = physicsWidth * 0.5,
  physicsCenterY = physicsHeight * 0.5;

var world;

var wheel,
  arrow,
  mouseBody,
  mouseConstraint;

var arrowMaterial,
  pinMaterial,
  contactMaterial;

var wheelSpinning = false,
  wheelStopped = true;

var particles = [];

var statusLabel = document.getElementById('status_label');

var planets = [{
  shortName: 'Asgard',
  name: 'Racoons of Asgard',
  icon: 'rocket.png',
  color: 'yellow',
  id: 0
}, {
  shortName: 'SchizoCats',
  name: 'SchizoCats',
  icon: 'rocket.png',
  color: 'blue',
  id: 1
}, {
  shortName: 'Duck Invaders',
  name: 'Duck Invaders',
  icon: 'rocket.png',
  color: 'green',
  id: 2
}, {
  shortName: 'Donut Factory',
  name: 'Donut Factory',
  icon: 'rocket.png',
  color: 'white',
  id: 3
}];

var segments = [{
  label: 'sirius',
  color: 'blue'
},{
  label: 'zackers',
  color: 'red'
},{
  label: 'eleven',
  color: 'yellow'
}, {
  label: 'angular',
  color: 'green'
}/**/];