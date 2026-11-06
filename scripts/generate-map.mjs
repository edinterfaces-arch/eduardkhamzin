import { readFile, writeFile } from 'node:fs/promises';
import { feature } from 'topojson-client';
import { geoContains, geoNaturalEarth1 } from 'd3-geo';
import { demo } from '../src/content.js';

const topology = JSON.parse(await readFile(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url), 'utf8'));
const countries = feature(topology, topology.objects.countries).features.filter(f => f.properties.name !== 'Antarctica');
const collection = { type: 'FeatureCollection', features: countries };
const width = 540, height = 280;
const projection = geoNaturalEarth1().fitExtent([[7, 5], [width - 7, height - 5]], collection);
const dots = [], names = countries.map(f => f.properties.name);
for (let y = 5, row = 0; y < height; y += 4, row++) {
  for (let x = 5 + (row % 2) * 2; x < width - 5; x += 4) {
    const coordinate = projection.invert([x, y]);
    if (!coordinate || Math.abs(coordinate[0]) > 180 || Math.abs(coordinate[1]) > 90) continue;
    const country = countries.findIndex(f => geoContains(f, coordinate));
    if (country !== -1) dots.push([x, y, country]);
  }
}
const samples = [...demo.visitors.map(v => v.coordinates), [-120, 36], [-105, 58], [-72, -14], [-60, -32], [-40, -9], [-7, 54], [2, 46], [20, 60], [35, 49], [40, 12], [20, 3], [24, -28], [60, 50], [90, 56], [100, 35], [105, 16], [117, -3], [135, -24], [170, -40], [139, 37], [48, -20]];
const round = pair => pair.map(n => Math.round(n * 10) / 10);
await writeFile(new URL('../public/map-data.json', import.meta.url), JSON.stringify({ width, height, dots, names, home: round(projection(demo.home)), destinations: samples.map(p => round(projection(p))) }));
console.log(`Generated ${dots.length} map dots across ${countries.length} countries.`);
