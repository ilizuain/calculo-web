// Soluciones plegadas de ejemplos y ejercicios. Cada bloque de la solución es un
// paso: sale del .qmd sin marcas adicionales. Sin JavaScript se ve todo.
(function () {
  "use strict";
  var CLAVE = "apuntes-ver-soluciones";
  var soluciones = [];

  function preparar(sol) {
    var bloques = Array.prototype.slice.call(sol.children);
    var vistos = 0;
    var controles = document.createElement("div");
    controles.className = "solucion-controles";
    sol.appendChild(controles);

    function boton(texto, principal, accion) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "boton" + (principal ? " principal" : "");
      b.textContent = texto;
      b.addEventListener("click", accion);
      controles.appendChild(b);
    }
    function pinta() {
      bloques.forEach(function (x, n) { x.hidden = n >= vistos; });
      controles.textContent = "";
      var total = bloques.length;
      if (vistos === 0) {
        boton("Ver solución", true, function () { vistos = total; pinta(); });
        if (total > 1) boton("Paso a paso", false, function () { vistos = 1; pinta(); });
      } else if (vistos < total) {
        boton("Siguiente paso (" + vistos + "/" + total + ")", true, function () { vistos++; pinta(); });
        boton("Ver el resto", false, function () { vistos = total; pinta(); });
        boton("Ocultar", false, function () { vistos = 0; pinta(); });
      } else {
        boton("Ocultar solución", false, function () { vistos = 0; pinta(); });
      }
    }
    pinta();
    return {
      elemento: sol,
      abrir: function () { vistos = bloques.length; pinta(); },
      cerrar: function () { vistos = 0; pinta(); }
    };
  }

  // Un enlace a una figura que está dentro de una solución plegada la abre.
  function abrirDestino() {
    if (!location.hash) return;
    var destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!destino) return;
    soluciones.forEach(function (s) {
      if (s.elemento.contains(destino)) {
        s.abrir();
        destino.scrollIntoView();
      }
    });
  }

  function leer() { try { return localStorage.getItem(CLAVE) === "1"; } catch (e) { return false; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v ? "1" : "0"); } catch (e) { /* sin almacenamiento */ } }

  document.querySelectorAll(".solucion").forEach(function (s) { soluciones.push(preparar(s)); });
  if (soluciones.length) {
    var barra = document.createElement("div");
    barra.className = "barra-soluciones";
    barra.innerHTML = '<label><input type="checkbox"> Mostrar todas las soluciones</label>' +
      '<a class="boton" href="complejos.pdf">Descargar en PDF</a>';
    var casilla = barra.querySelector("input");
    casilla.checked = leer();
    if (casilla.checked) soluciones.forEach(function (s) { s.abrir(); });
    casilla.addEventListener("change", function () {
      guardar(casilla.checked);
      soluciones.forEach(function (s) { casilla.checked ? s.abrir() : s.cerrar(); });
    });
    var cabecera = document.querySelector("#title-block-header") || document.querySelector("main h1");
    if (cabecera) cabecera.parentNode.insertBefore(barra, cabecera.nextSibling);
  }
  window.addEventListener("hashchange", abrirDestino);
  abrirDestino();
})();
