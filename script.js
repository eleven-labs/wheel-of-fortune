window.onload = function() {
  initSegments();
  initDrawingCanvas();
  initPhysics();
  initNavigation();
  requestAnimationFrame(loop);

  var menuButton = document.getElementById("menu_button");

  menuButton.addEventListener('click', function(evt) {
    document.getElementById('menu').classList.toggle('active');
  });
};

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

  for (var i = 0; i < planets.length; i++) {
    var div = document.createElement('div');
    div.innerHTML = menuItem;
    var elements = div.firstChild;
    collection[0].appendChild(elements);
  }
  var items = document.querySelectorAll('.collection-item');
  for (var i = 0; i < items.length; i++) {
    items[i].textContent = planets[i].name;
    var div = document.createElement('div');
    div.innerHTML = lever;
    var elements = div.firstChild;
    items[i].appendChild(elements);
  }
  items = document.querySelectorAll('.switch input');
  for (var i = 0; i < items.length; i++) {
    items[i].setAttribute("data-planet", i);
    items[i].addEventListener('change', function(e) {
      // debugger;
      if (e.target.checked) {
        initSegments(getActivePlanets());
        wheel.segments = segments;
      } else {
        var planet = e.target.getAttribute('data-planet');
        _.remove(wheel.segments, function(currentObject) {
          return currentObject.id == planet;
        });
      }
      wheel.deltaPI = TWO_PI / wheel.segments.length;
    });
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
}

function initSegments(activePlanets) {
  segments = [];
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < planets.length; j++) {
      if (activePlanets) {
        if (activePlanets.indexOf(j) != -1) {
          var planet = planets[j];
          segments.push({
            label: planet.shortName,
            color: planet.color,
            id: planet.id
          });
        }

      } else {
        var planet = planets[j];
        segments.push({
          label: planet.shortName,
          color: planet.color,
          id: planet.id
        })
      }

    }
  }
}

function initPhysics() {
  world = new p2.World();
  world.solver.iterations = 100;
  world.solver.tolerance = 0;

  var wheelRadius = 8,
    wheelX = physicsCenterX,
    wheelY = wheelRadius + 4,
    arrowX = wheelX + wheelRadius + 1.3,
    arrowY = wheelY;

  wheel = new Wheel(wheelX, wheelY, wheelRadius, segments, 0.25, 7.5);
  wheel.body.angle = 0;
  wheel.body.angularVelocity = 0;
  wheel.initAssets();
  arrow = new Arrow(arrowX, arrowY, 1.5, 0.5);
  mouseBody = new p2.Body();

  world.addBody(mouseBody);
}

function initDrawingCanvas() {
  drawingCanvas.width = viewWidth;
  drawingCanvas.height = viewHeight;
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

function updateMouseBodyPosition(e) {
  var p = getPhysicsCoord(e);
  mouseBody.position[0] = p.x;
  mouseBody.position[1] = p.y;
}

function checkStartDrag(e) {
  if (world.hitTest(mouseBody.position, [wheel.body])[0]) {
    statusLabel.className = '';
    mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.body, {
      worldPivot: mouseBody.position,
      collideConnected: false
    });

    world.addConstraint(mouseConstraint);
  }

  if (wheelSpinning === true) {
    wheelSpinning = false;
    wheelStopped = true;
    statusLabel.innerHTML = "Tout vient &agrave; point &agrave; qui sait attendre.";
    wheel.sound.pause();
  }
}

function checkEndDrag(e) {
  
  if (mouseConstraint) {
    world.removeConstraint(mouseConstraint);
    mouseConstraint = null;

    if (wheelSpinning === false && wheelStopped === true) {

      if (Math.abs(wheel.body.angularVelocity) > 5) {

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
      } else {
        statusLabel.innerHTML = 'C\'&eacute;tait mou ! Essaie encore.'
        wheel.sound.pause();
      }
    }
  }
}

function getPhysicsCoord(e) {
  var rect = drawingCanvas.getBoundingClientRect(),
    clientX = e.clientX || e.touches[0].clientX,
    clientY = e.clientY || e.touches[0].clientY,
    x = (clientX - rect.left) / ppm,
    y = physicsHeight - (clientY - rect.top) / ppm;

  return {
    x: x,
    y: y
  };
}

function spawnPartices() {
  for (var i = 0; i < 200; i++) {
    var p0 = new Point(viewCenterX, viewCenterY - 64);
    var p1 = new Point(viewCenterX, 0);
    var p2 = new Point(Math.random() * viewWidth, Math.random() * viewCenterY);
    var p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

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

  world.step(timeStep * 0.5);

  if (wheelSpinning === true && wheelStopped === false && Math.abs(wheel.body.angularVelocity) < 0.05) {

    wheelStopped = true;
    wheelSpinning = false;
    wheel.sound.pause();
    wheel.soundFound.play();

    wheel.body.angularVelocity = 0;
    var win = wheel.segments[wheel.getScore()];

    if (win) {
      spawnPartices();
      statusLabel.innerHTML = 'Bienvenue chez les <br />'+win.label+' !!!';
      statusLabel.classList.toggle('active');
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, viewWidth, viewHeight);

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