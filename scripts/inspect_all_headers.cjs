const XLSX = require('xlsx');
const filePath = 'c:\\Users\\moune\\OneDrive\\Desktop\\project_new\\India_Engineering_College_Database_28_States_TEST_DATA.xlsx';
const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

const allHeaders = new Set();
const stateHeadersMap = {};

workbook.SheetNames.forEach(sheetName => {
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    stateHeadersMap[sheetName] = keys;
    keys.forEach(k => allHeaders.add(k));
  }
});

console.log('All Unique Headers across all sheets:');
console.log(Array.from(allHeaders));
