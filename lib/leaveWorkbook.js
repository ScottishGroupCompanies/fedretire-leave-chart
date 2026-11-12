import JSZip from 'jszip';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY = ['S','M','T','W','T','F','S','S','M','T','W','T','F','S'];

function xml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rangeLabel(start, end) {
  const s = new Date(start + 'T12:00:00Z');
  const e = new Date(end + 'T12:00:00Z');
  const same = s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth();
  if (same) return MON[s.getUTCMonth()] + ' ' + s.getUTCDate() + '-' + e.getUTCDate();
  return MON[s.getUTCMonth()] + ' ' + s.getUTCDate() + '-' + MON[e.getUTCMonth()] + ' ' + e.getUTCDate();
}
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function numOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><u/><sz val="16"/><color rgb="FF003F71"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
    <font><u/><sz val="11"/><color rgb="FF0563C1"/><name val="Calibri"/></font>
  </fonts>
  <fills count="9">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF003F71"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFBE6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE6F4EA"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFCC80"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF176"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFBBDEFB"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD0D7E2"/></left>
      <right style="thin"><color rgb="FFD0D7E2"/></right>
      <top style="thin"><color rgb="FFD0D7E2"/></top>
      <bottom style="thin"><color rgb="FFD0D7E2"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
  </cellXfs>
</styleSheet>`;
}

function cellStr(ref, text, style) {
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${xml(text)}</t></is></c>`;
}
function cellNum(ref, n, style) {
  return `<c r="${ref}" s="${style}"><v>${n}</v></c>`;
}
function cellEmpty(ref, style) {
  return `<c r="${ref}" s="${style}"/>`;
}
function cellFormula(ref, formula, style) {
  return `<c r="${ref}" s="${style}"><f>${xml(formula)}</f></c>`;
}

/**
 * Build the 2027 leave workbook. `data` is the chart state (same object the
 * web app stores). Sick earned defaults to 4. Balance cells are formulas:
 * balance = previous balance (or the 2026 start) + earned - used.
 */
export async function buildLeaveWorkbook(data, calendar) {
  const D = data && typeof data === 'object' ? data : {};
  const periods = calendar.pay_periods.slice().sort((a, b) => a.leave_year_pp - b.leave_year_pp);
  const holidays = {};
  for (const h of calendar.holidays) {
    if (typeof h.leave_year_pp === 'number') holidays[h.date] = h.name;
  }

  const rows = [];
  const push = (r, cells, height) => rows.push(`<row r="${r}" ht="${height || (r === 1 ? 24 : r === 2 ? 36 : r === 4 ? 32 : r === 3 || r === 5 ? 30 : 18)}" customHeight="1">${cells.join('')}</row>`);

  const links = [{ ref: 'A1', url: 'https://fedretire.net' }];
  push(1, [cellStr('A1', "2027 Federal Employee's Leave Record — fedretire.net", 4)]);
  push(2, [cellStr('A2', 'Balance = previous balance + earned − used. Yellow cells are yours to edit. Sick earned starts at 4 hours and can be changed. Blank template: https://leave.fedretire.net/fedretire-2027-leave-chart.xlsx', 6)]);

  const groups = [
    [17, 19, 'Annual Leave', 'Q', 'R', 'S', 'a'],
    [20, 22, 'Sick Leave', 'T', 'U', 'V', 's'],
    [23, 25, 'Credit Hours (C1)', 'W', 'X', 'Y', 'c'],
    [26, 28, 'Comp Hours (C2)', 'Z', 'AA', 'AB', 'm'],
  ];
  const rate = numOrNull(D.alRate);
  const chosen = rate === 4 || rate === 6 || rate === 8 ? rate : null;
  const header3 = [cellStr('A3', 'Pay Periods', 1), cellStr('C3', 'Days', 1)];
  const balance4 = [cellStr('A4', '2026 Leave Balance', 1)];
  const colHead = [cellStr('A5', '#', 1), cellStr('B5', 'Dates', 1)];
  DAY.forEach((d, i) => colHead.push(cellStr(String.fromCharCode(67 + i) + '5', d, 1)));

  for (const [startCol, endCol, label, earned, used, bal, key] of groups) {
    header3.push(cellStr(colName(startCol) + '3', label, 1));
    if (key === 'a') header3.push(chosen == null ? cellEmpty('S3', 2) : cellNum('S3', chosen, 2));
    balance4.push(cellStr(earned + '4', '2026 Leave Balance', 1));
    const start = numOrNull(D[key + 'c']);
    balance4.push(start == null ? cellEmpty(bal + '4', 2) : cellNum(bal + '4', start, 2));
    colHead.push(cellStr(earned + '5', 'Earned', 1), cellStr(used + '5', 'Used', 1), cellStr(bal + '5', 'Bal', 1));
    void endCol;
  }
  push(3, header3);
  push(4, balance4);
  push(5, colHead);

  periods.forEach((p, idx) => {
    const excelRow = 6 + idx;
    const pp = p.leave_year_pp;
    const cells = [cellNum('A' + excelRow, pp, 0), cellStr('B' + excelRow, rangeLabel(p.start, p.end), 0)];
    for (let d = 0; d < 14; d++) {
      const iso = addDays(p.start, d);
      const ref = String.fromCharCode(67 + d) + excelRow;
      const code = D['dt' + pp + '_' + d];
      const hrs = D['dh' + pp + '_' + d];
      const holiday = holidays[iso];
      let text = '';
      if (code && hrs != null && hrs !== '') text = code + ' ' + hrs;
      else if (code) text = String(code);
      else if (hrs != null && hrs !== '') text = String(hrs);
      else if (holiday) text = 'H';
      if (!text) cells.push(cellEmpty(ref, 0));
      else cells.push(cellStr(ref, text, holiday && !code ? 5 : 0));
    }
    for (const [, , , earned, used, bal, key] of groups) {
      const eKey = key + 'e' + pp;
      const uKey = key + 'u' + pp;
      let earnedVal = numOrNull(D[eKey]);
      if (earnedVal == null && key === 's') earnedVal = 4;
      const usedVal = numOrNull(D[uKey]);
      if (key === 'a') {
        const matches = chosen != null && earnedVal === chosen;
        if (earnedVal != null && !matches) cells.push(cellNum(earned + excelRow, earnedVal, 2));
        else cells.push(cellFormula(earned + excelRow, 'IF(S$3="","",S$3)', 2));
      } else cells.push(earnedVal == null ? cellEmpty(earned + excelRow, 2) : cellNum(earned + excelRow, earnedVal, 2));
      cells.push(usedVal == null ? cellEmpty(used + excelRow, 2) : cellNum(used + excelRow, usedVal, 2));
      const prev = excelRow === 6 ? bal + '$4' : bal + (excelRow - 1);
      cells.push(cellFormula(bal + excelRow, `N(${prev})+N(${earned}${excelRow})-N(${used}${excelRow})`, 3));
    }
    push(excelRow, cells);
  });

  const resources = [
    ['Pay Charts', 'https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/'],
    ['Retirement Planning Blog', 'https://fedretire.net'],
    ["Sign Up for Our FREE Federal Employee's Retirement Planning E-mail Newsletter", 'https://www2.unitedbenefits.com/l/860683/2026-10-08/2p5wqx'],
    ["Federal Employee's Retirement Planning Guide", 'https://federalretirement.net/'],
  ];
  const simplified = [
    ['The Ultimate Retirement Planning Guide', 'https://federalretirement.net/introduction/'],
    ['The Biggest Retirement Mistake', 'https://www.youtube.com/watch?v=duCXXi4K_68'],
    ['Early Retirement, Don’t Make This Mistake', 'https://www.youtube.com/watch?v=cd0lawrtU2Q'],
    ['Evaluating Your Annuity', 'https://federalretirement.net/annuity/'],
    ['Are You Eligible to Retire', 'https://federalretirement.net/fers-retirement/'],
    ['Sick Leave Conversion Chart', 'https://federalretirement.net/sick-leave-conversion/'],
    ['How to Choose Your Best Retirement Age', 'https://fedretire.net/how-to-choose-the-best-retirement-age-for-your-future/'],
  ];
  push(33, [cellStr('A33', 'Resources', 11)]);
  resources.forEach((item, i) => {
    const row = 34 + i;
    links.push({ ref: 'A' + row, url: item[1] });
    push(row, [cellStr('A' + row, item[0], 10)], 20);
  });
  push(39, [cellStr('A39', 'Retirement Planning Simplified', 11)]);
  simplified.forEach((item, i) => {
    const row = 40 + i;
    links.push({ ref: 'A' + row, url: item[1] });
    push(row, [cellStr('A' + row, item[0], 10)], 20);
  });
  push(48, [cellStr('A48', 'Shift Codes — To track your shift schedule, print the PDF at the beginning of the year and highlight your shifts, or enter these codes on the paper chart. They are not leave types and are not part of the balance formulas.', 6)], 36);
  push(49, [cellStr('A49', 'D = Day Shift (Light Orange Highlighter)', 7)], 22);
  push(50, [cellStr('A50', 'E = Evening Shift (Yellow Highlighter)', 8)], 22);
  push(51, [cellStr('A51', 'M = Midnight Shift (Light Blue Highlighter)', 9)], 22);

  const merges = [
    'A1:AB1', 'A2:AB2', 'A3:B3', 'C3:P3',
    'Q3:R3', 'T3:V3', 'W3:Y3', 'Z3:AB3',
    'A4:B4', 'Q4:R4', 'T4:U4', 'W4:X4', 'Z4:AA4',
    'A33:P33',
    'A34:P34', 'A35:P35', 'A36:P36', 'A37:P37',
    'A39:P39',
    'A40:P40', 'A41:P41', 'A42:P42', 'A43:P43', 'A44:P44', 'A45:P45', 'A46:P46',
    'A48:AB48', 'A49:P49', 'A50:P50', 'A51:P51',
  ];
  links.forEach((link, i) => { link.rid = 'rId' + (i + 1); });
  const hyperlinks = links.map(link => `<hyperlink ref="${link.ref}" r:id="${link.rid}"/>`).join('');
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="A1:AB51"/>
  <sheetViews><sheetView workbookViewId="0" tabSelected="1"><pane ySplit="5" topLeftCell="A6" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A6" sqref="A6"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="16" customWidth="1"/>
    <col min="3" max="16" width="6.2" customWidth="1"/>
    <col min="17" max="28" width="11" customWidth="1"/>
  </cols>
  <sheetData>${rows.join('')}</sheetData>
  <mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>
  <dataValidations count="1">
    <dataValidation type="list" allowBlank="1" sqref="S3" showInputMessage="1" showErrorMessage="1" promptTitle="Annual leave" prompt="Hours earned each pay period. Same choices as the website: 4, 6, or 8.">
      <formula1>Lists!$A$1:$A$3</formula1>
    </dataValidation>
  </dataValidations>
  <hyperlinks>${hyperlinks}</hyperlinks>
  <pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="1" paperSize="1"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="2027 Leave Chart" sheetId="1" r:id="rId1"/>
    <sheet name="Lists" sheetId="2" r:id="rId3" state="hidden"/>
  </sheets>
  <calcPr calcMode="auto" fullCalcOnLoad="1"/>
</workbook>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
  zip.file('xl/workbook.xml', workbook);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`);
  zip.file('xl/styles.xml', stylesXml());
  zip.file('xl/worksheets/sheet1.xml', sheet);
  zip.file('xl/worksheets/sheet2.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1"><c r="A1"><v>4</v></c></row>
    <row r="2"><c r="A2"><v>6</v></c></row>
    <row r="3"><c r="A3"><v>8</v></c></row>
  </sheetData>
</worksheet>`);
  zip.file('xl/worksheets/_rels/sheet1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${links.map(link => `  <Relationship Id="${link.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xml(link.url)}" TargetMode="External"/>`).join('\n')}
</Relationships>`);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

function colName(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
