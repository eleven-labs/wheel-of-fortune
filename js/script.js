(function() {
  'use strict';

  var planets = config.planets;
  var canvas = config.canvas;
  var physics = config.physics;
  var resultTemplate = _.template(config.wording.result);

  var drawingCanvas = document.getElementById('canvas');
  var statusLabel = document.getElementById('status_label');

  var particles = [];
  var segments = [];
  var wheelSpinning = false;
  var wheelStopped = true;
  var mouseBody = null;
  var mouseConstraint = null;

  function getPhysicsCoord(e) {
    var rect = drawingCanvas.getBoundingClientRect();
    var clientX = e.clientX || e.touches[0].clientX;
    var clientY = e.clientY || e.touches[0].clientY;
    var x = (clientX - rect.left) / physics.ppm;
    var y = physics.physicsHeight - (clientY - rect.top) / physics.ppm;
    return {
      x: x,
      y: y
    };
  }

  function updateMouseBodyPosition(e) {
    var p = getPhysicsCoord(e);
    mouseBody.position[0] = p.x;
    mouseBody.position[1] = p.y;
  }

  function checkStartDrag() {
    if (config.world.hitTest(mouseBody.position, [config.wheel.body])[0]) {
      statusLabel.className = '';
      mouseConstraint = new p2.RevoluteConstraint(mouseBody, config.wheel.body, {
        worldPivot: mouseBody.position,
        collideConnected: false
      });

      config.world.addConstraint(mouseConstraint);
    }

    if (wheelSpinning === true) {
      wheelSpinning = false;
      wheelStopped = true;
      statusLabel.innerHTML = config.wording.stopBeforeEnd;
      config.wheel.sound.pause();
    }
  }

  function checkEndDrag() {
    if (!mouseConstraint) {
      return;
    }

    config.world.removeConstraint(mouseConstraint);
    mouseConstraint = null;
    statusLabel.innerHTML = config.wording.tooSlow;

    if (wheelSpinning && !wheelStopped) {
      config.wheel.sound.pause();
      return;
    }

    if (Math.abs(config.wheel.body.angularVelocity) <= 5) {
      return;
    }

    //adapt angularVelocity to tend toward 16
    var targetSpeed = 16;

    targetSpeed = config.wheel.body.angularVelocity > 0 ? targetSpeed : -targetSpeed;
    var velocity = config.wheel.body.angularVelocity;
    var diff = targetSpeed - velocity;
    config.wheel.body.angularVelocity = velocity + diff / 1.5;
    console.log('initial velocity : ' + velocity + ' adapted to ' + config.wheel.body.angularVelocity);

    wheelSpinning = true;
    wheelStopped = false;
    statusLabel.innerHTML = '';
    config.wheel.sound.currentTime = 0;
    config.wheel.sound.play();
  }

  function spawnPartices() {
    for (var i = 0; i < 200; i++) {
      var p0 = new Point(canvas.viewCenterX, canvas.viewCenterY - 64);
      var p1 = new Point(canvas.viewCenterX, 0);
      var p2 = new Point(Math.random() * canvas.viewWidth, Math.random() * canvas.viewCenterY);
      var p3 = new Point(Math.random() * canvas.viewWidth, canvas.viewHeight + 64);

      particles.push(new Particle(p0, p1, p2, p3));
    }
  }

  function update() {
    particles.forEach(function(p) {
      p.update();
      if (p.complete) {
        particles.splice(particles.indexOf(p), 1);
      }
    });

    config.world.step(canvas.timeStep * 0.5);

    if (!wheelSpinning || wheelStopped || Math.abs(config.wheel.body.angularVelocity) >= 0.05) {
      return;
    }

    wheelStopped = true;
    wheelSpinning = false;
    config.wheel.sound.pause();
    config.wheel.soundFound.play();

    config.wheel.body.angularVelocity = 0;
    var win = config.wheel.segments[config.wheel.getScore()];

    if (win) {
      spawnPartices();
      statusLabel.innerHTML = resultTemplate({ planetName: win.label });
      statusLabel.classList.toggle('active');
    }
  }

  function draw() {
    config.ctx.clearRect(0, 0, canvas.viewWidth, canvas.viewHeight);

    config.wheel.draw();
    config.arrow.draw();

    particles.forEach(function(p) {
      p.draw();
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function addPlanetSegment(planet) {
    segments.push({
      label: planet.shortName,
      color: planet.color,
      id: planet.id
    });
  }

  function initSegments(activePlanets) {
    if (!activePlanets) {
      activePlanets = planets;
    }

    for (var i = 0; i < 3; i++) {
      activePlanets.forEach(addPlanetSegment);
    }
  }

  function initDrawingCanvas() {
    drawingCanvas.width = canvas.viewWidth;
    drawingCanvas.height = canvas.viewHeight;
    config.ctx = drawingCanvas.getContext('2d');

    drawingCanvas.addEventListener('mousemove', updateMouseBodyPosition);
    drawingCanvas.addEventListener('mousedown', checkStartDrag);
    drawingCanvas.addEventListener('mouseup', checkEndDrag);
    drawingCanvas.addEventListener('mouseout', checkEndDrag);

    drawingCanvas.addEventListener('touchmove', updateMouseBodyPosition);
    drawingCanvas.addEventListener('touchstart', checkStartDrag);
    drawingCanvas.addEventListener('touchend', checkEndDrag);
    drawingCanvas.addEventListener('touchleave', checkEndDrag);
  }

  function initPhysics() {
    config.world = new p2.World();
    config.world.solver.iterations = 100;
    config.world.solver.tolerance = 0;

    var wheelRadius = 8;
    var wheelX = physics.physicsCenterX;
    var wheelY = wheelRadius + 4;
    var arrowX = wheelX + wheelRadius + 1.3;
    var arrowY = wheelY;

    config.wheel = new Wheel(wheelX, wheelY, wheelRadius, segments, 0.25, 7.5);
    config.wheel.body.angle = 0;
    config.wheel.body.angularVelocity = 0;
    config.wheel.initAssets();
    config.arrow = new Arrow(arrowX, arrowY, 1.5, 0.5);
    mouseBody = new p2.Body();

    config.world.addBody(mouseBody);
  }

  function getActivePlanets() {
    var items = document.querySelectorAll('.switch input');
    var result = [];

    for (var i = 0; i < items.length; i++) {
      if (items[i].checked) {
        result.push(planets[i].id);
      }
    }

    return result;
  }

  function onSwitchChange(e) {
    // debugger;
    if (e.target.checked) {
      initSegments(getActivePlanets());
      config.wheel.segments = segments;
    } else {
      var planet = e.target.getAttribute('data-planet');
      _.remove(config.wheel.segments, function(currentObject) {
        return currentObject.id === planet;
      });
    }

    config.wheel.deltaPI = Math.PI * 2 / config.wheel.segments.length;
  }

  function initNavigation() {
    var lever = '<div class="switch">' +
      '<label>' +
      'Off' +
      '<input type="checkbox" checked>' +
      '<span class="lever"></span>' +
      'On' +
      '</label>' +
      '</div>';

    var menuItem = '<a href="#!" class="collection-item"></a>';
    var collection = document.querySelectorAll('div.collection');

    planets.forEach(function() {
      var div = document.createElement('div');
      div.innerHTML = menuItem;
      collection[0].appendChild(div.firstChild);
    });

    var items = document.querySelectorAll('.collection-item');
    var leverDiv = null;

    for (var i = 0; i < items.length; i++) {
      items[i].textContent = planets[i].name;
      leverDiv = document.createElement('div');
      leverDiv.innerHTML = lever;
      items[i].appendChild(leverDiv.firstChild);
    }

    items = document.querySelectorAll('.switch input');

    for (var k = 0; k < items.length; k++) {
      items[k].setAttribute("data-planet", i);
      items[k].addEventListener('change', onSwitchChange);
    }
  }

  window.onload = function() {
    initSegments();
    initDrawingCanvas();
    initPhysics();
    initNavigation();
    requestAnimationFrame(loop);

    var menuButton = document.getElementById('menu_button');

    menuButton.addEventListener('click', function() {
      document.getElementById('menu').classList.toggle('active');
    });
  };
})();
