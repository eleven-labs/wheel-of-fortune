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
  var playerName = null;
  var minVelocity = 10;
  var maxVelocity = 25;

  function getPhysicsCoord(e) {
    var rect = drawingCanvas.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
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
    if (world.hitTest(mouseBody.position, [pushButton.body])[0]) {
      if (wheelSpinning === true) {
        wheel.body.angularVelocity = 0;
        wheelSpinning = false;
        wheelStopped = true;
        wheel.sound.pause();
      }
      statusLabel.innerHTML = '';
      pushButton.press();
    }
    if (world.hitTest(mouseBody.position, [wheel.body])[0]) {
      if (wheelSpinning === true) {
        wheelSpinning = false;
        wheelStopped = true;
        wheel.sound.pause();
      }
      statusLabel.innerHTML = '';
      mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.body, {
        worldPivot: mouseBody.position,
        collideConnected: false
      });

      world.addConstraint(mouseConstraint);
    }
  }

  function checkEndDrag() {
    if (pushButton.states.pressed) {
      var pressForce = pushButton.release();
      wheel.body.angularVelocity = minVelocity + pressForce * (maxVelocity - minVelocity);
    } else if (!mouseConstraint) {
      return;
    }

    world.removeConstraint(mouseConstraint);
    mouseConstraint = null;
    statusLabel.innerHTML = config.wording.tooSlow;

    if (wheelSpinning && !wheelStopped) {
      wheel.sound.pause();
      return;
    }

    var velocity = Math.abs(wheel.body.angularVelocity);
    var direction = Math.sign(wheel.body.angularVelocity);

    if (velocity <= 5) {
      return;
    }
    if (velocity < minVelocity) {
      velocity = minVelocity;
    }
    if (velocity > maxVelocity) {
      velocity = maxVelocity;
    }

    console.log('initial velocity : ' + wheel.body.angularVelocity + ' adapted to ' + velocity * direction);
    wheel.body.angularVelocity = velocity * direction;

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

  function updatePosition() {
    var particlesLength = particles.length;

    for (var i = 0; i < particlesLength; i++) {
      particles[i].update();
    }

    _.remove(particles, function(p) {
      return p.complete;
    });

    world.step(canvas.timeStep * 0.5);

    config = config.getUpdatedConfig();
    canvas = config.canvas;
    physics = config.physics;

    drawingCanvas.width = canvas.viewWidth;
    drawingCanvas.height = canvas.viewHeight;

    arrow.updatePosition(config.arrow.x, config.arrow.y, config.arrow.w, config.arrow.h);
    pushButton.updatePosition(config.pushButton.x, config.pushButton.y, config.pushButton.radius);
    wheel.updatePosition(config.wheel.x, config.wheel.y, config.wheel.radius);
  }

  function handleRotationEnding(currentPlanet) {
    wheelStopped = true;
    wheelSpinning = false;
    wheel.sound.pause();
    wheel.soundFound.play();

    wheel.body.angularVelocity = 0;

    if (!currentPlanet) {
      return;
    }

    spawnPartices();

    statusLabel.innerHTML = resultTemplate({
      planetName: currentPlanet.name,
      playerName: playerName,
    });
    statusLabel.classList.toggle('active');

    var img = _.find(resultPanel.children, {
      id: 'blaze-' + currentPlanet.id
    });
    img.classList.toggle('active');

    resultPanel.classList.toggle('active');
  }

  function update() {
    updatePosition();

    var angularVelocity = wheel.body.angularVelocity;
    var minVelocity = 0.05;

    if (!wheelSpinning || wheelStopped || Math.abs(angularVelocity) >= minVelocity) {
      return;
    }

    var score = wheel.getScore();
    var currentPlanet = wheel.segments[score];

    return handleRotationEnding(currentPlanet);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.viewWidth, canvas.viewHeight);

    wheel.draw();
    arrow.draw();
    pushButton.draw();

    var particlesLength = particles.length;

    for (var i = 0; i < particlesLength; i++) {
      particles[i].draw();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function addPlanetSegment(planet) {
    segments.push(planet);
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

    wheel = new Wheel(config.wheel.x, config.wheel.y, config.wheel.radius, segments);
    wheel.body.angle = 0;
    wheel.body.angularVelocity = 0;
    wheel.initAssets();

    arrow = new Item(config.arrow.x, config.arrow.y, config.arrow.w, config.arrow.h, config.arrow.image);
    pushButton = new CircularButton(config.pushButton.x, config.pushButton.y, config.pushButton.radius, config.pushButton.image, 4);
    mouseBody = new p2.Body();

    world.addBody(mouseBody);
  }

  function getActivePlanets() {
    var items = document.querySelectorAll('.switch input');
    var result = [];
    var l = items.length;

    for (var i = 0; i < l; i++) {
      if (items[i].checked) {
        result.push(planets[i]);
      }
    }

    return result;
  }

  function reloadSegments() {
    initSegments(getActivePlanets());
    wheel.segments = segments;
    wheel.updateSegmentsPosition();
  }

  window.onload = function() {
    initSegments(getActivePlanets());
    initDrawingCanvas();
    initPhysics();
    wheel.updateSegmentsPosition();
    requestAnimationFrame(loop);

    // menu button
    var menuButton = document.getElementById('menu_button');
    var menu = document.getElementById('menu');

    menuButton.addEventListener('click', function() {
      menu.classList.toggle('active');
    });

    //Player Name
    var playerNameInput = document.getElementById('player_name');

    playerNameInput.addEventListener('change', function(e) {
      playerName = e.target.value || null;
    });

    //Reinitialize after displaying result
    resultPanel.addEventListener('click', function() {
      this.classList.remove('active');
      var l = this.children.length;

      for (var i = 0; i < l; i++) {
        this.children[i].classList.remove('active');
      }

      statusLabel.classList.remove('active');
      statusLabel.innerHTML = '';
    });

    // Menu Switches
    var menuSwitches = document.querySelectorAll('.switch input');
    var l = menuSwitches.length;

    for (var i = 0; i < l; i++) {
      menuSwitches[i].addEventListener('change', reloadSegments);
    }

    var ranges = [{
      input: '#wheel_velocity', onchange: function(e) { minVelocity = parseInt(e.target.value); }
    }, {
      input: '.bribe input', onchange: function(e) {
        var planetIndex = e.target.getAttribute('data-planet');
        planets[planetIndex].additionalWeight = parseInt(e.target.value) / 100;
        reloadSegments();
      }
    }];
    ranges.forEach(function(range) {
      var inputs = document.querySelectorAll(range.input);
      Array.prototype.forEach.call(inputs, function(input) {
        var label = input.nextElementSibling;
        input.addEventListener('input', function(e) {
          label.innerText = e.target.value;
        });
        input.addEventListener('change', range.onchange);
      });
    });
  };
})();
