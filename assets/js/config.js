/*
  ALPINE ET — site settings. Edit the values below; nothing else needs changing.

  ZOHO FORMS
  1. In Zoho Forms (forms.zoho.com) create three forms: Contact, Buyer Inquiry, Supplier Inquiry.
  2. For each: Share > Embed > copy the "iframe" link (it looks like https://forms.zohopublic.com/...).
  3. Paste each link between the quotes below and save. The website will show the Zoho form.
  Until a link is filled in, the website shows its own form, which opens an email to info@ instead.
*/
window.ALPINE_CONFIG = {
  email: "info@alpineenergytrading.com",
  phone: "[+92 PHONE]",          // e.g. "+92 300 1234567"
  whatsapp: "",                 // digits only, e.g. "923001234567" (leave empty to hide)
  address: "[Office address], Pakistan",
  zohoForms: {
    contact: "",
    buyer: "",
    supplier: ""
  },
  // Where live prices come from. On Cloudflare this is the built-in /api/prices function.
  pricesUrl: "/api/prices",
  pricesFallback: "data/prices-sample.json"
};
