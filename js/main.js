(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var filterBar = document.querySelector(".gallery-filter");
  if (filterBar) {
    var items = document.querySelectorAll(".gallery-grid [data-category]");
    filterBar.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-filter]");
      if (!btn) {
        return;
      }

      var filter = btn.getAttribute("data-filter");
      var buttons = filterBar.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("is-active", buttons[i] === btn);
      }

      for (var j = 0; j < items.length; j++) {
        var cat = items[j].getAttribute("data-category");
        var show = filter === "all" || filter === cat;
        items[j].classList.toggle("is-hidden", !show);
      }
    });
  }

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
