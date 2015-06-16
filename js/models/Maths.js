/////////////////////////////
// math
/////////////////////////////

(function() {
  'use strict';

  /**
   * easing equations from http://gizma.com/easing/
   * t = current time
   * b = start value
   * c = delta value
   * d = duration
   */
  function inCubic(t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
  }

  function outCubic(t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  }

  function inOutCubic(t, b, c, d) {
    t /= d / 2;

    if (t < 1) {
      return c / 2 * t * t * t + b;
    }

    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  function inBack(t, b, c, d, s) {
    s = s || 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  }

  function cubeBezier(p0, c0, c1, p1, t) {
    var p = new Point();
    var nt = (1 - t);

    p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
    p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

    return p;
  }

  window.Maths = {
    ease: {
      inCubic: inCubic,
      outCubic: outCubic,
      inOutCubic: inOutCubic,
      inBack: inBack,
    },

    cubeBezier: cubeBezier,
  };
})();
