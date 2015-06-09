/*jshint unused:false*/

var config = (function() {
  'use strict';

  var viewWidth = 768;
  var viewHeight = 600;
  var ppm = 24; // pixels per meter
  var physicsWidth = viewWidth / ppm;
  var physicsHeight = viewHeight / ppm;

  return {
    // canvas settings
    canvas: {
      viewWidth: viewWidth,
      viewHeight: viewHeight,
      viewCenterX: viewWidth * 0.5,
      viewCenterY: viewHeight * 0.5,
      timeStep: (1 / 60),
    },

    physics: {
      ppm: ppm, // pixels per meter
      physicsWidth: physicsWidth,
      physicsHeight: physicsHeight,
      physicsCenterX: physicsWidth * 0.5,
      physicsCenterY: physicsHeight * 0.5,
    },

    ctx: null,
    wheel: null,
    arrow: null,
    world: null,

    sounds: {
      wheelSpin: 'http://bramp.net/javascript/wheel.mp3',
      wheelFound: 'sounds/result.mp3',
    },

    images: {
      defaultPlanetIcon: 'images/rocket.png',
    },

    wording: {
      tooSlow: 'C\'était mou ! Essaie encore.',
      stopBeforeEnd: 'Tout vient à point à qui sait attendre.',
      result: 'Bienvenue chez les <br/> <%= planetName %>!!!',
    },

    planets: [{
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
    }],
  };
})();
