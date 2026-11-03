// Practica del capítulo 4.
(function (raiz) {
  "use strict";
  var P = raiz.Practica, azar = P.azar, elige = P.elige, fr = P.fr;

  function campo(et, v) { return { et: et, v: v, modo: "real" }; }
  function fac(k) { return k === 1 ? "" : k === -1 ? "-" : String(k); }
  // Factor (x-p), o x si p=0.
  function xm(p) { return p === 0 ? "x" : "(x" + (p < 0 ? "+" + (-p) : "-" + p) + ")"; }
  function dos() {
    var p = azar(-3, 2), q = p + azar(1, 3);
    return [p, q];
  }
  // Resultado: dónde cambia el signo de f' y hacia dónde.
  function extremos(raices, k) {
    // raices: [{x, par}], ordenadas; k: signo de f' a la derecha de todas.
    var maxi = Infinity, mini = Infinity, s = k > 0 ? 1 : -1;
    for (var i = raices.length - 1; i >= 0; i--) {
      if (raices[i].par) continue;
      if (s > 0) mini = raices[i].x; else maxi = raices[i].x;
      s = -s;
    }
    return { maxi: maxi, mini: mini };
  }
  function textoExt(e) {
    var t = [];
    if (e.maxi !== Infinity) t.push("máximo local en $x=" + e.maxi + "$");
    if (e.mini !== Infinity) t.push("mínimo local en $x=" + e.mini + "$");
    return t.length ? t.join(" y ") : "ningún extremo local";
  }
  var ENUN = "Hallar dónde tiene $f$ un máximo local y un mínimo local. Si no tiene alguno de ellos, escribe <code>no</code>.";
  function campos(e) { return [P.campoONo("x_{\\max}", e.maxi), P.campoONo("x_{\\min}", e.mini)]; }
  function pista(e) {
    return function (vals) {
      if (e.maxi !== Infinity && e.mini !== Infinity && vals[0] === e.mini && vals[1] === e.maxi) return "Están cambiados: si $f'$ pasa de positiva a negativa, hay un máximo.";
      return null;
    };
  }

  // Se da f': un factor positivo no cuenta y una raíz doble no cambia el signo.
  function genDesdeDerivada() {
    var k = elige([-3, -2, -1, 1, 2, 3]), r = dos(), caso = azar(0, 2), pos = elige(["", "e^{x}", "e^{-x}", "(x^2+1)"]);
    var raices, ft, fun, nota;
    if (caso === 0) {
      raices = [{ x: r[0] }, { x: r[1] }];
      ft = xm(r[0]) + xm(r[1]);
      fun = function (x) { return k * (x - r[0]) * (x - r[1]); };
    } else if (caso === 1) {
      var doble = Math.random() < 0.5;
      raices = [{ x: r[0], par: doble }, { x: r[1], par: !doble }];
      ft = (doble ? xm(r[0]) + "^2" + xm(r[1]) : xm(r[0]) + xm(r[1]) + "^2");
      fun = doble ? function (x) { return k * Math.pow(x - r[0], 2) * (x - r[1]); } :
        function (x) { return k * (x - r[0]) * Math.pow(x - r[1], 2); };
    } else {
      raices = [{ x: r[0] }];
      ft = xm(r[0]);
      fun = function (x) { return k * (x - r[0]); };
    }
    var e = extremos(raices, k);
    nota = pos ? "El factor $" + pos + "$ es siempre positivo, así que el signo de $f'$ es el de $" + fac(k) + ft + "$. " : "";
    var dobles = raices.filter(function (a) { return a.par; });
    return {
      d: { fp: fun, r: raices, e: e, maxi: e.maxi, mini: e.mini },
      enun: "Una función $f$ tiene derivada $f'(x)=" + fac(k) + ft + pos + "$. " + ENUN,
      campos: campos(e), pista: pista(e),
      sol: nota + (dobles.length ? "En $x=" + dobles[0].x + "$ la raíz es doble y $f'$ no cambia de signo: no hay extremo. " : "") +
        "Por el signo de $f'$ a cada lado de sus raíces, $f$ tiene " + textoExt(e) + "."
    };
  }

  // Se da f: primero hay que derivar.
  function genDesdeFuncion() {
    var s = elige([-1, 1]), r = dos(), p = r[0], q = r[1], c = P.azar(-3, 3);
    var a2 = -3 * (p + q) * s, a1 = 6 * p * q * s, a3 = 2 * s;
    function t(k, x) {
      if (k === 0) return "";
      var abs = Math.abs(k);
      return (k < 0 ? "-" : "+") + (abs === 1 && x ? "" : abs) + x;
    }
    var ft = (t(a3, "x^3") + t(a2, "x^2") + t(a1, "x") + t(c, "")).replace(/^\+/, "");
    var e = extremos([{ x: p }, { x: q }], s);
    return {
      d: {
        f: function (x) { return a3 * x * x * x + a2 * x * x + a1 * x + c; },
        fp: function (x) { return 6 * s * (x - p) * (x - q); },
        r: [{ x: p }, { x: q }], e: e, maxi: e.maxi, mini: e.mini
      },
      enun: "Sea $f(x)=" + ft + "$. " + ENUN,
      campos: campos(e), pista: pista(e),
      sol: "Derivando, $f'(x)=" + fac(6 * s) + xm(p) + xm(q) + "$. Por el signo de $f'$ a cada lado de sus raíces, $f$ tiene " + textoExt(e) + "."
    };
  }

  function kx(k) { return (k === 1 ? "" : k === -1 ? "-" : k) + "x"; }
  function masKx(k) { return (k < 0 ? "-" : "+") + (Math.abs(k) === 1 ? "" : Math.abs(k)) + "x"; }

  // Polinomio de Maclaurin de grado 2: c0=f(0), c1=f'(0), c2=f''(0)/2 (como fracción n/d).
  function genMaclaurin() {
    var caso = azar(0, 6), k = elige([-3, -2, -1, 2, 3]), A = elige([1, 1, 2, 3]);
    var k2 = k * k, f, ft, d1, d2, c0, c1, n2, de2 = 2;
    if (caso === 0) {
      ft = fac(A) + "e^{" + kx(k) + "}";
      f = function (x) { return A * Math.exp(k * x); };
      d1 = fac(A * k) + "e^{" + kx(k) + "}"; d2 = fac(A * k2) + "e^{" + kx(k) + "}";
      c0 = A; c1 = A * k; n2 = A * k2;
    } else if (caso === 1) {
      ft = fac(A) + "\\cos(" + kx(k) + ")";
      f = function (x) { return A * Math.cos(k * x); };
      d1 = fac(-A * k) + "\\sin(" + kx(k) + ")"; d2 = fac(-A * k2) + "\\cos(" + kx(k) + ")";
      c0 = A; c1 = 0; n2 = -A * k2;
    } else if (caso === 2) {
      ft = fac(A) + "\\sin(" + kx(k) + ")";
      f = function (x) { return A * Math.sin(k * x); };
      d1 = fac(A * k) + "\\cos(" + kx(k) + ")"; d2 = fac(-A * k2) + "\\sin(" + kx(k) + ")";
      c0 = 0; c1 = A * k; n2 = 0;
    } else if (caso === 3) {
      ft = "\\ln(1" + masKx(k) + ")";
      f = function (x) { return Math.log(1 + k * x); };
      d1 = (k < 0 ? "-" : "") + "\\dfrac{" + Math.abs(k) + "}{1" + masKx(k) + "}"; d2 = "-\\dfrac{" + k2 + "}{(1" + masKx(k) + ")^2}";
      c0 = 0; c1 = k; n2 = -k2;
    } else if (caso === 4) {
      ft = "\\dfrac{1}{1" + masKx(-k) + "}";
      f = function (x) { return 1 / (1 - k * x); };
      d1 = (k < 0 ? "-" : "") + "\\dfrac{" + Math.abs(k) + "}{(1" + masKx(-k) + ")^2}"; d2 = "\\dfrac{" + 2 * k2 + "}{(1" + masKx(-k) + ")^3}";
      c0 = 1; c1 = k; n2 = 2 * k2;
    } else if (caso === 5) {
      ft = "\\sqrt{1" + masKx(2 * k) + "}";
      f = function (x) { return Math.sqrt(1 + 2 * k * x); };
      d1 = (k < 0 ? "-" : "") + "\\dfrac{" + Math.abs(k) + "}{\\sqrt{1" + masKx(2 * k) + "}}"; d2 = "-\\dfrac{" + k2 + "}{(1" + masKx(2 * k) + ")^{3/2}}";
      c0 = 1; c1 = k; n2 = -k2;
    } else {
      ft = "x\\,e^{" + kx(k) + "}";
      f = function (x) { return x * Math.exp(k * x); };
      d1 = "(1" + masKx(k) + ")e^{" + kx(k) + "}"; d2 = "(" + 2 * k + masKx(k2) + ")e^{" + kx(k) + "}";
      c0 = 0; c1 = 1; n2 = 2 * k;
    }
    var c2 = n2 / de2;
    return {
      d: { f: f, c0: c0, c1: c1, c2: c2 },
      enun: "Hallar el polinomio de Maclaurin de grado 2 de $f(x)=" + ft + "$, escrito como $P_2(x)=c_0+c_1x+c_2x^2$.",
      campos: [campo("c_0", c0), campo("c_1", c1), campo("c_2", c2)],
      pista: function (vals) {
        if (n2 !== 0 && Math.abs(vals[2] - n2) < 0.006) return "Recuerda que $c_2=\\dfrac{f''(0)}{2!}$.";
        return null;
      },
      sol: "Con $f'(x)=" + d1 + "$ y $f''(x)=" + d2 + "$, se tiene $f(0)=" + c0 + "$, $f'(0)=" + c1 + "$ y $f''(0)=" + n2 +
        "$. Por tanto, $c_0=" + c0 + "$, $c_1=" + c1 + "$ y $c_2=\\dfrac{f''(0)}{2!}=" + fr(n2, de2) + "$."
    };
  }

  var GENERADORES = {
    "practica-extremos": [genDesdeDerivada, genDesdeFuncion],
    "practica-maclaurin": [genMaclaurin]
  };
  raiz.EstudioLocalLogica = { GENERADORES: GENERADORES };
  if (typeof document === "undefined") return;
  P.arranca(GENERADORES, {}, function () {
    return "Se admiten fracciones como " + P.tex("3/2") + " (<code>3/2</code>) y decimales como <code>1,5</code>.";
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
