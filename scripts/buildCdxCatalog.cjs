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

async function build() {
  const data = await fetchJson('https://timstreams.st/api/channels');
  if (!data || !data.channels) {
    console.log('Error: no channels');
    return;
  }

  const allChannels = data.channels.map(c => {
    const slug = c.url;
    const name = c.name || slug;
    const logo = c.logo || '';
    const flag = c.flag || 'us';
    const rawUrl = (c.streams && c.streams[0]) ? c.streams[0].url : `https://cdx-08192.website/embed/${slug}`;
    
    let category = 'Entertainment';
    let genre = 'Entertainment';
    const nLower = name.toLowerCase();
    const sLower = slug.toLowerCase();

    if (c.genre === 2 || nLower.includes('sport') || nLower.includes('espn') || nLower.includes('dazn') || nLower.includes('golf') || nLower.includes('tennis') || nLower.includes('cricket') || nLower.includes('willow') || nLower.includes('racing') || nLower.includes('fight') || nLower.includes('ufc') || nLower.includes('motogp') || nLower.includes('nba') || nLower.includes('nfl') || nLower.includes('nhl') || nLower.includes('mlb') || nLower.includes('tudn') || nLower.includes('tyc') || nLower.includes('footy') || nLower.includes('league') || nLower.includes('go3') || nLower.includes('polsat') || nLower.includes('canal+') || nLower.includes('movistar deportes') || nLower.includes('bein sports') || nLower.includes('eleven')) {
      category = 'Sports';
      genre = 'Sports';
    } else if (c.genre === 3 || nLower.includes('cartoon') || nLower.includes('disney') || nLower.includes('nick') || nLower.includes('boomerang') || nLower.includes('cbeebies') || nLower.includes('teenick') || nLower.includes('family')) {
      category = 'Cartoons';
      genre = 'Cartoons';
    } else if (c.genre === 4 || nLower.includes('news') || nLower.includes('weather') || nLower.includes('cnbc')) {
      category = 'News';
      genre = 'News';
    } else if (nLower.includes('hbo') || nLower.includes('showtime') || nLower.includes('starz') || nLower.includes('cinemax') || nLower.includes('movie')) {
      category = 'Movies';
      genre = 'Movies';
    }

    let region = 'us';
    if (flag === 'gb' || sLower.includes('-uk') || nLower.includes('bbc') || nLower.includes('tnt sports')) region = 'gb';
    else if (flag === 'au' || sLower.includes('501') || sLower.includes('502') || sLower.includes('503') || sLower.includes('504') || sLower.includes('505') || sLower.includes('506') || sLower.includes('507')) region = 'au';
    else if (flag === 'nz' || sLower.includes('-nz')) region = 'nz';
    else if (flag === 'ie' || sLower.includes('-ie')) region = 'ie';
    else if (flag === 'es' || sLower.includes('-es') || nLower.includes('movistar') || nLower.includes('laliga')) region = 'es';
    else if (flag === 'de' || sLower.includes('-de')) region = 'de';
    else if (flag === 'it' || sLower.includes('-it') || sLower.includes('italia')) region = 'it';
    else if (flag === 'pt' || sLower.includes('-pt') || sLower.includes('portugal')) region = 'pt';
    else if (flag === 'pl' || sLower.includes('-pl') || nLower.includes('polsat') || nLower.includes('canal+')) region = 'pl';
    else if (flag === 'fr' || sLower.includes('-fr') || nLower.includes('francais')) region = 'fr';

    return {
      id: `cdx_${slug.replace(/[^a-z0-9]+/g, '_')}`,
      slug: slug,
      href: `/channel/${slug}`,
      name: name,
      title: name,
      image: logo,
      flag: flag,
      region: region,
      category: category,
      genre: genre,
      viewers: c.viewers || Math.floor(Math.random() * 5) + 1,
      embedUrl: rawUrl,
      decoded_channels: [
        {
          title: `${name} (CDX Ultra HD)`,
          link: rawUrl,
          type: '0'
        },
        {
          title: `${name} (Server 2 - Mirror)`,
          link: `https://embed.st/embed/admin/${slug}/1`,
          type: '0'
        }
      ]
    };
  });

  const targetPath = path.join(__dirname, '..', 'src', 'api', 'cdxChannelsCatalog.js');
  const code = `import { apiCache } from './cache';

/**
 * Standard iframe embed template helper
 */
export const createCdxIframeEmbed = (embedUrl) => {
  return \`<iframe src="\${embedUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>\`;
};

/**
 * Complete Master Catalog of 168+ Channels (Sports, Entertainment, Movies, Cartoons, News)
 * Direct href /channel/:slug routing with multi-mirror failover
 */
export const CDX_USA_WORLD_CHANNELS = ${JSON.stringify(allChannels, null, 2)};

export const fetchCdxChannels = (category = 'all') => {
  if (category === 'all') return CDX_USA_WORLD_CHANNELS;
  return CDX_USA_WORLD_CHANNELS.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
};

export const fetchCdxSportsByRegion = (region = 'all') => {
  const sports = CDX_USA_WORLD_CHANNELS.filter(c => c.genre === 'Sports');
  if (region === 'all') return sports;
  if (region === 'us') return sports.filter(c => c.region === 'us');
  if (region === 'gb') return sports.filter(c => c.region === 'gb' || c.region === 'ie');
  if (region === 'eu') return sports.filter(c => ['es', 'de', 'it', 'pt', 'pl', 'fr'].includes(c.region));
  if (region === 'au') return sports.filter(c => ['au', 'nz'].includes(c.region));
  if (region === 'combat') return sports.filter(c => c.slug.includes('ufc') || c.slug.includes('fight') || c.slug.includes('motogp') || c.slug.includes('racer'));
  if (region === 'cricket') return sports.filter(c => c.slug.includes('cricket') || c.slug.includes('willow') || c.slug.includes('501'));
  return sports;
};
`;

  fs.writeFileSync(targetPath, code);
  console.log(`Generated ${allChannels.length} channels in ${targetPath}`);
}

build();
