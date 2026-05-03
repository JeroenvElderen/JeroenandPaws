import fs from 'node:fs';
import path from 'node:path';

const siteUrl = 'https://jeroenandpaws.com';
const pagesDir = path.join(process.cwd(), 'pages');
const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');

const ignored = new Set(['_app.jsx', '_document.jsx', '404.jsx']);
const exts = new Set(['.js', '.jsx']);

const toUrlPath = (absolutePath) => {
  const relative = path.relative(pagesDir, absolutePath).replace(/\\/g, '/');
  const noExt = relative.replace(/\.(js|jsx)$/, '');
  if (noExt === 'index') {
    return '/';
  }
  if (noExt.endsWith('/index')) {
    return `/${noExt.replace(/\/index$/, '')}`;
  }
  return `/${noExt}`;
};

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'api') {
        return [];
      }
      return walk(full);
    }
    if (!exts.has(path.extname(entry.name)) || ignored.has(entry.name)) {
      return [];
    }
    return [full];
  });
};

const now = new Date().toISOString();
const urls = walk(pagesDir)
  .map(toUrlPath)
  .filter((url) => !url.includes('style-guide'))
  .sort((a, b) => a.localeCompare(b));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((url) => `  <url><loc>${siteUrl}${url === '/' ? '' : url}</loc><lastmod>${now}</lastmod></url>`)
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(outputPath, xml, 'utf8');
console.log(`Generated sitemap with ${urls.length} URLs at ${outputPath}`);
