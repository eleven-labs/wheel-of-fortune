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
        image: 'images/rocket-arrow.png',
      },

      sounds: {
        wheelSpin: 'http://bramp.net/javascript/wheel.mp3',
        wheelFound: 'sounds/result.mp3',
      },

      images: {
        defaultPlanetIcon: 'images/rocket.png',
      },

      wording: {
        tooSlow: 'Harder. Better. Faster. Stronger ?',
        result: 'You\'re an official member of Planet <br/><span><%= planetName %> !</span><br/>Welcome Home <%= playerName ? playerName + " " : "" %>!',
      },

      planets: [{
        label: 'raccoonsofasgard',
        name: 'Raccoons of Asgard',
        icon: 'images/raccoon-icon.png',
        color: '#FCC425',
        id: 0
      }, {
        label: 'schizocats',
        name: 'Schizo Cats',
        icon: 'images/schizo-icon.png',
        color: '#4F6A82',
        id: 1
      }, {
        label: 'duckinvaders',
        name: 'Duck Invaders',
        icon: 'images/duck-icon.png',
        color: '#4EA33B',
        id: 2
      }, {
        label: 'donutfactory',
        name: 'Donut Factory',
        icon: 'images/donut-icon.png',
        color: '#CE141A',
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
