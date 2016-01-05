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

  //adapt angularVelocity to tend toward 20
  var targetSpeed = 20;

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

    var velocity = wheel.body.angularVelocity;

    if (Math.abs(velocity) <= 5) {
      return;
    }

    wheel.body.angularVelocity = (velocity > 0 ? targetSpeed : -targetSpeed);
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

    wheel = new Wheel(config.wheel.x, config.wheel.y, config.wheel.radius, segments, 0.25, 7.5);
    wheel.body.angle = 0;
    wheel.body.angularVelocity = 0;
    wheel.initAssets();

    arrow = new Arrow(config.arrow.x, config.arrow.y, config.arrow.w, config.arrow.h, config.arrow.image);
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

  window.onload = function() {
    initSegments();
    initDrawingCanvas();
    initPhysics();
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
      menuSwitches[i].addEventListener('change', onSwitchChange);
    }

    // Wheel Damping
    var wheelDamping = document.getElementById('wheel_damping');
    var wheelDampingLabel = document.getElementById('wheel_damping_label');
    wheelDamping.addEventListener('change', function(e) {
      wheelDampingLabel.innerText = e.target.value;
      wheel.body.angularDamping = parseFloat(e.target.value);
      console.log(wheel.body.angularDamping);
    });

    // Wheel Velocity
    var wheelVelocity = document.getElementById('wheel_velocity');
    var wheelVelocityLabel = document.getElementById('wheel_velocity_label');
    wheelVelocity.addEventListener('change', function(e) {
      wheelVelocityLabel.innerText = e.target.value;
      targetSpeed = parseInt(e.target.value);
    });
  };
})();
