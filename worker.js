/*
  ALPINE ET — website Worker. Serves the site files and live benchmark prices at /api/prices.

  Needs two free keys, saved in Cloudflare (never in GitHub):
    Cloudflare dashboard > Workers & Pages > alpine-energy-website > Settings > Variables and Secrets
      EIA_API_KEY          free from https://www.eia.gov/opendata/register.php
      OILPRICEAPI_KEY      free from https://www.oilpriceapi.com (optional, gives intraday Brent/WTI)

  Results are cached for 3 hours, so the free limits are never reached.
*/
const CACHE_SECONDS = 3 * 60 * 60;

const EIA_SERIES = [
  { id: 'RBRTE', code: 'BRENT', short: 'BRENT', name: 'Brent crude', desc: 'International crude benchmark, spot', unit: 'USD/bbl', featured: true },
  { id: 'RWTC', code: 'WTI', short: 'WTI', name: 'WTI crude', desc: 'US crude benchmark, Cushing spot', unit: 'USD/bbl', featured: true },
  { id: 'EER_EPD2DXL0_PF4_Y35NY_DPG', code: 'ULSD', short: 'ULSD', name: 'Diesel (ULSD)', desc: 'Ultra-low sulphur diesel, NY Harbor spot', unit: 'USD/gal', featured: true },
  { id: 'EER_EPJK_PF4_RGC_DPG', code: 'JET', short: 'JET', name: 'Jet fuel', desc: 'Kerosene-type jet fuel, US Gulf Coast spot', unit: 'USD/gal', featured: true },
  { id: 'EER_EPMRU_PF4_Y35NY_DPG', code: 'GASOLINE', short: 'GASOLINE', name: 'Gasoline', desc: 'Conventional regular gasoline, NY Harbor spot', unit: 'USD/gal' },
  { id: 'EER_EPD2F_PF4_Y35NY_DPG', code: 'HEATOIL', short: 'HEATING OIL', name: 'Heating oil', desc: 'No. 2 heating oil, NY Harbor spot', unit: 'USD/gal' },
  { id: 'EER_EPLLPA_PF4_Y44MB_DPG', code: 'PROPANE', short: 'PROPANE', name: 'Propane', desc: 'Mont Belvieu, TX spot', unit: 'USD/gal' }
];

const fmtDate = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

async function fromEIA(key) {
  const p = new URLSearchParams({ api_key: key, frequency: 'daily', 'data[0]': 'value', 'sort[0][column]': 'period', 'sort[0][direction]': 'desc', length: '200' });
  EIA_SERIES.forEach((s) => p.append('facets[series][]', s.id));
  const r = await fetch('https://api.eia.gov/v2/petroleum/pri/spt/data/?' + p.toString());
  if (!r.ok) throw new Error('EIA ' + r.status);
  const rows = (await r.json()).response.data || [];
  return EIA_SERIES.map((s) => {
    const pts = rows.filter((x) => x.series === s.id && x.value != null).slice(0, 2);
    if (!pts.length) return null;
    const price = Number(pts[0].value), prev = pts[1] ? Number(pts[1].value) : null;
    return { code: s.code, short: s.short, name: s.name, desc: s.desc, unit: s.unit, featured: !!s.featured, price, prev, change: prev != null ? +(price - prev).toFixed(4) : null, asOf: fmtDate(pts[0].period), source: 'U.S. EIA' };
  }).filter(Boolean);
}

async function fromOilPriceAPI(key) {
  const r = await fetch('https://api.oilpriceapi.com/v1/prices/latest?by_code=BRENT_CRUDE_USD,WTI_USD', { headers: { Authorization: 'Token ' + key } });
  if (!r.ok) throw new Error('OPA ' + r.status);
  const j = await r.json();
  const list = (j.data && (j.data.prices || [j.data])) || [];
  const out = {};
  list.forEach((x) => {
    const code = x.code === 'BRENT_CRUDE_USD' ? 'BRENT' : x.code === 'WTI_USD' ? 'WTI' : null;
    if (code && x.price != null) out[code] = { price: Number(x.price), asOf: x.created_at ? new Date(x.created_at).toUTCString().slice(5, 22) + ' UTC' : '', source: 'OilPriceAPI (futures)' };
  });
  return out;
}

async function prices(request, env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/prices?v=1', request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let items = [];
  const errors = [];
  if (env.EIA_API_KEY) { try { items = await fromEIA(env.EIA_API_KEY); } catch (e) { errors.push(String(e.message || e)); } }
  if (env.OILPRICEAPI_KEY) {
    try {
      const live = await fromOilPriceAPI(env.OILPRICEAPI_KEY);
      items = items.map((it) => {
        const l = live[it.code]; if (!l) return it;
        const base = it.price;
        return Object.assign({}, it, { price: l.price, prev: base, change: +(l.price - base).toFixed(2), asOf: l.asOf, source: l.source + ' · change vs EIA last close' });
      });
    } catch (e) { errors.push(String(e.message || e)); }
  }
  if (!items.length) {
    return new Response(JSON.stringify({ error: 'No price source available', details: errors }), { status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  const body = JSON.stringify({ sample: false, updated: new Date().toISOString(), items, note: 'Indicative public benchmarks, not an offer to buy or sell.' });
  const res = new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=' + CACHE_SECONDS } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/prices') return prices(request, env, ctx);
    return env.ASSETS.fetch(request);
  }
};
