const XLSX = require('xlsx');
const filePath = 'c:\\Users\\moune\\OneDrive\\Desktop\\project_new\\India_Engineering_College_Database_28_States_TEST_DATA.xlsx';
const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

const ws = workbook.Sheets['Karnataka'];
const data = XLSX.utils.sheet_to_json(ws);

console.log('Total Karnataka Colleges in Excel:', data.length);
console.log('\n--- Row 0 (First College) ---');
console.log(data[0]);

console.log('\n--- Row 1 (Second College) ---');
console.log(data[1]);

console.log('\n--- Row 2 (Third College) ---');
console.log(data[2]);
