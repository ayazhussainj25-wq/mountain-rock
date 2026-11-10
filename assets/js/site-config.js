/* Single source of company facts. Fill in once; header, footer, About and the print profile read from here.
   Empty values are simply not shown on the site. */
window.AET = {
  name: "Alpine Energy Trading",
  legalName: "",      // exact name as on the SECP certificate
  secpNumber: "",     // SECP registration / CUIN
  address: "",        // registered office
  email: "",          // official email, e.g. the Zoho address that receives inquiries
  phone: "",
  linkedin: "",       // full LinkedIn company page URL
  pages: [            // live:false pages are hidden from navigation until built
    { href: "index.html", label: "Home", live: true },
    { href: "what-we-do.html", label: "What we do", live: true },
    { href: "how-we-work.html", label: "How we work", live: false },
    { href: "compliance.html", label: "Compliance", live: false },
    { href: "products.html", label: "Products", live: false },
    { href: "market-insights.html", label: "Market insights", live: false },
    { href: "about.html", label: "About", live: false },
    { href: "contact.html", label: "Contact", live: false }
  ]
};
