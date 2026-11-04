// Soluciones plegadas de ejemplos y ejercicios. Cada bloque de la solución es un
// paso: sale del .qmd sin marcas adicionales. Sin JavaScript se ve todo.
(function () {
  "use strict";
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

  document.querySelectorAll(".solucion").forEach(function (s) { soluciones.push(preparar(s)); });

  // El PDF del capítulo, al final del menú lateral. No va en _quarto.yml porque
  // entonces sería la «página siguiente» de la última sección.
  var menu = document.querySelector("#quarto-sidebar .sidebar-menu-container > ul");
  if (menu && window.PDF_CAPITULO) {
    var item = document.createElement("li");
    item.className = "sidebar-item";
    item.style.marginTop = "0.8rem";
    item.innerHTML = '<div class="sidebar-item-container"><a class="sidebar-item-text sidebar-link" download href="' +
      window.PDF_CAPITULO + '"><span class="menu-text">Descargar capítulo como PDF</span></a></div>';
    menu.appendChild(item);
  }
  // El capítulo actual, en la barra superior y en la miga de pan del móvil. Se toma
  // de la primera entrada del menú lateral. Sin JavaScript, la barra dice «Capítulos».
  var capitulo = document.querySelector("#quarto-sidebar .sidebar-menu-container > ul > li:first-child a");
  if (capitulo) {
    var nombre = capitulo.textContent.trim();
    var desplegable = document.querySelector(".navbar .dropdown-toggle .menu-text");
    if (desplegable) desplegable.textContent = nombre;
    var migas = document.querySelector(".quarto-page-breadcrumbs .breadcrumb");
    if (migas && !capitulo.classList.contains("active")) {
      var miga = document.createElement("li");
      miga.className = "breadcrumb-item";
      var enlace = document.createElement("a");
      enlace.href = capitulo.getAttribute("href");
      enlace.textContent = nombre;
      miga.appendChild(enlace);
      migas.insertBefore(miga, migas.firstChild);
    }
  }
  // El número de la sección, en el título del índice de la derecha.
  var seccion = document.querySelector("#quarto-sidebar .sidebar-link.active");
  var tituloIndice = document.getElementById("toc-title");
  var numero = seccion && seccion.textContent.trim().match(/^\d+\.\d+/);
  if (tituloIndice && numero) tituloIndice.textContent = "En la sección " + numero[0];
  window.addEventListener("hashchange", abrirDestino);
  abrirDestino();
})();
