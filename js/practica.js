// Recuadros «Practica»: datos que cambian y corrección del resultado. Lo usan los archivos
// de cada capítulo, que solo aportan los generadores de ejercicios. La lógica no toca el DOM,
// para poder probarla aparte.
(function (raiz) {
  "use strict";
  var PI = Math.PI;

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
  // Fracción p/q simplificada, en LaTeX.
  function fr(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = mcd(p, q);
    p /= g; q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? "-" : "") + "\\frac{" + Math.abs(p) + "}{" + q + "}";
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
  // Casilla numérica que también admite «no». Si la respuesta es «no», v es Infinity.
  function campoONo(et, v) {
    return {
      et: et, v: v, modo: "real",
      lee: function (t) { return /^\s*no\s*$/i.test(t) ? Infinity : leeReal(t); }
    };
  }

  // Compara lo escrito con la solución, campo a campo.
  var TOL = 0.006;
  function corrige(ej, vals) {
    if (ej.comprobar) return ej.comprobar(vals);
    return ej.campos.map(function (c, i) {
      if (isNaN(vals[i])) return false;
      return c.modo === "fase" ? mismoAngulo(vals[i], c.v, TOL) : (vals[i] === c.v || Math.abs(vals[i] - c.v) < TOL);
    });
  }

  // ---------- Página ----------
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

  function montaPractica(c, generadores, formato) {
    h("div", "i-titulo", c).textContent = "Practica";
    var enun = h("div", "p-enunciado", c);
    var campos = h("div", "p-campos", c);
    var botones = h("div", "p-botones", c);
    var msg = h("div", "p-mensaje", c);
    msg.setAttribute("aria-live", "polite");
    var sol = h("div", "p-solucion", c);
    h("div", "p-formato", c).innerHTML = formato();
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
      var vals = inputs.map(function (x, i) { return (ej.campos[i].lee || leeReal)(x.value); });
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

  // Registra las piezas de un capítulo. formato() da la nota sobre lo que se puede escribir.
  function arranca(generadores, widgets, formato) {
    function monta() {
      if (!window.katex) {
        document.querySelectorAll("[data-widget]").forEach(function (c) {
          c.textContent = "Esta pieza necesita conexión a internet para mostrar las fórmulas.";
        });
        return;
      }
      document.querySelectorAll("[data-widget]").forEach(function (c) {
        var nombre = c.getAttribute("data-widget");
        if (generadores[nombre]) montaPractica(c, generadores[nombre], formato);
        else widgets[nombre](c);
      });
    }
    if (document.readyState === "complete") monta();
    else window.addEventListener("load", monta);
  }

  raiz.Practica = {
    azar: azar, elige: elige, noCero: noCero, mcd: mcd, norm: norm, mismoAngulo: mismoAngulo, fr: fr,
    leeReal: leeReal, campoONo: campoONo, corrige: corrige, h: h, tex: tex, mezcla: mezcla, arranca: arranca
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
