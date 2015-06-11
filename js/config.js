/*jshint unused:false*/

var ctx = null;
var wheel = null;
var arrow = null;
var world = null;

var config = (function() {
  'use strict';

  function getUpdatedConfig() {
    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;

    var ppm = 24; // pixels per meter
    var physicsWidth = viewWidth / ppm;
    var physicsHeight = viewHeight / ppm;
    var physicsCenterX = physicsWidth * 0.5;
    var physicsCenterY = physicsHeight * 0.5;

    var wheelRadius = 8;
    var wheelX = physicsCenterX;
    var wheelY = wheelRadius + 4;

    return {
      getUpdatedConfig: getUpdatedConfig,

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
        physicsCenterX: physicsCenterX,
        physicsCenterY: physicsCenterY,
      },

      wheel: {
        radius: wheelRadius,
        x: wheelX,
        y: wheelY,
      },

      arrow: {
        x: wheelX + wheelRadius + 1.3,
        y: wheelY,
      },

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
  }

  return getUpdatedConfig();
})();
