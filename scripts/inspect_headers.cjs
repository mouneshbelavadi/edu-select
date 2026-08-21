const XLSX = require('xlsx');
const filePath = 'c:\\Users\\moune\\OneDrive\\Desktop\\project_new\\India_Engineering_College_Database_28_States_TEST_DATA.xlsx';
const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

['Karnataka', 'Maharashtra', 'Andhra Pradesh'].forEach(sheetName => {
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\n=== Headers for Sheet: ${sheetName} ===`);
  console.log(data[0]);
  console.log(`\nSample row 1:`);
  console.log(data[1]);
});
