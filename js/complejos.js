// Piezas interactivas del capítulo 1: figuras que se arrastran y ejercicios con
// datos variables. La lógica matemática no toca el DOM, para poder probarla aparte.
(function (raiz) {
  "use strict";
  var PI = Math.PI;
  var AZUL = "#1f3f77", ACENTO = "#c8553d", GRIS = "#737373", VERDE = "#2e7d4f";

  // ---------- Aritmética y formato ----------
  function azar(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function elige(lista) { return lista[azar(0, lista.length - 1)]; }
  function noCero(a, b) { var x; do { x = azar(a, b); } while (x === 0); return x; }
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function norm(t) { var v = t % (2 * PI); return v < 0 ? v + 2 * PI : v; }
  function mismoAngulo(a, b, tol) {
    var d = norm(a - b);
    return Math.min(d, 2 * PI - d) < tol;
  }
  function mult(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }

  // Número con dos decimales como máximo, para las lecturas de las figuras.
  function n(x) {
    var v = Math.round(x * 100) / 100;
    return String(v === 0 ? 0 : v);
  }
  function cx(a, b) {
    var ra = n(a), rb = n(b);
    if (rb === "0") return ra;
    var im = (rb === "1" ? "" : rb === "-1" ? "-" : rb) + "i";
    if (ra === "0") return im;
    return ra + (rb.charAt(0) === "-" ? "" : "+") + im;
  }
  function grados(t) { return n(t * 180 / PI) + "^\\circ"; }

  // Fracción exacta p/q en LaTeX.
  function fr(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = mcd(p, q);
    p /= g; q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? "-" : "") + "\\frac{" + Math.abs(p) + "}{" + q + "}";
  }
  // Entero a+bi en LaTeX.
  function zt(a, b) {
    if (b === 0) return String(a);
    var im = (b === 1 ? "" : b === -1 ? "-" : String(b)) + "i";
    if (a === 0) return im;
    return a + (b > 0 ? "+" : "") + im;
  }
  // (z-c): resta de un entero complejo, con el signo limpio.
  function menos(v, a, b) {
    if (a === 0 && b === 0) return v;
    if (b === 0) return v + (a < 0 ? "+" + (-a) : "-" + a);
    if (a === 0) {
      var m = Math.abs(b) === 1 ? "" : Math.abs(b);
      return v + (b < 0 ? "+" : "-") + m + "i";
    }
    return v + "-(" + zt(a, b) + ")";
  }
  // Múltiplo racional de pi: p*pi/q.
  function ang(p, q) {
    var g = mcd(p, q);
    p /= g; q /= g;
    if (p === 0) return "0";
    var s = p < 0 ? "-" : "", a = Math.abs(p);
    var num = (a === 1 ? "" : a) + "\\pi";
    return s + (q === 1 ? num : "\\frac{" + num + "}{" + q + "}");
  }
  // Exponente en línea, como en los apuntes: e^{i3\pi/4}.
  function angLinea(p, q) {
    var g = mcd(p, q);
    p /= g; q /= g;
    if (p === 0) return "0";
    var s = p < 0 ? "-" : "", a = Math.abs(p);
    var num = (a === 1 ? "" : a) + "\\pi";
    return s + (q === 1 ? num : num + "/" + q);
  }

  function expi(p, q) {
    if (p === 0) return "e^{i0}";
    return p < 0 ? "e^{-i" + angLinea(-p, q) + "}" : "e^{i" + angLinea(p, q) + "}";
  }
  // Término entero seguido de un múltiplo de raíz de 3, con signos limpios.
  function masRaiz3(base, c) {
    if (c === 0) return String(base);
    var a = Math.abs(c), t = (a === 1 ? "" : a) + "\\sqrt3";
    if (base === 0) return (c < 0 ? "-" : "") + t;
    return base + (c < 0 ? "-" : "+") + t;
  }

  // Coseno y seno exactos de p*pi/q para los ángulos notables.
  // Tipo: 0, 1, 'm' (1/2), 'r2' (raíz de 2 entre 2), 'r3' (raíz de 3 entre 2).
  function exacto(p, q) {
    var t = norm(p * PI / q), c = Math.cos(t), s = Math.sin(t);
    function tipo(v) {
      var a = Math.abs(v);
      if (a < 1e-9) return { t: "0", sg: 1 };
      var sg = v < 0 ? -1 : 1;
      if (Math.abs(a - 1) < 1e-9) return { t: "1", sg: sg };
      if (Math.abs(a - 0.5) < 1e-9) return { t: "m", sg: sg };
      if (Math.abs(a - Math.SQRT1_2) < 1e-9) return { t: "r2", sg: sg };
      if (Math.abs(a - Math.sqrt(3) / 2) < 1e-9) return { t: "r3", sg: sg };
      throw new Error("Ángulo no notable");
    }
    return { c: tipo(c), s: tipo(s), cv: c, sv: s };
  }
  // k veces un valor notable, en LaTeX.
  function escala(k, v) {
    var signo = v.sg < 0 ? "-" : "";
    if (v.t === "0") return "0";
    if (v.t === "1") return signo + k;
    var raiz = v.t === "r2" ? "\\sqrt2" : v.t === "r3" ? "\\sqrt3" : "";
    var g = k % 2 === 0;
    var ent = g ? k / 2 : k;
    if (g) return signo + (ent === 1 && raiz ? "" : ent) + raiz;
    return signo + "\\frac{" + (ent === 1 && raiz ? "" : ent) + raiz + "}{2}";
  }
  function binomica(re, im) {
    if (im === "0") return re;
    var imt;
    if (im === "1") imt = "i";
    else if (im === "-1") imt = "-i";
    else imt = im + "\\,i";
    if (re === "0") return imt;
    return re + (imt.charAt(0) === "-" ? "" : "+") + imt;
  }

  // ---------- Lectura de lo que escribe el alumno ----------
  // Expresión real: 3pi/4, sqrt(2)/2, √3, 2^(1/3), ln(2), 45°, 0,5...
  function leeReal(texto) {
    var s = String(texto).toLowerCase()
      .replace(/\s+/g, "").replace(/,/g, ".")
      .replace(/π/g, "pi").replace(/√/g, "sqrt")
      .replace(/[·×]/g, "*").replace(/[−–]/g, "-");
    var i = 0;
    var FUNCIONES = {
      sqrt: Math.sqrt, raiz: Math.sqrt, ln: Math.log, log: Math.log,
      sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan,
      arctan: Math.atan, atan: Math.atan, exp: Math.exp
    };
    var NOMBRES = Object.keys(FUNCIONES).sort(function (a, b) { return b.length - a.length; });
    function falla() { throw new Error("sintaxis"); }
    function suma() {
      var v = producto();
      while (s[i] === "+" || s[i] === "-") {
        var op = s[i++];
        var w = producto();
        v = op === "+" ? v + w : v - w;
      }
      return v;
    }
    function empiezaFactor() {
      var c = s[i];
      return c !== undefined && /[0-9.(a-z]/.test(c);
    }
    function producto() {
      var v = unario();
      for (;;) {
        if (s[i] === "*") { i++; v *= unario(); }
        else if (s[i] === "/") { i++; v /= unario(); }
        else if (empiezaFactor()) { v *= potencia(); }
        else return v;
      }
    }
    function unario() {
      if (s[i] === "-") { i++; return -unario(); }
      if (s[i] === "+") { i++; return unario(); }
      return potencia();
    }
    function potencia() {
      var b = atomo();
      if (s[i] === "°") { i++; b *= PI / 180; }
      if (s[i] === "^") { i++; return Math.pow(b, unario()); }
      return b;
    }
    function atomo() {
      if (s[i] === "(") {
        i++;
        var v = suma();
        if (s[i] !== ")") falla();
        i++;
        return v;
      }
      var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (m) { i += m[0].length; return parseFloat(m[0]); }
      for (var k = 0; k < NOMBRES.length; k++) {
        if (s.startsWith(NOMBRES[k], i)) {
          var f = FUNCIONES[NOMBRES[k]];
          i += NOMBRES[k].length;
          return f(atomo());
        }
      }
      if (s.startsWith("pi", i)) { i += 2; return PI; }
      if (s[i] === "e") { i++; return Math.E; }
      return falla();
    }
    if (!s) return NaN;
    try {
      var valor = suma();
      return i === s.length && isFinite(valor) ? valor : NaN;
    } catch (e) {
      return NaN;
    }
  }

  // ---------- Generadores de ejercicios ----------
  // Cada uno devuelve el enunciado ($...$ es LaTeX), los campos, la solución y los
  // datos en d, que usa la prueba automática.
  var TOL = 0.006;

  function campoReal(et, v) { return { et: et, v: v, modo: "real" }; }
  function campoFase(et, v) { return { et: et, v: v, modo: "fase" }; }

  function genProducto() {
    var a = noCero(-4, 4), b = noCero(-4, 4), c = noCero(-4, 4), d = noCero(-4, 4);
    var re = a * c - b * d, im = a * d + b * c;
    return {
      d: { tipo: "producto", a: a, b: b, c: c, e: d },
      enun: "Escribir en forma binómica $(" + zt(a, b) + ")(" + zt(c, d) + ")$.",
      campos: [campoReal("\\mathrm{Re}", re), campoReal("\\mathrm{Im}", im)],
      sol: "Se opera como con polinomios, con $i^2=-1$: $(" + a + ")(" + c + ")-(" + b + ")(" + d + ")=" + re +
        "$ es la parte real y $(" + a + ")(" + d + ")+(" + b + ")(" + c + ")=" + im + "$ la imaginaria. Resultado: $" + zt(re, im) + "$."
    };
  }

  function genCociente() {
    var p = noCero(-3, 3), q = noCero(-3, 3), c = noCero(-3, 3), d = noCero(-3, 3);
    var nr = p * c - q * d, ni = p * d + q * c;
    var m = c * c + d * d;
    return {
      d: { tipo: "cociente", nr: nr, ni: ni, c: c, e: d },
      enun: "Escribir en forma binómica $\\dfrac{" + zt(nr, ni) + "}{" + zt(c, d) + "}$.",
      campos: [campoReal("\\mathrm{Re}", p), campoReal("\\mathrm{Im}", q)],
      sol: "Se multiplica arriba y abajo por el conjugado del denominador, $" + zt(c, -d) + "$: $$\\frac{(" + zt(nr, ni) + ")(" + zt(c, -d) + ")}{" + m +
        "}=\\frac{" + zt(p * m, q * m) + "}{" + m + "}=" + zt(p, q) + ".$$"
    };
  }

  function genBinAExp() {
    var f = elige([
      { a: "1", b: "1", av: 1, bv: 1, rho: "\\sqrt2", rv: Math.SQRT2, p: 1, q: 4 },
      { a: "1", b: "\\sqrt3", av: 1, bv: Math.sqrt(3), rho: "2", rv: 2, p: 1, q: 3 },
      { a: "\\sqrt3", b: "1", av: Math.sqrt(3), bv: 1, rho: "2", rv: 2, p: 1, q: 6 },
      { a: "2", b: "2", av: 2, bv: 2, rho: "2\\sqrt2", rv: 2 * Math.SQRT2, p: 1, q: 4 }
    ]);
    var sa = elige([1, -1]), sb = elige([1, -1]);
    var a = sa * f.av, b = sb * f.bv;
    var theta = norm(Math.atan2(b, a));
    // Fase exacta en [0,2pi), a partir del ángulo del primer cuadrante
    var num = sa > 0 ? (sb > 0 ? f.p : 2 * f.q - f.p) : (sb > 0 ? f.q - f.p : f.q + f.p);
    var textoB = (sb < 0 ? "-" : "+") + (f.b === "1" ? "" : f.b) + "i";
    if (f.b === "\\sqrt3") textoB = (sb < 0 ? "-" : "+") + "i\\sqrt3";
    var z = (sa < 0 ? "-" : "") + f.a + textoB;
    var cuadrante = sa > 0 ? (sb > 0 ? "primer" : "cuarto") : (sb > 0 ? "segundo" : "tercer");
    return {
      d: { tipo: "binexp", a: a, b: b },
      enun: "Hallar el módulo y la fase de $z=" + z + "$. La fase se puede dar con cualquier número de giros.",
      campos: [campoReal("\\rho", f.rv), campoFase("\\theta", theta)],
      sol: "$\\rho=" + f.rho + "$. El afijo está en el " + cuadrante + " cuadrante, así que $\\theta=" + ang(num, f.q) + "$. Por tanto, $z=" + f.rho + "\\,e^{i" + angLinea(num, f.q) + "}$.",
      pista: function (vals) {
        var t = vals[1];
        if (isNaN(t) || mismoAngulo(t, theta, TOL)) return null;
        if (mismoAngulo(t + PI, theta, TOL)) return "La fase difiere en $\\pi$ de la correcta: $\\arctan$ no distingue cuadrantes. Mira dónde está el afijo.";
        if (mismoAngulo(-t, theta, TOL)) return "La fase tiene el signo cambiado: esa es la del conjugado.";
        return null;
      }
    };
  }

  var NOTABLES = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [7, 6], [5, 4], [4, 3], [3, 2], [5, 3], [7, 4], [11, 6]];

  function genExpABin() {
    var r = elige([2, 3, 4, 6]), a = elige(NOTABLES);
    var signo = a[0] / a[1] > 1 && Math.random() < 0.4 ? -1 : 1;
    var p = signo < 0 ? a[0] - 2 * a[1] : a[0];
    var e = exacto(p, a[1]);
    return {
      d: { tipo: "expbin", r: r, p: p, q: a[1] },
      enun: "Escribir en forma binómica $z=" + r + expi(p, a[1]) + "$.",
      campos: [campoReal("\\mathrm{Re}", r * e.cv), campoReal("\\mathrm{Im}", r * e.sv)],
      sol: "$a=\\rho\\cos\\theta=" + escala(r, e.c) + "$ y $b=\\rho\\sin\\theta=" + escala(r, e.s) + "$, así que $z=" + binomica(escala(r, e.c), escala(r, e.s)) + "$."
    };
  }

  function genPotencia() {
    var sa = elige([1, -1]), sb = elige([1, -1]);
    var pot = azar(3, 8);
    var familia = elige(["1i", "3i"]);
    var re, im, base, rhoTx, q, p;
    if (familia === "1i") {
      base = (sa < 0 ? "-" : "") + "1" + (sb < 0 ? "-" : "+") + "i";
      rhoTx = "\\sqrt2"; q = 4;
      p = sa > 0 ? (sb > 0 ? 1 : 7) : (sb > 0 ? 3 : 5);
      var r2 = Math.pow(Math.SQRT2, pot);
      var e2 = { c: Math.cos(pot * p * PI / 4), s: Math.sin(pot * p * PI / 4) };
      re = Math.round(r2 * e2.c); im = Math.round(r2 * e2.s);
      var v = zt(re, im);
      return {
        d: { tipo: "potencia", a: sa, b: sb, n: pot },
        enun: "Calcular $z^{" + pot + "}$ en forma binómica, con $z=" + base + "$.",
        campos: [campoReal("\\mathrm{Re}", re), campoReal("\\mathrm{Im}", im)],
        sol: "$z=" + rhoTx + "\\,e^{i" + angLinea(p, q) + "}$, así que $z^{" + pot + "}=(" + rhoTx + ")^{" + pot + "}e^{i" + angLinea(pot * p, q) + "}=" + v + "$."
      };
    }
    base = (sa < 0 ? "-" : "") + "1" + (sb < 0 ? "-" : "+") + "i\\sqrt3";
    q = 3;
    p = sa > 0 ? (sb > 0 ? 1 : 5) : (sb > 0 ? 2 : 4);
    var R = Math.pow(2, pot), e3 = exacto(pot * p, q);
    return {
      d: { tipo: "potencia", a: sa, b: sb * Math.sqrt(3), n: pot },
      enun: "Calcular $z^{" + pot + "}$ en forma binómica, con $z=" + base + "$.",
      campos: [campoReal("\\mathrm{Re}", R * e3.cv), campoReal("\\mathrm{Im}", R * e3.sv)],
      sol: "$z=2e^{i" + angLinea(p, q) + "}$, así que $z^{" + pot + "}=" + R + "\\,e^{i" + angLinea(pot * p, q) + "}=" + binomica(escala(R, e3.c), escala(R, e3.s)) + "$."
    };
  }

  function genRaices() {
    var m = elige([2, 3, 4]), r = elige([1, 2, 3]);
    var w = elige([
      { p: 0, q: 1, f: function (R) { return String(R); } },
      { p: 1, q: 2, f: function (R) { return (R === 1 ? "" : R) + "i"; } },
      { p: 1, q: 1, f: function (R) { return String(-R); } },
      { p: 3, q: 2, f: function (R) { return "-" + (R === 1 ? "" : R) + "i"; } }
    ]);
    var R = Math.pow(r, m), fases = [], textos = [], campos = [campoReal("\\rho", r)];
    for (var k = 0; k < m; k++) {
      // (p/q + 2k)/m = (p + 2kq)/(qm), en unidades de pi
      var num = w.p + 2 * k * w.q, den = w.q * m;
      fases.push(num * PI / den);
      textos.push(ang(num, den));
      campos.push(campoFase("\\theta_" + (k + 1), fases[k]));
    }
    return {
      d: { tipo: "raices", m: m, r: r, wp: w.p, wq: w.q },
      enun: "Hallar las soluciones de $z^{" + m + "}=" + w.f(R) + "$: su módulo y sus " + m + " fases, en cualquier orden.",
      campos: campos,
      sol: "$" + w.f(R) + "=" + (R === 1 ? "" : R + "\\,") + expi(w.p, w.q) + "$. El módulo es $" + R + "^{1/" + m + "}=" + r + "$ y las fases son $(" + ang(w.p, w.q) + "+2\\pi k)/" + m + "$ con $k=" + (m === 2 ? "0,1" : "0,\\dots," + (m - 1)) + "$: $" + textos.join(",\\ ") + "$.",
      comprobar: function (vals) {
        var res = [Math.abs(vals[0] - r) < TOL], libres = fases.slice();
        for (var j = 1; j < vals.length; j++) {
          var hallado = false;
          for (var l = 0; l < libres.length; l++) {
            if (!isNaN(vals[j]) && mismoAngulo(vals[j], libres[l], TOL)) { libres.splice(l, 1); hallado = true; break; }
          }
          res.push(hallado);
        }
        return res;
      }
    };
  }

  function genGiro() {
    var z1 = { re: azar(-3, 3), im: azar(-3, 3) };
    var dx, dy;
    do { dx = azar(-3, 3); dy = azar(-3, 3); } while (dx === 0 && dy === 0);
    var z2 = { re: z1.re + dx, im: z1.im + dy };
    var tipo = elige(["cuadrado", "doble", "equilatero"]);
    var s = elige([1, -1]);
    var txt1 = zt(z1.re, z1.im), txt2 = zt(z2.re, z2.im);
    var resta = zt(dx, dy);
    if (tipo === "equilatero") {
      var r3 = Math.sqrt(3);
      var re = z1.re + dx / 2 - s * dy * r3 / 2, im = z1.im + dy / 2 + s * dx * r3 / 2;
      return {
        d: { tipo: "giro", z1: z1, z2: z2, k: 1, alfa: s * PI / 3 },
        enun: "Girar $z=" + txt2 + "$ un ángulo $" + (s < 0 ? "-" : "") + "\\pi/3$ alrededor de $w=" + txt1 + "$. Hallar el punto $z'$ que se obtiene.",
        campos: [campoReal("\\mathrm{Re}\\,z'", re), campoReal("\\mathrm{Im}\\,z'", im)],
        sol: "$z'-w=(z-w)\\,e^{" + (s < 0 ? "-" : "") + "i\\pi/3}=(" + resta + ")\\left(\\frac12" + (s < 0 ? "-" : "+") + "i\\frac{\\sqrt3}{2}\\right)$. Se opera y se suma $w$: $$z'=\\left(" + z1.re + "+\\frac{" + masRaiz3(dx, -s * dy) + "}{2}\\right)+i\\left(" + z1.im + "+\\frac{" + masRaiz3(dy, s * dx) + "}{2}\\right).$$"
      };
    }
    var k = tipo === "doble" ? 2 : 1;
    var v = { re: -s * dy * k, im: s * dx * k };
    var res = { re: z1.re + v.re, im: z1.im + v.im };
    var factor = (k === 2 ? "2" : "") + (s < 0 ? "(-i)" : "i");
    var enun = tipo === "doble" ?
      "Multiplicar el vector de $w=" + txt1 + "$ a $z=" + txt2 + "$ por $" + (s < 0 ? "-2i" : "2i") + "$, es decir, girarlo $" + (s < 0 ? "-" : "") + "90^\\circ$ y duplicarlo. Hallar el extremo $z'$." :
      "$w=" + txt1 + "$ y $z=" + txt2 + "$ son vértices contiguos de un cuadrado. Girando $z$ alrededor de $w$ un ángulo $" + (s < 0 ? "-" : "") + "90^\\circ$ se obtiene otro vértice $z'$. Hallarlo.";
    return {
      d: { tipo: "giro", z1: z1, z2: z2, k: k, alfa: s * PI / 2 },
      enun: enun,
      campos: [campoReal("\\mathrm{Re}\\,z'", res.re), campoReal("\\mathrm{Im}\\,z'", res.im)],
      sol: "$z'-w=(z-w)\\cdot " + factor + "=(" + resta + ")\\cdot " + factor + "=" + zt(v.re, v.im) + "$, así que $z'=" + zt(res.re, res.im) + "$."
    };
  }

  function genExpCompleja() {
    var a = elige([1, 2, 3]), p = elige([[1, 2], [1, 1], [3, 2], [1, 3], [2, 3], [1, 6], [5, 6]]);
    var e = exacto(p[0], p[1]);
    var factor = a === 1 ? "e" : "e^{" + a + "}", ea = Math.exp(a);
    function t(v) {
      var sg = v.sg < 0 ? "-" : "";
      if (v.t === "0") return "0";
      if (v.t === "1") return sg + factor;
      if (v.t === "m") return sg + "\\frac{" + factor + "}{2}";
      return sg + "\\frac{" + (v.t === "r2" ? "\\sqrt2" : "\\sqrt3") + "\\," + factor + "}{2}";
    }
    return {
      d: { tipo: "exp", a: a, p: p[0], q: p[1] },
      enun: "Escribir en forma binómica $e^{" + a + "+i" + angLinea(p[0], p[1]) + "}$.",
      campos: [campoReal("\\mathrm{Re}", ea * e.cv), campoReal("\\mathrm{Im}", ea * e.sv)],
      sol: "$e^{x+iy}=e^x(\\cos y+i\\sin y)$: parte real $" + t(e.c) + "$ y parte imaginaria $" + t(e.s) + "$."
    };
  }

  function genLogaritmo() {
    var f = elige([
      { t: "-e", rv: 1, rt: "1", p: 1, q: 1 },
      { t: "2i", rv: Math.log(2), rt: "\\ln 2", p: 1, q: 2 },
      { t: "-3i", rv: Math.log(3), rt: "\\ln 3", p: -1, q: 2 },
      { t: "1+i", rv: Math.log(Math.SQRT2), rt: "\\ln\\sqrt2", p: 1, q: 4 },
      { t: "-1-i", rv: Math.log(Math.SQRT2), rt: "\\ln\\sqrt2", p: -3, q: 4 },
      { t: "1-i\\sqrt3", rv: Math.log(2), rt: "\\ln 2", p: -1, q: 3 },
      { t: "-1+i\\sqrt3", rv: Math.log(2), rt: "\\ln 2", p: 2, q: 3 },
      { t: "-5", rv: Math.log(5), rt: "\\ln 5", p: 1, q: 1 }
    ]);
    var im = f.p * PI / f.q;
    return {
      d: { tipo: "ln", t: f.t },
      enun: "Hallar el valor principal de $\\ln(" + f.t + ")$, con la fase en $(-\\pi,\\pi]$.",
      campos: [campoReal("\\mathrm{Re}", f.rv), campoReal("\\mathrm{Im}", im)],
      sol: "$\\ln z=\\ln\\rho+i\\theta$, con $\\theta$ en $(-\\pi,\\pi]$: $" + f.rt + (f.p < 0 ? "-" : "+") + "i" + ang(Math.abs(f.p), f.q) + "$.",
      pista: function (vals) {
        var t = vals[1];
        if (isNaN(t) || Math.abs(t - im) < TOL) return null;
        if (mismoAngulo(t, im, TOL)) return "Es un valor del logaritmo, pero no el principal: la fase tiene que estar en $(-\\pi,\\pi]$.";
        return null;
      }
    };
  }

  function genCoseno() {
    var a = elige([2, 3, 4, 5]), x = elige([[0, 1], [1, 2], [1, 1], [3, 2]]);
    var c = Math.round(Math.cos(x[0] * PI / x[1])), s = Math.round(Math.sin(x[0] * PI / x[1]));
    // cos(x+iy) = cos x cosh y - i sin x sinh y, con y = ln a
    var ch = (a * a + 1) / (2 * a), sh = (a * a - 1) / (2 * a);
    var re = c * ch, im = -s * sh;
    var expo = x[0] === 0 ? "" : angLinea(x[0], x[1]) + "+";
    return {
      d: { tipo: "coseno", a: a, x: x[0] * PI / x[1] },
      enun: "Escribir en forma binómica $\\cos\\left(" + expo + "i\\ln " + a + "\\right)$.",
      campos: [campoReal("\\mathrm{Re}", re), campoReal("\\mathrm{Im}", im)],
      sol: "Con $z=" + expo + "i\\ln " + a + "$, $e^{iz}=e^{ix}/" + a + "$ y $e^{-iz}=" + a + "\\,e^{-ix}$, con $x=" + ang(x[0], x[1]) + "$. Entonces $\\cos z=\\frac12\\left(e^{iz}+e^{-iz}\\right)=" +
        binomica(fr(c * (a * a + 1), 2 * a), fr(-s * (a * a - 1), 2 * a)) + "$."
    };
  }

  function cuadrado(v, c) {
    return c === 0 ? v + "^2" : "(" + v + (c < 0 ? "+" + (-c) : "-" + c) + ")^2";
  }

  function genCircunferencia() {
    var a = azar(-3, 3), b = azar(-3, 3), r = azar(1, 4);
    return {
      d: { tipo: "circ", a: a, b: b, r: r },
      enun: "$|" + menos("z", a, b) + "|=" + r + "$ es una circunferencia. Hallar su centro $x_0+iy_0$ y su radio $r$.",
      campos: [campoReal("x_0", a), campoReal("y_0", b), campoReal("r", r)],
      sol: "Con $z=x+iy$: $" + cuadrado("x", a) + "+" + cuadrado("y", b) + "=" + r * r + "$. Centro $" + zt(a, b) + "$ y radio $" + r + "$."
    };
  }

  function genMediatriz() {
    var a, b, c, d;
    do { a = azar(-3, 3); b = azar(-3, 3); c = azar(-3, 3); d = azar(-3, 3); } while (b === d);
    // (x-a)^2+(y-b)^2 = (x-c)^2+(y-d)^2  =>  2(c-a)x + 2(d-b)y = c^2+d^2-a^2-b^2
    var A = 2 * (c - a), B = 2 * (d - b), C = c * c + d * d - a * a - b * b;
    var m = -A / B, h = C / B;
    return {
      d: { tipo: "mediatriz", a: a, b: b, c: c, e: d },
      enun: "$|" + menos("z", a, b) + "|=|" + menos("z", c, d) + "|$ es una recta. Escribirla como $y=mx+h$.",
      campos: [campoReal("m", m), campoReal("h", h)],
      sol: "Es la mediatriz del segmento entre $" + zt(a, b) + "$ y $" + zt(c, d) + "$. Elevando al cuadrado con $z=x+iy$ se cancelan $x^2$ e $y^2$ y queda $" + (A === 0 ? "" : A + "x" + (B > 0 ? "+" : "")) + B + "y=" + C + "$, es decir, $m=" + fr(-A, B) + "$ y $h=" + fr(C, B) + "$."
    };
  }

  var GENERADORES = {
    "practica-binomica": [genProducto, genCociente],
    "practica-formas": [genBinAExp, genExpABin],
    "practica-operaciones": [genPotencia, genRaices],
    "practica-giro": [genGiro],
    "practica-funciones": [genExpCompleja, genLogaritmo, genCoseno],
    "practica-lugares": [genCircunferencia, genMediatriz]
  };

  // Compara lo escrito con la solución, campo a campo.
  function corrige(ej, vals) {
    if (ej.comprobar) return ej.comprobar(vals);
    return ej.campos.map(function (c, i) {
      if (isNaN(vals[i])) return false;
      return c.modo === "fase" ? mismoAngulo(vals[i], c.v, TOL) : Math.abs(vals[i] - c.v) < TOL;
    });
  }

  raiz.ComplejosLogica = {
    leeReal: leeReal, corrige: corrige, GENERADORES: GENERADORES, mult: mult, norm: norm, mismoAngulo: mismoAngulo
  };
  if (typeof document === "undefined") return;

  // ---------- Dibujo ----------
  var SVG = "http://www.w3.org/2000/svg";
  function el(nombre, attrs, padre) {
    var e = document.createElementNS(SVG, nombre);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function h(nombre, clase, padre, texto) {
    var e = document.createElement(nombre);
    if (clase) e.className = clase;
    if (texto) e.textContent = texto;
    if (padre) padre.appendChild(e);
    return e;
  }
  function tex(s, display) {
    return window.katex.renderToString(s, { throwOnError: false, displayMode: !!display });
  }
  // Texto con $...$ y $$...$$ a HTML.
  function mezcla(s) {
    return s.replace(/\$\$([^$]+)\$\$/g, function (_, m) { return tex(m, true); })
      .replace(/\$([^$]+)\$/g, function (_, m) { return tex(m); });
  }

  function Plano(padre, o) {
    var W = 400, esc = W / (o.xmax - o.xmin), H = (o.ymax - o.ymin) * esc;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "plano", role: "img", "aria-label": o.alt || "Plano complejo" }, padre);
    function X(x) { return (x - o.xmin) * esc; }
    function Y(y) { return (o.ymax - y) * esc; }
    var fondo = el("g", {}, svg);
    var paso = o.paso || 1;
    for (var i = Math.ceil(o.xmin / paso); i * paso <= o.xmax; i++) {
      el("line", { x1: X(i * paso), x2: X(i * paso), y1: 0, y2: H, stroke: i === 0 ? GRIS : "#e8e8e8", "stroke-width": i === 0 ? 1.2 : 1 }, fondo);
      if (i !== 0 && o.numeros !== false && X(i * paso) > 12 && X(i * paso) < W - 12) {
        el("text", { x: X(i * paso), y: Y(0) + 14, "text-anchor": "middle", "font-size": 11, fill: "#888" }, fondo).textContent = i * paso;
      }
    }
    for (var j = Math.ceil(o.ymin / paso); j * paso <= o.ymax; j++) {
      el("line", { y1: Y(j * paso), y2: Y(j * paso), x1: 0, x2: W, stroke: j === 0 ? GRIS : "#e8e8e8", "stroke-width": j === 0 ? 1.2 : 1 }, fondo);
      if (j !== 0 && o.numeros !== false && Y(j * paso) > 12 && Y(j * paso) < H - 12) {
        el("text", { x: X(0) - 5, y: Y(j * paso) + 4, "text-anchor": "end", "font-size": 11, fill: "#888" }, fondo).textContent = j * paso;
      }
    }
    el("text", { x: W - 4, y: Y(0) - 5, "text-anchor": "end", "font-size": 12, fill: GRIS, "font-family": "serif" }, fondo).textContent = "Re";
    el("text", { x: X(0) + 5, y: 13, "font-size": 12, fill: GRIS, "font-family": "serif" }, fondo).textContent = "Im";

    var capa = el("g", {}, svg);
    var asas = el("g", {}, svg);
    var api = {
      svg: svg, X: X, Y: Y, esc: esc, W: W, H: H, fondo: fondo,
      limpia: function () { while (capa.firstChild) capa.removeChild(capa.firstChild); },
      linea: function (a, b, color, ancho, raya) {
        var attrs = { x1: X(a.re), y1: Y(a.im), x2: X(b.re), y2: Y(b.im), stroke: color, "stroke-width": ancho || 1.5 };
        if (raya) attrs["stroke-dasharray"] = "5 4";
        return el("line", attrs, capa);
      },
      flecha: function (a, b, color, ancho, raya, margen) {
        var dx = X(b.re) - X(a.re), dy = Y(b.im) - Y(a.im), l = Math.hypot(dx, dy);
        margen = margen || 0;
        if (l < margen + 1) return;
        var ux = dx / l, uy = dy / l, T = Math.min(9, l - margen), x = X(b.re) - ux * margen, y = Y(b.im) - uy * margen;
        var bx = x - ux * T, by = y - uy * T;
        var attrs = { x1: X(a.re), y1: Y(a.im), x2: bx, y2: by, stroke: color, "stroke-width": ancho || 2 };
        if (raya) attrs["stroke-dasharray"] = "5 4";
        el("line", attrs, capa);
        el("polygon", {
          points: x + "," + y + " " + (bx - uy * 4) + "," + (by + ux * 4) + " " + (bx + uy * 4) + "," + (by - ux * 4),
          fill: color
        }, capa);
      },
      arco: function (c, r, t0, t1, color, ancho) {
        var pts = [], N = 40;
        for (var k = 0; k <= N; k++) {
          var t = t0 + (t1 - t0) * k / N;
          pts.push(X(c.re + r * Math.cos(t)) + "," + Y(c.im + r * Math.sin(t)));
        }
        el("polyline", { points: pts.join(" "), fill: "none", stroke: color, "stroke-width": ancho || 1.5 }, capa);
      },
      punto: function (p, color, r) { el("circle", { cx: X(p.re), cy: Y(p.im), r: r || 4, fill: color }, capa); },
      texto: function (p, s, color, dx, dy) {
        var t = el("text", { x: X(p.re) + (dx === undefined ? 8 : dx), y: Y(p.im) + (dy === undefined ? -8 : dy), fill: color, "font-size": 14, "font-family": "serif", "font-style": "italic" }, capa);
        t.textContent = s;
      },
      rotulo: function (desde, hasta, s, color) {
        var dx = X(hasta.re) - X(desde.re), dy = Y(hasta.im) - Y(desde.im), l = Math.hypot(dx, dy) || 1;
        var t = el("text", { x: X(hasta.re) + dx / l * 15, y: Y(hasta.im) + dy / l * 15 + 5, fill: color, "text-anchor": "middle", "font-size": 14, "font-family": "serif", "font-style": "italic" }, capa);
        t.textContent = s;
      },
      poligono: function (ps, color, opacidad) {
        el("polygon", { points: ps.map(function (p) { return X(p.re) + "," + Y(p.im); }).join(" "), fill: color, "fill-opacity": opacidad }, capa);
      },
      // Punto que se arrastra con ratón o dedo, o con las flechas del teclado.
      asa: function (p, color, nombre, salto, cambio) {
        var g = el("g", { class: "asa", tabindex: 0, role: "slider", "aria-label": "Punto " + nombre }, asas);
        el("circle", { r: 21, fill: "transparent" }, g);
        el("circle", { class: "asa-marca", r: 7, fill: color, stroke: "#fff", "stroke-width": 2 }, g);
        var rot = el("text", { x: 11, y: -10, fill: color, "font-size": 15, "font-family": "serif", "font-style": "italic", "font-weight": 600 }, g);
        rot.textContent = nombre;
        function coloca() { g.setAttribute("transform", "translate(" + X(p.re) + " " + Y(p.im) + ")"); }
        function fija(re, im) {
          p.re = Math.max(o.xmin, Math.min(o.xmax, Math.round(re / salto) * salto));
          p.im = Math.max(o.ymin, Math.min(o.ymax, Math.round(im / salto) * salto));
          coloca();
          cambio();
        }
        function arrastra(ev) {
          var m = svg.getScreenCTM().inverse();
          var pt = svg.createSVGPoint();
          pt.x = ev.clientX; pt.y = ev.clientY;
          var q = pt.matrixTransform(m);
          fija(o.xmin + q.x / esc, o.ymax - q.y / esc);
        }
        g.addEventListener("pointerdown", function (ev) {
          ev.preventDefault();
          g.setPointerCapture(ev.pointerId);
          g.classList.add("arrastrando");
          g.focus({ preventScroll: true });
        });
        g.addEventListener("pointermove", function (ev) {
          if (g.classList.contains("arrastrando")) arrastra(ev);
        });
        function suelta() { g.classList.remove("arrastrando"); }
        g.addEventListener("pointerup", suelta);
        g.addEventListener("pointercancel", suelta);
        g.addEventListener("keydown", function (ev) {
          var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
          if (!d) return;
          ev.preventDefault();
          fija(p.re + d[0] * salto, p.im + d[1] * salto);
        });
        coloca();
        return { recoloca: coloca };
      }
    };
    return api;
  }

  function cabecera(c, titulo, ayuda) {
    h("div", "i-titulo", c, titulo);
    if (ayuda) h("div", "i-ayuda", c).innerHTML = mezcla(ayuda);
  }
  function deslizador(padre, etiqueta, min, max, paso, valor, cambio) {
    var l = h("label", "", padre);
    var nombre = h("span", "", l);
    var input = h("input", "", l);
    input.type = "range"; input.min = min; input.max = max; input.step = paso; input.value = valor;
    input.setAttribute("aria-label", etiqueta);
    function pinta() { nombre.innerHTML = etiqueta(+input.value) + " "; }
    input.addEventListener("input", function () { pinta(); cambio(+input.value); });
    pinta();
    return input;
  }

  // ---------- Figuras ----------
  var WIDGETS = {};

  WIDGETS["modulo-fase"] = function (c) {
    cabecera(c, "Módulo y fase", "Arrastra $z$. Fíjate en la fase cuando el afijo pasa a la izquierda del eje imaginario.");
    var pl = Plano(c, { xmin: -4.5, xmax: 4.5, ymin: -4, ymax: 4, alt: "Plano complejo con el punto z" });
    var lect = h("div", "i-lectura", c);
    var z = { re: -1, im: -1 };
    function dibuja() {
      pl.limpia();
      var a = z.re, b = z.im, rho = Math.hypot(a, b);
      if (rho === 0) {
        lect.innerHTML = "<p>" + tex("z=0") + ": módulo 0 y sin fase.</p>";
        return;
      }
      var theta = norm(Math.atan2(b, a));
      pl.linea({ re: a, im: 0 }, z, GRIS, 1.2, true);
      pl.linea({ re: 0, im: b }, z, GRIS, 1.2, true);
      pl.arco({ re: 0, im: 0 }, Math.min(0.8, rho * 0.6), 0, theta, ACENTO, 2);
      pl.flecha({ re: 0, im: 0 }, z, AZUL, 2.2, false, 9);
      var filas = ["<p>" + tex("z=" + cx(a, b) + ",\\qquad \\rho=\\sqrt{a^2+b^2}=" + n(rho)) + "</p>"];
      if (a === 0) {
        filas.push("<p>" + tex("a=0") + ": " + tex("\\tan\\theta") + " no está definida y " + tex("\\theta=" + (b > 0 ? "\\pi/2" : "3\\pi/2")) + ".</p>");
      } else {
        var at = Math.atan(b / a);
        filas.push("<p>" + tex("\\arctan(b/a)=" + grados(at) + ",\\qquad \\theta=" + grados(theta) + "=" + n(theta) + "\\text{ rad}") + "</p>");
        if (a < 0) {
          filas.push('<p class="i-nota">El afijo está a la izquierda: ' + tex("\\arctan") + " da un ángulo de otro cuadrante y hay que sumar " + tex("\\pi") + ".</p>");
        }
      }
      lect.innerHTML = filas.join("");
    }
    pl.asa(z, AZUL, "z", 0.5, dibuja);
    dibuja();
  };

  WIDGETS["suma-resta"] = function (c) {
    cabecera(c, "Suma y resta", "Arrastra $z_1$ y $z_2$.");
    var ctr = h("div", "i-controles", c);
    var modo = "suma";
    [["suma", "Suma"], ["resta", "Resta"]].forEach(function (m, i) {
      var l = h("label", "", ctr);
      var r = h("input", "", l);
      r.type = "radio"; r.name = "suma-resta-modo"; r.checked = i === 0;
      l.appendChild(document.createTextNode(" " + m[1]));
      r.addEventListener("change", function () { modo = m[0]; dibuja(); });
    });
    var pl = Plano(c, { xmin: -3.5, xmax: 6.5, ymin: -3.5, ymax: 5.5, alt: "Plano complejo con z1 y z2" });
    var lect = h("div", "i-lectura", c);
    var z1 = { re: 3, im: 1 }, z2 = { re: 1, im: 2 }, O = { re: 0, im: 0 };
    function dibuja() {
      pl.limpia();
      pl.flecha(O, z1, AZUL, 2, false, 9);
      pl.flecha(O, z2, AZUL, 2, false, 9);
      if (modo === "suma") {
        var s = { re: z1.re + z2.re, im: z1.im + z2.im };
        pl.linea(z1, s, GRIS, 1.2, true);
        pl.linea(z2, s, GRIS, 1.2, true);
        pl.flecha(O, s, ACENTO, 2.4);
        pl.rotulo(O, s, "z₁+z₂", ACENTO);
        lect.innerHTML = "<p>" + tex("z_1+z_2=" + cx(s.re, s.im)) + ": la diagonal del paralelogramo.</p>";
      } else {
        var r = { re: z1.re - z2.re, im: z1.im - z2.im };
        pl.flecha(z2, z1, ACENTO, 2, true, 9);
        pl.flecha(O, r, ACENTO, 2.4);
        pl.rotulo(O, r, "z₁−z₂", ACENTO);
        lect.innerHTML = "<p>" + tex("z_1-z_2=" + cx(r.re, r.im)) + ": el vector de " + tex("z_2") + " a " + tex("z_1") + ", trasladado al origen.</p>";
      }
    }
    pl.asa(z1, AZUL, "z₁", 0.5, dibuja);
    pl.asa(z2, AZUL, "z₂", 0.5, dibuja);
    dibuja();
  };

  WIDGETS.producto = function (c) {
    cabecera(c, "Producto", "Arrastra $z$ y el factor $w=ke^{i\\alpha}$: $k$ es el módulo de $w$ y $\\alpha$ su fase.");
    var pl = Plano(c, { xmin: -5, xmax: 5, ymin: -5, ymax: 5, alt: "Plano complejo con z, w y su producto" });
    var lect = h("div", "i-lectura", c);
    var z = { re: 1, im: 1 }, w = { re: 0, im: 2 }, O = { re: 0, im: 0 };
    function dibuja() {
      pl.limpia();
      var p = mult(z, w), rz = Math.hypot(z.re, z.im), k = Math.hypot(w.re, w.im);
      var tz = norm(Math.atan2(z.im, z.re)), al = norm(Math.atan2(w.im, w.re));
      if (al > PI) al -= 2 * PI;
      pl.flecha(O, w, VERDE, 1.8, false, 9);
      pl.flecha(O, z, AZUL, 2, false, 9);
      pl.flecha(O, p, ACENTO, 2.4);
      if (rz > 0 && k > 0) pl.arco(O, 0.7, tz, tz + al, ACENTO, 2);
      pl.rotulo(O, p, "zw", ACENTO);
      var fuera = Math.abs(p.re) > 5 || Math.abs(p.im) > 5;
      lect.innerHTML = "<p>" + tex("|zw|=|z|\\,k=" + n(rz) + "\\cdot" + n(k) + "=" + n(rz * k) + ",\\qquad \\alpha=" + grados(al)) + "</p>" +
        "<p>" + tex("zw=(" + cx(z.re, z.im) + ")(" + cx(w.re, w.im) + ")=" + cx(p.re, p.im)) + "</p>" +
        (fuera ? '<p class="i-nota">El producto se sale de la figura.</p>' : "");
    }
    pl.asa(z, AZUL, "z", 0.5, dibuja);
    pl.asa(w, VERDE, "w", 0.5, dibuja);
    dibuja();
  };

  WIDGETS.giro = function (c) {
    cabecera(c, "Giro alrededor de un punto", "Arrastra $z$ y el centro $w$, y cambia el ángulo y la escala.");
    var ctr = h("div", "i-controles", c);
    var alfa = 90, k = 1;
    deslizador(ctr, function (v) { return "Ángulo " + tex("\\alpha=" + v + "^\\circ"); }, -180, 180, 15, alfa, function (v) { alfa = v; dibuja(); });
    deslizador(ctr, function (v) { return "Escala " + tex("k=" + v); }, 0.5, 2, 0.25, k, function (v) { k = v; dibuja(); });
    var pl = Plano(c, { xmin: -3, xmax: 7, ymin: -3, ymax: 7, alt: "Giro de z alrededor de w" });
    var lect = h("div", "i-lectura", c);
    var z = { re: 1, im: 3 }, w = { re: 3, im: 1 };
    function dibuja() {
      pl.limpia();
      var a = alfa * PI / 180;
      var d = { re: z.re - w.re, im: z.im - w.im };
      var g = mult(d, { re: k * Math.cos(a), im: k * Math.sin(a) });
      var zp = { re: w.re + g.re, im: w.im + g.im };
      var t0 = Math.atan2(d.im, d.re);
      pl.flecha(w, z, AZUL, 2, false, 9);
      pl.flecha(w, zp, ACENTO, 2.4);
      if (Math.hypot(d.re, d.im) > 0) pl.arco(w, 0.8, t0, t0 + a, ACENTO, 2);
      pl.rotulo(w, zp, "z′", ACENTO);
      lect.innerHTML = "<p>" + tex("z'-w=(z-w)\\,k\\,e^{i\\alpha}=(" + cx(d.re, d.im) + ")\\cdot" + n(k) + "\\,e^{i" + grados(a) + "}") + "</p>" +
        "<p>" + tex("z'=" + cx(zp.re, zp.im)) + "</p>";
    }
    pl.asa(z, AZUL, "z", 0.5, dibuja);
    pl.asa(w, GRIS, "w", 0.5, dibuja);
    dibuja();
  };

  WIDGETS.raices = function (c) {
    cabecera(c, "Raíces", "Arrastra $w$ y cambia $n$. A la derecha, las soluciones de $z^n=w$.");
    var ctr = h("div", "i-controles", c);
    var m = 3;
    deslizador(ctr, function (v) { return tex("n=" + v); }, 2, 8, 1, m, function (v) { m = v; dibuja(); });
    var doble = h("div", "i-doble", c);
    var a = h("div", "", doble), b = h("div", "", doble);
    var plW = Plano(a, { xmin: -10, xmax: 10, ymin: -10, ymax: 10, paso: 2, alt: "Plano con el punto w" });
    h("div", "", a).innerHTML = "Plano de " + tex("w");
    var plZ = Plano(b, { xmin: -4, xmax: 4, ymin: -4, ymax: 4, alt: "Plano con las raíces" });
    h("div", "", b).innerHTML = "Plano de " + tex("z");
    var lect = h("div", "i-lectura", c);
    var w = { re: 8, im: 0 };
    function dibuja() {
      plW.limpia(); plZ.limpia();
      var R = Math.hypot(w.re, w.im);
      if (R === 0) {
        plZ.punto({ re: 0, im: 0 }, ACENTO, 5);
        lect.innerHTML = "<p>" + tex("w=0") + ": la única solución es " + tex("z=0") + ".</p>";
        return;
      }
      plW.flecha({ re: 0, im: 0 }, w, AZUL, 2, false, 9);
      var r = Math.pow(R, 1 / m), t = norm(Math.atan2(w.im, w.re)), pts = [], fases = [];
      for (var k = 0; k < m; k++) {
        var f = (t + 2 * PI * k) / m;
        pts.push({ re: r * Math.cos(f), im: r * Math.sin(f) });
        fases.push(grados(f));
      }
      plZ.arco({ re: 0, im: 0 }, r, 0, 2 * PI, "#c9c9c9", 1);
      plZ.poligono(pts, ACENTO, 0.12);
      pts.forEach(function (p) { plZ.punto(p, ACENTO, 5); });
      lect.innerHTML = "<p>" + tex("|w|=" + n(R) + ",\\quad \\arg w=" + grados(t) + ",\\quad \\rho=|w|^{1/" + m + "}=" + n(r)) + "</p>" +
        "<p>Fases: " + tex(fases.join(",\\ ")) + "</p>";
    }
    plW.asa(w, AZUL, "w", 1, dibuja);
    dibuja();
  };

  function argPrincipal(x, y) { return Math.atan2(y, x); }
  var LUGARES = [
    {
      nombre: "|z−2| > |z−2i|, |z| + Im z < 4",
      vista: { xmin: -11, xmax: 4, ymin: -11, ymax: 4, paso: 2 }, inicio: { re: 0, im: 1 }, salto: 0.25,
      conds: [
        { t: "|z-2|>|z-2i|", ok: function (x, y) { return Math.hypot(x - 2, y) > Math.hypot(x, y - 2); } },
        { t: "|z|+\\operatorname{Im}z<4", ok: function (x, y) { return Math.hypot(x, y) + y < 4; } }
      ]
    },
    {
      nombre: "|z−4i| + |z+4i| < 10, π/6 ≤ arg z ≤ π/3",
      vista: { xmin: -5, xmax: 5, ymin: -6, ymax: 6 }, inicio: { re: 1, im: 1 }, salto: 0.25,
      conds: [
        { t: "|z-4i|+|z+4i|<10", ok: function (x, y) { return Math.hypot(x, y - 4) + Math.hypot(x, y + 4) < 10; } },
        { t: "\\frac\\pi6\\le\\arg z\\le\\frac\\pi3", ok: function (x, y) { var a = argPrincipal(x, y); return (x !== 0 || y !== 0) && a >= PI / 6 && a <= PI / 3; } }
      ]
    },
    {
      nombre: "Re(1/(z−1)) > 1/2, Im(1/(z−1)) > 1/2",
      vista: { xmin: -1, xmax: 4, ymin: -3, ymax: 2, paso: 1 }, inicio: { re: 1.5, im: -0.5 }, salto: 0.25,
      conds: [
        { t: "\\operatorname{Re}\\frac{1}{z-1}>\\frac12", ok: function (x, y) { var m = (x - 1) * (x - 1) + y * y; return m > 0 && (x - 1) / m > 0.5; } },
        { t: "\\operatorname{Im}\\frac{1}{z-1}>\\frac12", ok: function (x, y) { var m = (x - 1) * (x - 1) + y * y; return m > 0 && -y / m > 0.5; } }
      ]
    }
  ];

  WIDGETS.lugares = function (c) {
    cabecera(c, "Explorar lugares geométricos", "Elige un lugar y arrastra $z$ para ver qué condiciones cumple. En azul y naranja, cada condición; más oscuro, las dos a la vez.");
    var ctr = h("div", "i-controles", c);
    var sel = h("select", "", ctr);
    sel.setAttribute("aria-label", "Lugar geométrico");
    LUGARES.forEach(function (l, i) {
      var o = h("option", "", sel, l.nombre);
      o.value = i;
    });
    var cont = h("div", "", c), lect = h("div", "i-lectura", c);
    function monta() {
      cont.textContent = "";
      var L = LUGARES[+sel.value], v = L.vista;
      var pl = Plano(cont, { xmin: v.xmin, xmax: v.xmax, ymin: v.ymin, ymax: v.ymax, paso: v.paso || 1, alt: L.nombre });
      // Región pintada por píxeles: sirve para cualquier condición.
      var lienzo = document.createElement("canvas");
      lienzo.width = 400; lienzo.height = Math.round(pl.H);
      var ctx = lienzo.getContext("2d"), img = ctx.createImageData(lienzo.width, lienzo.height);
      for (var j = 0; j < lienzo.height; j++) {
        for (var i = 0; i < lienzo.width; i++) {
          var x = v.xmin + (i + 0.5) / pl.esc, y = v.ymax - (j + 0.5) / pl.esc;
          var a = L.conds[0].ok(x, y), b = L.conds[1].ok(x, y), o = (j * lienzo.width + i) * 4, col = null;
          if (a && b) col = [200, 85, 61, 170];
          else if (a) col = [31, 63, 119, 38];
          else if (b) col = [230, 150, 60, 50];
          if (col) { img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = col[3]; }
        }
      }
      ctx.putImageData(img, 0, 0);
      var imagen = el("image", { x: 0, y: 0, width: pl.W, height: pl.H, href: lienzo.toDataURL() });
      pl.fondo.appendChild(imagen);
      var z = { re: L.inicio.re, im: L.inicio.im };
      function dibuja() {
        var filas = L.conds.map(function (cn) {
          var bien = cn.ok(z.re, z.im);
          return "<p>" + tex(cn.t) + ' <span style="color:' + (bien ? VERDE : "#b03a2e") + '">' + (bien ? "✓ se cumple" : "✗ no se cumple") + "</span></p>";
        });
        lect.innerHTML = "<p>" + tex("z=" + cx(z.re, z.im)) + "</p>" + filas.join("");
      }
      pl.asa(z, "#111", "z", L.salto, dibuja);
      dibuja();
    }
    sel.addEventListener("change", monta);
    monta();
  };

  // ---------- Practica ----------
  function montaPractica(c, generadores) {
    h("div", "i-titulo", c).innerHTML = '<span class="nuevo">†</span> Practica';
    var enun = h("div", "p-enunciado", c);
    var campos = h("div", "p-campos", c);
    var botones = h("div", "p-botones", c);
    var msg = h("div", "p-mensaje", c);
    msg.setAttribute("aria-live", "polite");
    var sol = h("div", "p-solucion", c);
    h("div", "p-formato", c).innerHTML = "Se admiten expresiones como " + tex("3\\pi/4") + " (<code>3pi/4</code>), " + tex("\\sqrt2/2") + " (<code>sqrt(2)/2</code>), <code>ln(2)</code>, <code>e^2</code> o decimales.";
    var ej, inputs, ultimo = -1;

    function nuevo() {
      var i;
      do { i = azar(0, generadores.length - 1); } while (generadores.length > 1 && i === ultimo);
      ultimo = i;
      ej = generadores[i]();
      enun.innerHTML = mezcla(ej.enun);
      campos.textContent = "";
      inputs = ej.campos.map(function (cp) {
        var l = h("label", "p-campo", campos);
        h("span", "", l).innerHTML = tex(cp.et + "=");
        var inp = h("input", "", l);
        inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false;
        inp.setAttribute("autocapitalize", "off");
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") comprobar(); });
        return inp;
      });
      msg.textContent = "";
      sol.hidden = true;
      sol.innerHTML = mezcla(ej.sol);
    }
    function comprobar() {
      var vals = inputs.map(function (x) { return leeReal(x.value); });
      var res = corrige(ej, vals);
      inputs.forEach(function (x, i) {
        x.classList.toggle("bien", res[i]);
        x.classList.toggle("mal", !res[i]);
      });
      if (res.every(Boolean)) {
        msg.innerHTML = '<span class="ok">Correcto.</span>';
        sol.hidden = false;
        return;
      }
      if (vals.some(isNaN)) {
        msg.innerHTML = '<span class="no">Hay alguna casilla vacía o que no se entiende.</span>';
        return;
      }
      var pista = ej.pista ? ej.pista(vals) : null;
      msg.innerHTML = '<span class="no">' + (pista ? mezcla(pista) : "Aún no. Revisa las casillas en rojo.") + "</span>";
    }
    function boton(t, principal, f) {
      var b = h("button", "boton" + (principal ? " principal" : ""), botones, t);
      b.type = "button";
      b.addEventListener("click", f);
    }
    boton("Comprobar", true, comprobar);
    boton("Ver solución", false, function () { sol.hidden = false; });
    boton("Otro con otros datos", false, nuevo);
    nuevo();
  }

  function arranca() {
    if (!window.katex) {
      document.querySelectorAll("[data-widget]").forEach(function (c) {
        c.textContent = "Esta pieza necesita conexión a internet para mostrar las fórmulas.";
      });
      return;
    }
    document.querySelectorAll("[data-widget]").forEach(function (c) {
      var nombre = c.getAttribute("data-widget");
      if (GENERADORES[nombre]) montaPractica(c, GENERADORES[nombre]);
      else WIDGETS[nombre](c);
    });
  }
  if (document.readyState === "complete") arranca();
  else window.addEventListener("load", arranca);
})(typeof globalThis !== "undefined" ? globalThis : this);
