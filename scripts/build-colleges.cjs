const fs = require('fs');
const path = require('path');

const colleges28Path = path.join(__dirname, '..', 'src', 'data', 'colleges28States.json');
const karnatakaPatchPath = path.join(__dirname, '..', 'src', 'data', 'colleges', 'karnatakaPatch.json');
const karnatakaAdditionsPath = path.join(__dirname, '..', 'src', 'data', 'colleges', 'karnatakaAdditions.json');
const realColleges27Path = path.join(__dirname, '..', 'src', 'data', 'colleges', 'realColleges27States.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'colleges.json');

console.log('🏗️ Building unified colleges.json dataset...');

const colleges28 = JSON.parse(fs.readFileSync(colleges28Path, 'utf-8'));
const karnatakaPatch = JSON.parse(fs.readFileSync(karnatakaPatchPath, 'utf-8'));
const karnatakaAdditions = JSON.parse(fs.readFileSync(karnatakaAdditionsPath, 'utf-8'));
const realColleges27 = JSON.parse(fs.readFileSync(realColleges27Path, 'utf-8'));

// 1. Remove TEST records (405 records)
let nonTest = colleges28.filter((c) => !c.name.startsWith('TEST'));
console.log(`Original colleges28 count: ${colleges28.length}, Non-TEST (Karnataka) count: ${nonTest.length}`);

// 2. Remove probable duplicate: col-268
const duplicateIds = new Set((karnatakaPatch.probableDuplicates || []).map((d) => d.id));
nonTest = nonTest.filter((c) => !duplicateIds.has(c.id));
console.log(`After removing probable duplicates: ${nonTest.length}`);

// 3. Map updates
const updatesMap = new Map();
(karnatakaPatch.updates || []).forEach((u) => {
  updatesMap.set(u.id, u);
});

// Gov engg college ids rule
const govCollegeIds = new Set([
  'col-219', 'col-220', 'col-223', 'col-224', 'col-240',
  'col-281', 'col-282', 'col-283', 'col-284', 'col-285',
]);

const patchedKarnataka = nonTest.map((c) => {
  let record = { ...c };

  // apply renames
  if (karnatakaPatch.renames && karnatakaPatch.renames[record.id]) {
    record.name = karnatakaPatch.renames[record.id];
  }

  // apply cityFixes
  if (karnatakaPatch.cityFixes && karnatakaPatch.cityFixes[record.id]) {
    record.city = karnatakaPatch.cityFixes[record.id];
  }

  // check updates vs legacyRatingRule
  if (updatesMap.has(record.id)) {
    const update = updatesMap.get(record.id);
    record = { ...record, ...update };
    if (update.placementStats !== undefined) {
      record.placementStats = update.placementStats;
    }
  } else {
    // legacyRatingRule: rating = null, ratingDisplay = "Not in NIRF 2025 top 100"
    record.rating = null;
    record.ratingDisplay = 'Not in NIRF 2025 top 100';
    record.nirfRank2025 = null;
    record.nirfBand2025 = null;
    record.nirfNote = null;
    record.ratingBasis = null;

    const isGov =
      govCollegeIds.has(record.id) ||
      record.name.toLowerCase().includes('government engineering college') ||
      record.name.toLowerCase().includes('govt engineering college') ||
      record.type === 'GOVERNMENT';

    if (isGov) {
      record.type = 'GOVERNMENT';
      record.typeDetail = 'State Government engineering college (VTU)';
      record.institutionCategory = 'STATE';
    } else {
      record.typeDetail = 'Private college (VTU)';
      record.institutionCategory = record.type === 'DEEMED' ? 'DEEMED' : 'PRIVATE';
    }
  }

  // Ensure default RealCollegeExtras
  if (!record.typeDetail) {
    record.typeDetail = record.type === 'GOVERNMENT' ? 'State Government engineering college (VTU)' : 'Private college (VTU)';
  }
  if (!record.institutionCategory) {
    record.institutionCategory = record.type === 'GOVERNMENT' ? 'STATE' : (record.type === 'DEEMED' ? 'DEEMED' : 'PRIVATE');
  }
  if (record.nirfRank2025 === undefined) record.nirfRank2025 = null;
  if (record.nirfBand2025 === undefined) record.nirfBand2025 = null;
  if (record.nirfNote === undefined) record.nirfNote = null;
  if (record.ratingBasis === undefined) record.ratingBasis = null;
  if (record.feesMax === undefined) record.feesMax = record.fees || 0;
  if (record.feesIsEstimate === undefined) record.feesIsEstimate = true;
  if (record.placementStats === undefined) record.placementStats = null;
  if (record.admissionRoutes === undefined) {
    record.admissionRoutes = record.entranceExams && record.entranceExams.length > 0
      ? record.entranceExams.map((e) => e.exam)
      : ['KCET'];
  }
  if (record.routeNote === undefined) record.routeNote = null;
  if (record.coursesNote === undefined) record.coursesNote = 'Typical core branches by institution type - verify per college.';
  if (record.established === undefined) record.established = record.establishedYear || null;
  if (record.verificationStatus === undefined) record.verificationStatus = 'partially-verified';
  if (record.sourceUrls === undefined) record.sourceUrls = [];
  record.isRealData = true;

  return record;
});

console.log(`Patched Karnataka count: ${patchedKarnataka.length}`);
console.log(`Karnataka additions count: ${karnatakaAdditions.items.length}`);
console.log(`Real colleges 27 states count: ${realColleges27.items.length}`);

// 4. Combine all datasets
const allColleges = [
  ...patchedKarnataka,
  ...karnatakaAdditions.items,
  ...realColleges27.items,
];

console.log(`Total combined colleges count: ${allColleges.length}`);

// 5. Check uniqueness of ids and slugs, and assert no TEST in names
const ids = new Set();
const slugs = new Set();
const countsByState = {};

allColleges.forEach((c) => {
  if (c.name.includes('TEST')) {
    throw new Error(`Record contains TEST in name: ${c.name} (${c.id})`);
  }
  if (ids.has(c.id)) {
    throw new Error(`Duplicate ID found: ${c.id}`);
  }
  ids.add(c.id);

  if (slugs.has(c.slug)) {
    throw new Error(`Duplicate slug found: ${c.slug} for ${c.id}`);
  }
  slugs.add(c.slug);

  countsByState[c.state] = (countsByState[c.state] || 0) + 1;
});

// Print per-state counts
console.log('\n📊 College Counts per State:');
const sortedStates = Object.keys(countsByState).sort();
sortedStates.forEach((state) => {
  console.log(`  - ${state}: ${countsByState[state]}`);
});

// 6. Write output to src/data/colleges.json
fs.writeFileSync(outputPath, JSON.stringify(allColleges, null, 2), 'utf-8');
console.log(`\n✅ Successfully generated ${outputPath} with ${allColleges.length} institutions.`);
