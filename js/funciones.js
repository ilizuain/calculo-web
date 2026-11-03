// Practica del capítulo 3.
(function (raiz) {
  "use strict";
  var P = raiz.Practica, azar = P.azar, elige = P.elige, noCero = P.noCero, fr = P.fr;

  function campo(et, v) { return { et: et, v: v, modo: "real" }; }
  // Sumando con su signo: mas(3,"x") da "+3x"; mas(-1,"x") da "-x"; mas(0,"x") da "".
  function mas(k, t) {
    if (k === 0) return "";
    var a = Math.abs(k);
    return (k < 0 ? "-" : "+") + (a === 1 && t ? "" : a) + t;
  }
  function primero(s) { return s.charAt(0) === "+" ? s.slice(1) : (s || "0"); }
  // Delante de una función: 1 no se escribe y -1 es solo el signo.
  function fac(k) { return k === 1 ? "" : k === -1 ? "-" : String(k); }

  // Recta y=mx+n, con m=mp/mq y n=np/nq.
  function genTangente() {
    var k = elige([1, 2, 3]), caso = elige([0, 0, 0, 1, 1, 2, 2, 3, 4]), a, tf, m, n, mt, nt, f, fa, dt;
    if (caso === 0) {
      var c2 = noCero(-2, 2), c1 = azar(-4, 4), c0 = azar(-4, 4);
      a = noCero(-2, 2);
      tf = primero(mas(c2, "x^2") + mas(c1, "x") + mas(c0, ""));
      f = function (x) { return c2 * x * x + c1 * x + c0; };
      m = 2 * c2 * a + c1; fa = f(a); n = fa - m * a;
      mt = String(m); nt = String(n); dt = primero(mas(2 * c2, "x") + mas(c1, ""));
    } else if (caso === 1) {
      a = elige([-2, -1, 1, 2]);
      var kk = 2 * k;
      tf = "\\dfrac{" + kk + "}{x}";
      f = function (x) { return kk / x; };
      fa = kk / a; m = -kk / (a * a); n = fa - m * a;
      mt = fr(-kk, a * a); nt = fr(2 * kk, a); dt = "-\\dfrac{" + kk + "}{x^2}";
    } else if (caso === 2) {
      var raiz2 = elige([1, 2, 3]);
      a = raiz2 * raiz2;
      tf = fac(k) + "\\sqrt{x}";
      f = function (x) { return k * Math.sqrt(x); };
      fa = k * raiz2; m = k / (2 * raiz2); n = fa - m * a;
      mt = fr(k, 2 * raiz2); nt = fr(k * raiz2, 2); dt = k === 2 ? "\\dfrac{1}{\\sqrt{x}}" : "\\dfrac{" + k + "}{2\\sqrt{x}}";
    } else if (caso === 3) {
      a = 0;
      tf = fac(k) + "e^x";
      f = function (x) { return k * Math.exp(x); };
      fa = k; m = k; n = k;
      mt = String(k); nt = String(k); dt = fac(k) + "e^x";
    } else {
      a = 1;
      tf = fac(k) + "\\ln x";
      f = function (x) { return k * Math.log(x); };
      fa = 0; m = k; n = -k;
      mt = String(k); nt = String(-k); dt = "\\dfrac{" + k + "}{x}";
    }
    var fat = String(Math.abs(fa - Math.round(fa)) < 1e-9 ? Math.round(fa) : fa);
    return {
      d: { f: f, a: a, m: m, n: n },
      enun: "Hallar la recta tangente a $y=" + tf + "$ en $x=" + a + "$, escrita como $y=mx+n$.",
      campos: [campo("m", m), campo("n", n)],
      sol: "Se tiene $f'(x)=" + dt + "$, así que $f(" + a + ")=" + fat + "$ y $f'(" + a + ")=" + mt +
        "$. De $y=f(a)+f'(a)(x-a)$ salen $m=" + mt + "$ y $n=f(a)-a\\,f'(a)=" + nt + "$."
    };
  }

  // Valor de la derivada de una compuesta en un punto. d.exterior es la derivada
  // de la función de fuera, sin multiplicar por la de dentro: da la pista.
  function genCadena() {
    var caso = azar(0, 4), f, a, v, vt, tf, ext, sol;
    if (caso === 0) {
      var k = elige([2, 3]);
      a = elige([-1, 1, 2]);
      var b = elige(a === 2 ? [-5, -3, -2, -1] : [-3, -2, 1, 2]);
      var u = a * a + b;
      tf = "\\left(x^2" + (b < 0 ? "" : "+") + b + "\\right)^" + k;
      f = function (x) { return Math.pow(x * x + b, k); };
      ext = k * Math.pow(u, k - 1);
      v = ext * 2 * a; vt = String(v);
      sol = "Fuera, una potencia; dentro, $x^2" + (b < 0 ? "" : "+") + b + "$: $f'(x)=" + k + "\\left(x^2" + (b < 0 ? "" : "+") + b + "\\right)" + (k > 2 ? "^" + (k - 1) : "") + "\\cdot2x$.";
    } else if (caso === 1) {
      var c = elige([1, 2]), d;
      do { d = azar(-3, 3); } while (2 * c + d === 0 || c + d === 0 || Math.abs(c + d) > 2);
      a = 1;
      tf = "e^{" + (c === 1 ? "" : c) + "x^2" + (d === 0 ? "" : (d < 0 ? "-" : "+") + (Math.abs(d) === 1 ? "" : Math.abs(d)) + "x") + "}";
      f = function (x) { return Math.exp(c * x * x + d * x); };
      var ex = c + d, co = 2 * c + d;
      ext = Math.exp(ex);
      v = co * ext;
      vt = (co === 1 ? "" : co === -1 ? "-" : co) + "e^{" + ex + "}";
      sol = "$f'(x)=" + tf + "\\cdot\\left(" + 2 * c + "x" + (d === 0 ? "" : (d < 0 ? "-" : "+") + Math.abs(d)) + "\\right)$.";
    } else if (caso === 2) {
      var b2 = azar(1, 5);
      a = elige([1, 2, 3]);
      tf = "\\ln\\left(x^2+" + b2 + "\\right)";
      f = function (x) { return Math.log(x * x + b2); };
      ext = 1 / (a * a + b2);
      v = 2 * a / (a * a + b2); vt = fr(2 * a, a * a + b2);
      sol = "$f'(x)=\\dfrac{1}{x^2+" + b2 + "}\\cdot2x$.";
    } else if (caso === 3) {
      var t = elige([[3, 16, 5], [4, 9, 5], [3, 7, 4], [1, 3, 2], [2, 5, 3], [1, 8, 3]]);
      a = t[0];
      var b3 = t[1], w = t[2];
      tf = "\\sqrt{x^2+" + b3 + "}";
      f = function (x) { return Math.sqrt(x * x + b3); };
      ext = 1 / (2 * w);
      v = a / w; vt = fr(a, w);
      sol = "$f'(x)=\\dfrac{1}{2\\sqrt{x^2+" + b3 + "}}\\cdot2x=\\dfrac{x}{\\sqrt{x^2+" + b3 + "}}$.";
    } else {
      var q = elige([2, 3, 4]);
      a = 0;
      tf = "e^{\\sin(" + q + "x)}";
      f = function (x) { return Math.exp(Math.sin(q * x)); };
      ext = 1;
      v = q; vt = String(q);
      sol = "$f'(x)=e^{\\sin(" + q + "x)}\\cos(" + q + "x)\\cdot" + q + "$.";
    }
    return {
      d: { f: f, a: a, v: v },
      enun: "Sea $f(x)=" + tf + "$. Calcular $f'(" + a + ")$.",
      campos: [campo("f'(" + a + ")", v)],
      pista: function (vals) {
        if (Math.abs(ext - v) > 0.01 && Math.abs(vals[0] - ext) < 0.006) return "Falta multiplicar por la derivada de la función de dentro.";
        return null;
      },
      sol: sol + " Por tanto, $f'(" + a + ")=" + vt + "$."
    };
  }

  var GENERADORES = { "practica-tangente": [genTangente], "practica-cadena": [genCadena] };
  raiz.FuncionesLogica = { GENERADORES: GENERADORES };
  if (typeof document === "undefined") return;
  P.arranca(GENERADORES, {}, function () {
    return "Se admiten expresiones como " + P.tex("3/4") + " (<code>3/4</code>), " + P.tex("2e^{3}") + " (<code>2e^3</code>) y decimales como <code>0,75</code>, con dos cifras decimales.";
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
