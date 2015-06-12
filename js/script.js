(function() {
  'use strict';

  var planets = config.planets;
  var canvas = config.canvas;
  var physics = config.physics;
  var resultTemplate = _.template(config.wording.result);

  var drawingCanvas = document.getElementById('canvas');
  var statusLabel = document.getElementById('status_label');
  var resultPanel = document.getElementById('result_panel');

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
    if (world.hitTest(mouseBody.position, [wheel.body])[0]) {
      if (wheelSpinning === true) {
        wheelSpinning = false;
        wheelStopped = true;
        statusLabel.innerHTML = config.wording.stopBeforeEnd;
        wheel.sound.pause();
      }
      statusLabel.className = '';
      mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.body, {
        worldPivot: mouseBody.position,
        collideConnected: false
      });

      world.addConstraint(mouseConstraint);
    }
  }

  function checkEndDrag() {
    if (!mouseConstraint) {
      return;
    }

    world.removeConstraint(mouseConstraint);
    mouseConstraint = null;
    statusLabel.innerHTML = config.wording.tooSlow;

    if (wheelSpinning && !wheelStopped) {
      wheel.sound.pause();
      return;
    }

    if (Math.abs(wheel.body.angularVelocity) <= 5) {
      return;
    }

    //adapt angularVelocity to tend toward 16
    var targetSpeed = 16;

    targetSpeed = wheel.body.angularVelocity > 0 ? targetSpeed : -targetSpeed;
    var velocity = wheel.body.angularVelocity;
    var diff = targetSpeed - velocity;
    wheel.body.angularVelocity = velocity + diff / 1.5;
    console.log('initial velocity : ' + velocity + ' adapted to ' + wheel.body.angularVelocity);

    wheelSpinning = true;
    wheelStopped = false;
    statusLabel.innerHTML = '';
    wheel.sound.currentTime = 0;
    wheel.sound.play();
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

    world.step(canvas.timeStep * 0.5);

    config = config.getUpdatedConfig();
    canvas = config.canvas;
    physics = config.physics;

    drawingCanvas.width = canvas.viewWidth;
    drawingCanvas.height = canvas.viewHeight;

    arrow.updatePosition(config.arrow.x, config.arrow.y, config.arrow.w, config.arrow.h);
    wheel.updatePosition(config.wheel.x, config.wheel.y, config.wheel.radius);

    if (!wheelSpinning || wheelStopped || Math.abs(wheel.body.angularVelocity) >= 0.05) {
      return;
    }

    wheelStopped = true;
    wheelSpinning = false;
    wheel.sound.pause();
    wheel.soundFound.play();

    wheel.body.angularVelocity = 0;
    var win = wheel.segments[wheel.getScore()];

    if (win) {
      spawnPartices();
      statusLabel.innerHTML = resultTemplate({
        planetName: win.name
      });
      statusLabel.classList.toggle('active');

      var img = _.find(resultPanel.children, {
        id: 'blaze-' + win.id
      });
      img.classList.toggle('active');
      resultPanel.classList.toggle('active');
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.viewWidth, canvas.viewHeight);

    wheel.draw();
    arrow.draw();

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
      name: planet.name,
      color: planet.color,
      id: planet.id,
      icon: planet.icon,
    });
  }

  function initSegments(activePlanets) {
    segments = [];

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
    ctx = drawingCanvas.getContext('2d');

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
    world = new p2.World();
    world.solver.iterations = 100;
    world.solver.tolerance = 0;

    wheel = new Wheel(config.wheel.x, config.wheel.y, config.wheel.radius, segments, 0.25, 7.5);
    wheel.body.angle = 0;
    wheel.body.angularVelocity = 0;
    wheel.initAssets();

    arrow = new Arrow(config.arrow.x, config.arrow.y, config.arrow.w, config.arrow.h);
    mouseBody = new p2.Body();

    world.addBody(mouseBody);
  }

  function getActivePlanets() {
    var items = document.querySelectorAll('.switch input');
    var result = [];

    for (var i = 0; i < items.length; i++) {
      if (items[i].checked) {
        result.push(planets[i]);
      }
    }

    return result;
  }

  function onSwitchChange(e) {
    // debugger;
    if (e.target.checked) {
      initSegments(getActivePlanets());
      wheel.segments = segments;
    } else {
      var planet = parseInt(e.target.getAttribute('data-planet'));
      _.remove(wheel.segments, function(currentObject) {
        return currentObject.id === planet;
      });
    }

    wheel.deltaPI = Math.PI * 2 / wheel.segments.length;
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

    for (var j = 0; j < items.length; j++) {
      items[j].setAttribute("data-planet", j);
      items[j].addEventListener('change', onSwitchChange);
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

    resultPanel.addEventListener('click', function() {
      this.classList.remove('active');

      for (var i = 0; i < this.children.length; i++) {
        this.children[i].classList.remove('active');
      }

      statusLabel.classList.remove('active');
    });
  };
})();
