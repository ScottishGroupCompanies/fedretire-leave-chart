import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { buildLeaveWorkbook } from '../lib/leaveWorkbook.js';

const calendar = JSON.parse(readFileSync(new URL('../public/calendar2027.json', import.meta.url), 'utf8'));
const blank = await buildLeaveWorkbook({}, calendar);
writeFileSync(new URL('../public/fedretire-2027-leave-chart.xlsx', import.meta.url), blank);

const sampleData = { sc: '2190', sickSeeded: 1, alRate: '6' };
for (let i = 1; i <= 26; i++) {
  sampleData['se' + i] = '4';
  sampleData['ae' + i] = '6';
}
sampleData.dt1_0 = 'C1';
sampleData.dh1_0 = '0.5';
const sample = await buildLeaveWorkbook(sampleData, calendar);
mkdirSync('/opt/cursor/artifacts', { recursive: true });
writeFileSync('/opt/cursor/artifacts/fedretire-2027-leave-chart-blank.xlsx', blank);
writeFileSync('/opt/cursor/artifacts/fedretire-2027-leave-chart-sample.xlsx', sample);
writeFileSync(new URL('../public/fedretire-2027-leave-chart.xlsx', import.meta.url), blank);
console.log('wrote blank template and sample');
