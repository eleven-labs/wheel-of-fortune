(function() {
  'use strict';

  function getUpdatedConfig() {
    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;

    var ppm = 24; // pixels per meter
    var physicsWidth = viewWidth / ppm;
    var physicsHeight = viewHeight / ppm;
    var physicsCenterX = physicsWidth * 0.5;
    var physicsCenterY = physicsHeight * 0.5;

    var wheelRadius = (physicsWidth < physicsHeight * 0.8 ? physicsWidth : physicsHeight * 0.8) * 0.4;
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
        timeStep: (1 / 30),
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
        w: wheelRadius * 0.1875,
        h: wheelRadius * 0.0625,
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
        name: 'Raccoons of Asgard',
        icon: 'images/raccoon-icon.png',
        color: '#FECB00',
        id: 0
      }, {
        shortName: 'Schizo Cats',
        name: 'Schizo Cats',
        icon: 'images/schizo-icon.png',
        color: '#014991',
        id: 1
      }, {
        shortName: 'Duck Invaders',
        name: 'Duck Invaders',
        icon: 'images/duck-icon.png',
        color: '#46CD4D',
        id: 2
      }, {
        shortName: 'Donut Factory',
        name: 'Donut Factory',
        icon: 'images/donut-icon.png',
        color: '#D50B01',
        id: 3
      }],
    };
  }

  window.config = getUpdatedConfig();
  window.ctx = null;
  window.wheel = null;
  window.arrow = null;
  window.world = null;
})();
