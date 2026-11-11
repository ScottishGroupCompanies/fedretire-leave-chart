import { buildLeaveWorkbook } from '../lib/leaveWorkbook.js';

window.fedretireDownloadExcel = async function () {
  const raw = localStorage.getItem(window.fedretireChartKey || 'fedretire-leave-2027');
  const data = raw ? JSON.parse(raw) : {};
  const calendar = await fetch('/calendar2027.json').then(r => r.json());
  const bytes = await buildLeaveWorkbook(data, calendar);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fedretire-2027-leave-chart.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
