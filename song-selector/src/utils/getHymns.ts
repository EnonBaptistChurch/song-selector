export async function getHymns() {
  let url: string;

  if (import.meta.env.PROD) {
    // Production always uses the built JSON
    url = '/song-selector/data/Hymns.json';
  } else {
    // Dev mode
    if (import.meta.env.HYMNS_JSON_URL) {
      url = import.meta.env.HYMNS_JSON_URL; // e.g. /src/dev-data/Hymns.json
    } else {
      // Fallback: pull from GitHub raw
      url = 'https://raw.githubusercontent.com/EnonBaptistChurch/church-data/main/song-selector/Hymns.json';
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch hymns from ${url}`);
  return res.json();
}
