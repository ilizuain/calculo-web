// Practica del capítulo 2.
(function (raiz) {
  "use strict";
  var P = raiz.Practica, elige = P.elige, fr = P.fr;

  function base(p, q) {
    if (q === 1) return p < 0 ? "(" + p + ")" : String(p);
    return "\\left(" + fr(p, q) + "\\right)";
  }

  // Serie geométrica, con índice inicial m y factor c.
  function genGeometrica() {
    var r = Math.random() < 0.75 ?
      elige([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [3, 4], [-3, 4], [2, 5]]) :
      elige([[3, 2], [-3, 2], [2, 1], [-2, 1], [3, 1], [-1, 1], [5, 4]]);
    var p = r[0], q = r[1], c = elige([1, 2, 3, 4, 5, 6]), m = elige([0, 1, 2]);
    var rt = fr(p, q);
    var enun = "Estudiar si converge $\\displaystyle\\sum_{n=" + m + "}^\\infty " + (c === 1 ? "" : c + "\\,") + base(p, q) +
      "^n$ y, si converge, hallar su suma $S$. Si no converge, escribe <code>no</code>.";
    if (Math.abs(p) >= q) {
      return {
        d: { c: c, m: m, p: p, q: q, S: Infinity }, enun: enun,
        campos: [P.campoONo("S", Infinity)],
        sol: "Aquí $r=" + rt + "$, con $|r|\\ge1$, así que los términos no tienden a 0 y la serie no converge."
      };
    }
    var num = c * Math.pow(p, m) * q, den = Math.pow(q, m) * (q - p);
    var pn = c * Math.pow(p, m), pd = Math.pow(q, m);
    var mal = c / (1 - p / q);
    return {
      d: { c: c, m: m, p: p, q: q, S: num / den }, enun: enun,
      campos: [P.campoONo("S", num / den)],
      pista: function (vals) {
        if (vals[0] === Infinity) return "Comprueba el valor de $|r|$.";
        if (m > 0 && Math.abs(vals[0] - mal) < 0.006) return "El numerador es el primer término de la serie, y esta no empieza en $n=0$.";
        return null;
      },
      sol: "Aquí $r=" + rt + "$, con $|r|<1$, así que converge. El primer término es $" + fr(pn, pd) + "$, y entonces $S=\\dfrac{" + fr(pn, pd) + "}{1" + (p > 0 ? "-" + rt : "-(" + rt + ")") + "}=" + fr(num, den) + "$."
    };
  }

  var GENERADORES = { "practica-geometrica": [genGeometrica] };
  raiz.SucesionesLogica = { GENERADORES: GENERADORES };
  if (typeof document === "undefined") return;
  P.arranca(GENERADORES, {}, function () {
    return "Se admiten fracciones como " + P.tex("4/3") + " (<code>4/3</code>) y decimales como <code>1,33</code>, con dos cifras decimales.";
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
