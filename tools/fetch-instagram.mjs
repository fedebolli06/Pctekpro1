// Fetch latest Instagram media via Basic Display API and write static JSON
// Requires env IG_ACCESS_TOKEN (long-lived). Optional IG_USER_ID and IG_LIMIT.

import { writeFile } from 'node:fs/promises';

const token = process.env.IG_ACCESS_TOKEN;
const userId = process.env.IG_USER_ID || '';
const limit = parseInt(process.env.IG_LIMIT || '9', 10);

if (!token) {
  console.error('Missing IG_ACCESS_TOKEN env var');
  process.exit(1);
}

const base = 'https://graph.instagram.com';
const path = userId ? `/${encodeURIComponent(userId)}/media` : '/me/media';
const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
const url = `${base}${path}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}&limit=${limit}`;

async function main() {
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Instagram API ${r.status}: ${text}`);
  }
  const json = await r.json();
  const items = Array.isArray(json.data) ? json.data.map((it) => ({
    id: it.id,
    media_type: it.media_type,
    media_url: it.media_url,
    thumbnail_url: it.thumbnail_url || '',
    permalink: it.permalink,
    caption: it.caption || '',
    timestamp: it.timestamp
  })) : [];

  const out = { data: items };
  await writeFile('assets/instagram-feed.json', JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote assets/instagram-feed.json with ${items.length} items`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });

