/**
 * Phase 0: Excel Inspection Script
 * 
 * Inspects any uploaded 28-state Excel workbook without modifying it.
 * Audits all sheet names, column headers, and row counts.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export interface InspectionSummary {
  filePath: string;
  totalSheets: number;
  stateSheets: string[];
  nonStateSheets: string[];
  sheetDetails: {
    sheetName: string;
    rowCount: number;
    columnHeaders: string[];
    isStateSheet: boolean;
    sampleRows: any[];
  }[];
  timestamp: string;
}

export const VALID_28_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export function inspectWorkbook(filePath: string): InspectionSummary {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workbook not found at: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

  const sheetDetails = workbook.SheetNames.map((name: string) => {
    const worksheet = workbook.Sheets[name];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    const headers = (jsonData[0] || []).map((h: any) => String(h).trim()).filter((h: string) => h.length > 0);
    const rowCount = Math.max(0, jsonData.length - 1);
    
    const isStateSheet = VALID_28_STATES.some(
      (state) => state.toLowerCase() === name.trim().toLowerCase()
    );

    // Grab first 2 sample data rows
    const sampleRows = jsonData.slice(1, 3);

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
    stateSheets,
    nonStateSheets,
    sheetDetails,
    timestamp: new Date().toISOString(),
  };
}

const targetPath = process.argv[2] || path.join(process.cwd(), '..', 'India_Engineering_College_Database_28_States_TEST_DATA.xlsx');
console.log(`[Phase 0] Inspecting workbook at: ${targetPath}...`);
try {
  const result = inspectWorkbook(targetPath);
  console.log(JSON.stringify(result, null, 2));
} catch (err: any) {
  console.error(`[Phase 0] Error: ${err.message}`);
}
