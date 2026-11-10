(function () {
  var C = window.AET, here = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
  var live = C.pages.filter(function (p) { return p.live; });
  var link = function (p) { return '<a href="' + p.href + '"' + (p.href.replace(/\.html$/, "") === here ? ' aria-current="page"' : "") + ">" + p.label + "</a>"; };
  var h = document.getElementById("site-header");
  if (h) {
    h.className = "site";
    h.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><img src="assets/img/logo-mark.png" alt="">' + C.name +
      '</a><button class="menu" aria-expanded="false" aria-controls="nav">Menu</button><nav class="main" id="nav" aria-label="Main"><ul>' +
      live.map(function (p) { return "<li>" + link(p) + "</li>"; }).join("") + "</ul></nav></div>";
    var b = h.querySelector(".menu"), n = h.querySelector("nav");
    b.addEventListener("click", function () { var o = n.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
  }
  var f = document.getElementById("site-footer");
  if (f) {
    var rows = [];
    if (C.legalName) rows.push(C.legalName);
    if (C.secpNumber) rows.push("SECP registration: " + C.secpNumber);
    if (C.address) rows.push(C.address);
    if (C.email) rows.push('<a href="mailto:' + C.email + '">' + C.email + "</a>");
    if (C.phone) rows.push(C.phone);
    if (C.linkedin) rows.push('<a href="' + C.linkedin + '" rel="noopener">LinkedIn</a>');
    f.className = "site";
    f.innerHTML = '<div class="wrap"><div class="fg"><div><span class="logo-f"><img src="assets/img/logo-stacked.png" alt="' + C.name + '"></span>' +
      "<p>An independent brokerage introducing buyers and sellers of crude oil and refined fuels.</p></div>" +
      "<div><h3>Pages</h3><ul>" + live.map(function (p) { return "<li>" + link(p) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h3>Company</h3><ul>" + rows.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul></div></div>" +
      '<p class="fine">' + C.name + " acts as an intermediary only. Nothing on this site is an offer to buy or sell any product. &copy; " +
      new Date().getFullYear() + " " + (C.legalName || C.name) + ".</p></div>";
  }
})();
