/* eslint-disable */

/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-webplossless_webp_lossless-setclasses !*/
!(function (n, e, s) {
  function o(n, e) {
    return typeof n === e;
  }
  function t() {
    var n, e, s, t, i, a, f;
    for (var u in r)
      if (r.hasOwnProperty(u)) {
        if (
          ((n = []),
          (e = r[u]),
          e.name &&
            (n.push(e.name.toLowerCase()),
            e.options && e.options.aliases && e.options.aliases.length))
        )
          for (s = 0; s < e.options.aliases.length; s++)
            n.push(e.options.aliases[s].toLowerCase());
        for (t = o(e.fn, 'function') ? e.fn() : e.fn, i = 0; i < n.length; i++)
          (a = n[i]),
            (f = a.split('.')),
            1 === f.length
              ? (Modernizr[f[0]] = t)
              : (!Modernizr[f[0]] ||
                  Modernizr[f[0]] instanceof Boolean ||
                  (Modernizr[f[0]] = new Boolean(Modernizr[f[0]])),
                (Modernizr[f[0]][f[1]] = t)),
            l.push((t ? '' : 'no-') + f.join('-'));
      }
  }
  function i(n) {
    var e = c.className,
      s = Modernizr._config.classPrefix || '';
    if ((d && (e = e.baseVal), Modernizr._config.enableJSClass)) {
      var o = new RegExp('(^|\\s)' + s + 'no-js(\\s|$)');
      e = e.replace(o, '$1' + s + 'js$2');
    }
    Modernizr._config.enableClasses &&
      ((e += ' ' + s + n.join(' ' + s)),
      d ? (c.className.baseVal = e) : (c.className = e));
  }
  function a(n, e) {
    if ('object' == typeof n) for (var s in n) u(n, s) && a(s, n[s]);
    else {
      n = n.toLowerCase();
      var o = n.split('.'),
        t = Modernizr[o[0]];
      if ((2 == o.length && (t = t[o[1]]), 'undefined' != typeof t))
        return Modernizr;
      (e = 'function' == typeof e ? e() : e),
        1 == o.length
          ? (Modernizr[o[0]] = e)
          : (!Modernizr[o[0]] ||
              Modernizr[o[0]] instanceof Boolean ||
              (Modernizr[o[0]] = new Boolean(Modernizr[o[0]])),
            (Modernizr[o[0]][o[1]] = e)),
        i([(e && 0 != e ? '' : 'no-') + o.join('-')]),
        Modernizr._trigger(n, e);
    }
    return Modernizr;
  }
  var l = [],
    r = [],
    f = {
      _version: '3.6.0',
      _config: {
        classPrefix: '',
        enableClasses: !0,
        enableJSClass: !0,
        usePrefixes: !0,
      },
      _q: [],
      on: function (n, e) {
        var s = this;
        setTimeout(function () {
          e(s[n]);
        }, 0);
      },
      addTest: function (n, e, s) {
        r.push({ name: n, fn: e, options: s });
      },
      addAsyncTest: function (n) {
        r.push({ name: null, fn: n });
      },
    },
    Modernizr = function () {};
  (Modernizr.prototype = f), (Modernizr = new Modernizr());
  var u,
    c = e.documentElement,
    d = 'svg' === c.nodeName.toLowerCase();
  !(function () {
    var n = {}.hasOwnProperty;
    u =
      o(n, 'undefined') || o(n.call, 'undefined')
        ? function (n, e) {
            return e in n && o(n.constructor.prototype[e], 'undefined');
          }
        : function (e, s) {
            return n.call(e, s);
          };
  })(),
    (f._l = {}),
    (f.on = function (n, e) {
      this._l[n] || (this._l[n] = []),
        this._l[n].push(e),
        Modernizr.hasOwnProperty(n) &&
          setTimeout(function () {
            Modernizr._trigger(n, Modernizr[n]);
          }, 0);
    }),
    (f._trigger = function (n, e) {
      if (this._l[n]) {
        var s = this._l[n];
        setTimeout(function () {
          var n, o;
          for (n = 0; n < s.length; n++) (o = s[n])(e);
        }, 0),
          delete this._l[n];
      }
    }),
    Modernizr._q.push(function () {
      f.addTest = a;
    }),
    Modernizr.addAsyncTest(function () {
      var n = new Image();
      (n.onerror = function () {
        a('webplossless', !1, { aliases: ['webp-lossless'] });
      }),
        (n.onload = function () {
          a('webplossless', 1 == n.width, { aliases: ['webp-lossless'] });
        }),
        (n.src =
          'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=');
    }),
    t(),
    i(l),
    delete f.addTest,
    delete f.addAsyncTest;
  for (var p = 0; p < Modernizr._q.length; p++) Modernizr._q[p]();
  n.Modernizr = Modernizr;
})(window, document);
