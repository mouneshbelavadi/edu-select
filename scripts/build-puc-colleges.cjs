/**
 * scripts/build-puc-colleges.cjs
 *
 * EduSelect Phase 2: Karnataka Department of Pre-University Education (DPUE) Directory Compiler
 * Ingests raw-data/dpue_colleges.xlsx containing 6,417 PU Colleges across all 32 Karnataka districts.
 * Compiles clean, indexed dataset at src/data/pucColleges.json
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT_DIR = path.resolve(__dirname, '..');
const LOCAL_RAW_DIR = path.join(ROOT_DIR, 'raw-data');
const SOURCE_FILE = path.join(LOCAL_RAW_DIR, 'dpue_colleges.xlsx');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'pucColleges.json');

console.log('🏗️  Starting Phase 2: Ingesting & Compiling Karnataka DPUE PU Colleges...');

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`✖ Error: Source file not found at ${SOURCE_FILE}`);
  process.exit(1);
}

const wb = XLSX.readFile(SOURCE_FILE);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(sheet);

console.log(`✔ Read ${rawRows.length} raw rows from DPUE Colleges workbook`);

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeManagement(type) {
  if (!type) return 'Private Unaided';
  const t = type.trim().toLowerCase();
  if (t === 'government') return 'Government';
  if (t === 'aided') return 'Private Aided';
  if (t === 'unaided') return 'Private Unaided';
  if (t === 'kreis') return 'Government (KREIS Residential)';
  if (t === 'mwd') return 'Government (Minority Welfare)';
  if (t === 'corporation') return 'Government (BBMP/Corporation)';
  if (t === 'bifurcated') return 'Aided / Bifurcated';
  return toTitleCase(type);
}

function inferStreams(collegeName) {
  const name = (collegeName || '').toUpperCase();
  const streams = [];

  const hasSci = name.includes('SCI') || name.includes('SCIENCE') || name.includes('TECH') || name.includes('STEM');
  const hasComm = name.includes('COMM') || name.includes('COMMERCE') || name.includes('MGMT');
  const hasArts = name.includes('ARTS') || name.includes('HUMANITIES');

  if (hasSci) streams.push('Science');
  if (hasComm) streams.push('Commerce');
  if (hasArts) streams.push('Arts');

  // If specific stream not mentioned in name, standard composite PU colleges in Karnataka offer Science & Commerce (and often Arts)
  if (streams.length === 0) {
    streams.push('Science', 'Commerce', 'Arts');
  }

  return streams;
}

const colleges = [];
const districtCounts = {};
const typeCounts = {};

rawRows.forEach((r, idx) => {
  const rawDist = (r['District'] || '').toString().trim();
  const rawCode = (r['College Code'] || '').toString().trim();
  const rawName = (r['College Name'] || '').toString().trim();
  const rawMgmt = (r['Management Type'] || '').toString().trim();
  const rawAddr = (r['Address'] || '').toString().trim();
  const rawYear = (r['Year Of Establishment'] || '').toString().trim();

  if (!rawName || !rawDist) return;

  const district = toTitleCase(rawDist);
  const collegeCode = rawCode || `PU${String(idx + 1).padStart(4, '0')}`;
  const collegeName = toTitleCase(rawName);
  const management = normalizeManagement(rawMgmt);
  const address = rawAddr ? toTitleCase(rawAddr) : district;
  const streams = inferStreams(rawName);

  districtCounts[district] = (districtCounts[district] || 0) + 1;
  typeCounts[management] = (typeCounts[management] || 0) + 1;

  colleges.push({
    id: `puc-${collegeCode.toLowerCase()}-${idx}`,
    code: collegeCode,
    name: collegeName,
    district,
    management,
    address,
    year: rawYear || undefined,
    streams,
    state: 'Karnataka',
  });
});

const output = {
  metadata: {
    title: 'Karnataka Department of Pre-University Education (DPUE) Colleges Directory',
    academicYear: '2025-2026',
    totalColleges: colleges.length,
    districtsCount: Object.keys(districtCounts).length,
    districtBreakdown: districtCounts,
    managementBreakdown: typeCounts,
    generatedAt: new Date().toISOString(),
  },
  colleges,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n🎉 Phase 2 Build Completed Successfully!`);
console.log(`📁 Target File: ${OUTPUT_FILE}`);
console.log(`🏛️ Total PU Colleges Ingested: ${colleges.length}`);
console.log(`📍 Total Districts: ${Object.keys(districtCounts).length}`);
console.log(`🏢 Top Management Types:`);
Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([t, count]) => console.log(`   • ${t.padEnd(32)}: ${count} colleges`));
