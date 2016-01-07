(function() {
  'use strict';

  function getPlanets() {
      var planets = [{
        label: 'raccoonsofasgard',
        name: 'Raccoons of Asgard',
        icon: 'images/raccoon-icon.png',
        color: '#FCC425',
        additionalWeight: 1/2,
      }, {
        label: 'schizocats',
        name: 'Schizo Cats',
        icon: 'images/schizo-icon.png',
        color: '#4F6A82',
        additionalWeight: 1/4,
      }, {
        label: 'duckinvaders',
        name: 'Duck Invaders',
        icon: 'images/duck-icon.png',
        color: '#4EA33B',
        additionalWeight: 1/10,
      }, {
        label: 'donutfactory',
        name: 'Donut Factory',
        icon: 'images/donut-icon.png',
        color: '#CE141A',
        additionalWeight: 1,
      }];

      planets.forEach(function(planet, index) {
          planet.id = index;
          if (!planet.additionalWeight) {
            planet.additionalWeight = 0;
          }
          var r = Math.round(parseInt(planet.color.substr(1, 2), 16) / 1.10).toString(16);
          var g = Math.round(parseInt(planet.color.substr(3, 2), 16) / 1.10).toString(16);
          var b = Math.round(parseInt(planet.color.substr(5, 2), 16) / 1.10).toString(16);
          if (r.length === 1) { r = '0' + r; }
          if (g.length === 1) { g = '0' + g; }
          if (b.length === 1) { b = '0' + b; }
          planet.secondaryColor = '#' + r + g + b;
      });
      return planets;
  }

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

      planets: getPlanets(),
    };
  }

  window.config = getUpdatedConfig();
  window.ctx = null;
  window.wheel = null;
  window.arrow = null;
  window.world = null;
})();
