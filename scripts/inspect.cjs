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

function inspectWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workbook not found at: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

  const sheetDetails = workbook.SheetNames.map((name) => {
    const worksheet = workbook.Sheets[name];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = (jsonData[0] || []).map((h) => String(h).trim()).filter((h) => h.length > 0);
    const rowCount = Math.max(0, jsonData.length - 1);
    
    const isStateSheet = VALID_28_STATES.some(
      (state) => state.toLowerCase() === name.trim().toLowerCase()
    );

    const sampleRows = jsonData.slice(1, 4);

    return {
      sheetName: name,
      rowCount,
      columnHeaders: headers,
      isStateSheet,
      sampleRows,
    };
  });

  const stateSheets = sheetDetails.filter((s) => s.isStateSheet).map((s) => s.sheetName);
  const nonStateSheets = sheetDetails.filter((s) => !s.isStateSheet).map((s) => s.sheetName);

  return {
    filePath,
    totalSheets: workbook.SheetNames.length,
    stateSheetsCount: stateSheets.length,
    stateSheets,
    nonStateSheets,
    sheetDetails,
    timestamp: new Date().toISOString(),
  };
}

const targetPath = process.argv[2] || path.join(__dirname, '..', '..', 'India_Engineering_College_Database_28_States_TEST_DATA.xlsx');
console.log(`[Phase 0] Inspecting workbook at: ${targetPath}...`);
try {
  const result = inspectWorkbook(targetPath);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(`[Phase 0] Error: ${err.message}`);
}
