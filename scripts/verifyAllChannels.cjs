const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function checkCdx(slug) {
  return new Promise(resolve => {
    const url = `https://epiembeds.online/embed/${slug}`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 3500 }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 && d.length > 500;
        resolve({ ok, slug, url, status: res.statusCode, length: d.length });
      });
    });
    req.on('error', () => resolve({ ok: false, slug }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, slug }); });
  });
}

async function run() {
  const data = await fetchJson('https://timstreams.st/api/channels');
  if (!data || !data.channels) {
    console.log('No channels fetched');
    return;
  }

  console.log(`Verifying all ${data.channels.length} channels against CDX...`);
  const verifiedList = [];

  for (let i = 0; i < data.channels.length; i++) {
    const c = data.channels[i];
    const rawSlug = c.url;
    const flag = c.flag || 'us';
    const cleanRaw = rawSlug.replace(/[^a-z0-9]+/g, '');
    const directStream = (c.streams && c.streams[0]) ? c.streams[0].url.replace('https://epiembeds.online/embed/', '') : null;

    const candidates = [
      directStream,
      `${rawSlug}-${flag}`,
      `${rawSlug.replace(/-/g, '')}-${flag}`,
      rawSlug,
      `${rawSlug}-usa`,
      `${rawSlug}-uk`,
      `${rawSlug}-es`,
      `${rawSlug}-de`,
      `${rawSlug}-nz`,
      `${rawSlug}-au`,
      `${cleanRaw}-${flag}`,
      `${cleanRaw}-usa`,
      cleanRaw
    ].filter(Boolean);

    let foundUrl = null;
    let foundSlug = null;

    for (const cand of candidates) {
      const check = await checkCdx(cand);
      if (check.ok) {
        foundUrl = check.url;
        foundSlug = cand;
        break;
      }
    }

    // Sanitize any nested prefixes
    if (foundUrl.includes('https://epiembeds.online/embed/http')) {
      foundUrl = foundUrl.replace('https://epiembeds.online/embed/http://epiembeds.online/embed/', 'https://epiembeds.online/embed/');
    }
    if (foundUrl.includes('https://epiembeds.online/embed/https://')) {
      foundUrl = foundUrl.replace('https://epiembeds.online/embed/https://epiembeds.online/play/', 'https://epiembeds.online/embed/');
    }

    const item = {
      id: `cdx_${rawSlug.replace(/[^a-z0-9]+/g, '_')}`,
      slug: rawSlug,
      cdxSlug: foundSlug,
      name: c.name || rawSlug,
      title: c.name || rawSlug,
      image: c.logo || '',
      flag: flag,
      category: c.genre === 2 ? 'Sports' : c.genre === 3 ? 'Cartoons' : c.genre === 4 ? 'News' : 'Entertainment',
      genre: c.genre === 2 ? 'Sports' : c.genre === 3 ? 'Cartoons' : c.genre === 4 ? 'News' : 'Entertainment',
      viewers: c.viewers || Math.floor(Math.random() * 4) + 1,
      embedUrl: foundUrl,
      iframeHtml: `<iframe src="${foundUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`,
      decoded_channels: [
        {
          title: `${c.name || rawSlug} (CDX Ultra HD)`,
          link: foundUrl,
          type: '0'
        },
        {
          title: `${c.name || rawSlug} (Server 2 - Mirror)`,
          link: `https://embed.st/embed/admin/${rawSlug}/1`,
          type: '0'
        }
      ]
    };

    verifiedList.push(item);
    console.log(`[${i + 1}/${data.channels.length}] ${item.name} (${item.flag}) -> ${foundUrl}`);
  }

  // Save full master verified catalog
  const catalogPath = path.join(__dirname, '..', 'src', 'api', 'cdxChannelsCatalog.js');
  const fileContent = `import { apiCache } from './cache';

/**
 * Standard iframe embed template helper
 */
export const createCdxIframeEmbed = (embedUrl) => {
  return \`<iframe src="\${embedUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>\`;
};

/**
 * Complete Master Verified Catalog of ${verifiedList.length} Channels (Sports, Entertainment, Movies, Cartoons, News)
 * Direct href /channel/:slug routing with verified CDX embeds and multi-mirror failover
 */
export const CDX_USA_WORLD_CHANNELS = ${JSON.stringify(verifiedList, null, 2)};

export const fetchCdxChannels = (category = 'all') => {
  if (category === 'all') return CDX_USA_WORLD_CHANNELS;
  return CDX_USA_WORLD_CHANNELS.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
};

export const fetchCdxSportsByRegion = (region = 'all') => {
  const sports = CDX_USA_WORLD_CHANNELS.filter(c => c.genre === 'Sports');
  if (region === 'all') return sports;
  if (region === 'us') return sports.filter(c => c.flag === 'us');
  if (region === 'gb') return sports.filter(c => c.flag === 'gb' || c.flag === 'ie');
  if (region === 'eu') return sports.filter(c => ['es', 'de', 'it', 'pt', 'pl', 'fr'].includes(c.flag));
  if (region === 'au') return sports.filter(c => ['au', 'nz'].includes(c.flag));
  if (region === 'combat') return sports.filter(c => c.slug.includes('ufc') || c.slug.includes('fight') || c.slug.includes('motogp') || c.slug.includes('racer'));
  if (region === 'cricket') return sports.filter(c => c.slug.includes('cricket') || c.slug.includes('willow') || c.slug.includes('501'));
  return sports;
};
`;

  fs.writeFileSync(catalogPath, fileContent);
  console.log(`\nSuccessfully verified and written ${verifiedList.length} channels to ${catalogPath}`);
}

run();
