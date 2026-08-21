const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const VALID_28_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const filePath = 'c:\\Users\\moune\\OneDrive\\Desktop\\project_new\\India_Engineering_College_Database_28_States_TEST_DATA.xlsx';
const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

console.log('Total Sheets in Workbook:', workbook.SheetNames.length);
console.log('Sheet Names:', workbook.SheetNames);

let totalRows = 0;
const summary = [];

workbook.SheetNames.forEach(sheetName => {
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const rowCount = Math.max(0, data.length - 1);
  const headers = data[0] || [];
  const isState = VALID_28_STATES.some(s => s.toLowerCase() === sheetName.trim().toLowerCase());
  
  if (isState) {
    totalRows += rowCount;
  }

  summary.push({
    sheetName,
    isState,
    rowCount,
    headers: headers.slice(0, 8),
    firstRow: data[1] ? data[1].slice(0, 4) : []
  });
});

console.log('\n--- State Sheets Summary ---');
console.table(summary.map(s => ({
  Sheet: s.sheetName,
  IsState: s.isState,
  Rows: s.rowCount,
  SampleCollege: s.firstRow[1] || s.firstRow[0] || 'N/A'
})));

console.log('\nTotal State Records:', totalRows);
