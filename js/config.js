(function() {
  'use strict';

  function darken(hexColor, percent) {
    var darkenedColor = '#';
    for (var i = 1; i <= 5; i += 2) {
      var colorComponent = Math.round(parseInt(hexColor.substr(i, 2), 16) / (1 + percent)).toString(16);
      if (colorComponent.length === 1) {
        colorComponent = '0' + colorComponent;
      }
      darkenedColor += colorComponent;
    }
    return darkenedColor;
  }

  function getPlanets() {
      var planets = [{
        label: 'raccoonsofasgard',
        name: 'Raccoons of Asgard',
        icon: 'images/raccoon-icon.png',
        color: '#FCC425',
      }, {
        label: 'schizocats',
        name: 'Schizo Cats',
        icon: 'images/schizo-icon.png',
        color: '#4F6A82',
      }, {
        label: 'duckinvaders',
        name: 'Duck Invaders',
        icon: 'images/duck-icon.png',
        color: '#4EA33B',
      }, {
        label: 'donutfactory',
        name: 'Donut Factory',
        icon: 'images/donut-icon.png',
        color: '#CE141A',
      }];

      planets.forEach(function(planet, index) {
          planet.id = index;
          planet.additionalWeight = 0;
          planet.secondaryColor = darken(planet.color, 0.30);
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

    var ratio = Math.min(1, physicsWidth / (physicsHeight * 0.8));
    var wheelRadius = (physicsHeight * 0.8) * ratio * 0.4;
    var wheelX = physicsCenterX;
    var wheelY = physicsCenterY * 1.22;

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
        x: wheelX + wheelRadius + 0.65,
        y: wheelY,
        image: 'images/rocket-arrow.png',
      },

      pushButton: {
        x: wheelX + wheelRadius,
        y: wheelY - wheelRadius,
        radius: wheelRadius / 5,
        image: 'images/big-red-button.png',
      },

      sounds: {
        wheelSpin: 'sounds/wheel.mp3',
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
  window.pushButton = null;
  window.world = null;
})();
