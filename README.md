# ALPINE ET website (alpineenergytrading.com)

Plain HTML site for Cloudflare Pages. There is no build step: the files in this folder are the website.

## Everyday edits
| What | File |
|---|---|
| Email, phone, WhatsApp, address, Zoho form links | `assets/js/config.js` |
| Current offers / buyer requirements | `data/offers.json` |
| Page text | the `.html` files |
| Logo | `assets/img/alpine-et-mark.svg`, `favicon.svg` |

Edit a file on GitHub (pencil icon), then click **Commit changes**. Cloudflare publishes it within about a minute.

## Live prices (Market Intelligence)
`functions/api/prices.js` fetches the prices. Add these in Cloudflare > Workers & Pages > (this site) > Settings > Variables and Secrets, as type **Secret**:
- `EIA_API_KEY`: free key from https://www.eia.gov/opendata/register.php
- `OILPRICEAPI_KEY`: free key from https://www.oilpriceapi.com (optional)

Then redeploy. Until the keys are added, the site shows clearly labelled sample figures.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (empty)
- Build output directory: `/` (or leave empty)

`_headers` holds the security rules (it allows Google Fonts and Zoho Forms). `_redirects` sends the old page addresses to the new pages.

## Photos
Put real photos in `assets/img/photos/` with exactly these names (JPG, about 2400px wide, under 500 KB each):
| File | Used on |
|---|---|
| `hero.jpg` | Home page, top |
| `tanker.jpg` | Home band, Current Offers, Buyer inquiry |
| `refinery.jpg` | About band, Products |
| `terminal.jpg` | Market Intelligence, Insights, Supplier inquiry |
| `port.jpg` | About, How We Work, Contact |
A missing photo is simply skipped, and the page keeps its navy design.
