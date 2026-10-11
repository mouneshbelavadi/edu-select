const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper Levenshtein distance
function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array(an + 1).fill(null).map(() => Array(bn + 1).fill(null));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

console.log('🔍 STARTING COMPLETE DATA AUDIT (PHASE 2)...\n');

const auditResults = {
  colleges: { total: 0, schemaErrors: [], duplicates: [], invalidValues: [], spotCheck: [] },
  puc: { total: 0, schemaErrors: [], duplicates: [], invalidValues: [], districts: new Set(), spotCheck: [] },
  medical: { total: 0, schemaErrors: [], duplicates: [], invalidValues: [], spotCheck: [] },
  kcet: { total: 0, schemaErrors: [], duplicates: [], invalidValues: [], crossLinkMisses: [], spotCheck: [] },
  careers: { totalPathways: 0, brokenLinks: [], schemaErrors: [] }
};

// 1. Audit colleges.json
try {
  const colleges = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/colleges.json'), 'utf8'));
  auditResults.colleges.total = colleges.length;
  const seenIds = new Set();
  const seenNameCity = new Set();

  colleges.forEach((c, idx) => {
    // 1. Schema check
    if (!c.id || !c.name || !c.slug || !c.city || !c.state || !c.type) {
      auditResults.colleges.schemaErrors.push({ id: c.id, index: idx, issue: 'Missing essential fields' });
    }
    // 2. Duplicates
    if (seenIds.has(c.id)) {
      auditResults.colleges.duplicates.push({ id: c.id, issue: 'Duplicate ID' });
    }
    seenIds.add(c.id);

    const nameCityKey = `${c.name.toLowerCase().trim()}|${c.city.toLowerCase().trim()}`;
    if (seenNameCity.has(nameCityKey)) {
      auditResults.colleges.duplicates.push({ id: c.id, name: c.name, city: c.city, issue: 'Duplicate name+city' });
    }
    seenNameCity.add(nameCityKey);

    // 3. Invalid values
    if (c.fees < 0 || (c.feesMax && c.feesMax < 0)) {
      auditResults.colleges.invalidValues.push({ id: c.id, issue: 'Negative fees', fees: c.fees });
    }
    if (c.nirfRank2025 !== null && (c.nirfRank2025 < 1 || c.nirfRank2025 > 300)) {
      auditResults.colleges.invalidValues.push({ id: c.id, issue: 'NIRF rank outside 1-300', rank: c.nirfRank2025 });
    }
  });

  // Near duplicate check (sample check)
  for (let i = 0; i < Math.min(colleges.length, 100); i++) {
    for (let j = i + 1; j < Math.min(colleges.length, 100); j++) {
      const c1 = colleges[i];
      const c2 = colleges[j];
      if (c1.state === c2.state && levenshtein(c1.name, c2.name) <= 3 && c1.name !== c2.name) {
        auditResults.colleges.duplicates.push({ id1: c1.id, name1: c1.name, id2: c2.id, name2: c2.name, issue: 'Near-duplicate name' });
      }
    }
  }
} catch (e) {
  console.error('Error auditing colleges:', e);
}

// 2. Audit pucColleges.json
try {
  const pucData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/pucColleges.json'), 'utf8'));
  const colleges = pucData.colleges || [];
  auditResults.puc.total = colleges.length;
  const seenCodes = new Set();

  colleges.forEach((c, idx) => {
    if (!c.id || !c.code || !c.name || !c.district || !c.management || !c.streams) {
      auditResults.puc.schemaErrors.push({ id: c.id, code: c.code, issue: 'Missing fields' });
    }
    if (seenCodes.has(c.code)) {
      auditResults.puc.duplicates.push({ code: c.code, name: c.name, issue: 'Duplicate college code' });
    }
    seenCodes.add(c.code);
    auditResults.puc.districts.add(c.district);

    // check stream labels
    if (!Array.isArray(c.streams) || c.streams.length === 0) {
      auditResults.puc.invalidValues.push({ code: c.code, issue: 'Empty or non-array streams' });
    }
  });
} catch (e) {
  console.error('Error auditing puc:', e);
}

// 3. Audit karnatakaMedicalSeats.json
try {
  const medData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/karnatakaMedicalSeats.json'), 'utf8'));
  const institutes = medData.institutes || [];
  auditResults.medical.total = institutes.length;

  institutes.forEach((inst, idx) => {
    if (!inst.id || !inst.code || !inst.name || !inst.discipline) {
      auditResults.medical.schemaErrors.push({ id: inst.id, issue: 'Missing core field' });
    }
    // Invalid values
    if (inst.govQuotaSeats > inst.totalApprovedSeats) {
      auditResults.medical.invalidValues.push({
        id: inst.id,
        name: inst.name,
        govQuota: inst.govQuotaSeats,
        total: inst.totalApprovedSeats,
        issue: 'Gov quota exceeds total approved seats'
      });
    }
    if (inst.totalApprovedSeats <= 0) {
      auditResults.medical.invalidValues.push({ id: inst.id, name: inst.name, total: inst.totalApprovedSeats, issue: 'Non-positive seats' });
    }
    // Check entrance exam label
    if (inst.discipline === 'Medical' && inst.entranceExam && inst.entranceExam.includes('KCET')) {
      auditResults.medical.invalidValues.push({
        id: inst.id,
        name: inst.name,
        exam: inst.entranceExam,
        issue: 'Medical lists KCET as entrance exam'
      });
    }
  });
} catch (e) {
  console.error('Error auditing medical:', e);
}

// 4. Audit kcet2026Cutoffs.json
try {
  const cutoffs = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/kcet2026Cutoffs.json'), 'utf8'));
  auditResults.kcet.total = cutoffs.length;
  const colleges = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/colleges.json'), 'utf8'));
  const collegeSlugs = new Set(colleges.map(c => c.slug));
  const collegeNames = new Set(colleges.map(c => c.name.toLowerCase().trim()));

  cutoffs.forEach((row, idx) => {
    if (!row.collegeCode || !row.collegeName || !row.branchCode || !row.cutoffs) {
      auditResults.kcet.schemaErrors.push({ index: idx, issue: 'Missing cutoff field' });
    }
    if (!row.cutoffs.GM || row.cutoffs.GM <= 0) {
      auditResults.kcet.invalidValues.push({ college: row.collegeName, branch: row.branchCode, gm: row.cutoffs?.GM, issue: 'Invalid GM rank' });
    }
    // Cross-link check
    const matchesSlug = collegeSlugs.has(row.collegeSlug);
    const matchesName = collegeNames.has(row.collegeName.toLowerCase().trim());
    if (!matchesSlug && !matchesName) {
      auditResults.kcet.crossLinkMisses.push({
        collegeCode: row.collegeCode,
        collegeName: row.collegeName,
        slug: row.collegeSlug
      });
    }
  });
} catch (e) {
  console.error('Error auditing kcet cutoffs:', e);
}

// 5. Audit careers relational links
try {
  const pathways = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/careers/pathways.json'), 'utf8')).items;
  const exams = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/careers/exams.json'), 'utf8')).items;
  const clusters = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src/data/careers/careerClusters.json'), 'utf8')).items;

  auditResults.careers.totalPathways = pathways.length;
  const examIds = new Set(exams.map(e => e.id));
  const clusterIds = new Set(clusters.map(c => c.id));

  pathways.forEach(p => {
    (p.entranceExamIds || []).forEach(eId => {
      if (!examIds.has(eId)) {
        auditResults.careers.brokenLinks.push({ pathwayId: p.id, brokenExamId: eId });
      }
    });
    (p.clusterIds || []).forEach(cId => {
      if (!clusterIds.has(cId)) {
        auditResults.careers.brokenLinks.push({ pathwayId: p.id, brokenClusterId: cId });
      }
    });
  });
} catch (e) {
  console.error('Error auditing careers:', e);
}

console.log('=== AUDIT SUMMARY ===');
console.log(`Colleges (455): Schema errors = ${auditResults.colleges.schemaErrors.length}, Duplicates = ${auditResults.colleges.duplicates.length}, Invalid values = ${auditResults.colleges.invalidValues.length}`);
console.log(`PUC Colleges (6417): Schema errors = ${auditResults.puc.schemaErrors.length}, Duplicates = ${auditResults.puc.duplicates.length}, Districts = ${auditResults.puc.districts.size}`);
console.log(`Medical Colleges (788): Schema errors = ${auditResults.medical.schemaErrors.length}, Invalid values = ${auditResults.medical.invalidValues.length}`);
console.log(`KCET Cutoffs (1218): Schema errors = ${auditResults.kcet.schemaErrors.length}, Invalid values = ${auditResults.kcet.invalidValues.length}, Cross-link unmapped to colleges.json = ${auditResults.kcet.crossLinkMisses.length}`);
console.log(`Career Pathways (108): Broken relational links = ${auditResults.careers.brokenLinks.length}`);

// Save detailed audit JSON output
fs.writeFileSync(path.join(ROOT_DIR, 'scripts/audit-report.json'), JSON.stringify({
  colleges: auditResults.colleges,
  puc: {
    total: auditResults.puc.total,
    schemaErrors: auditResults.puc.schemaErrors.length,
    duplicates: auditResults.puc.duplicates,
    districtsCount: auditResults.puc.districts.size
  },
  medical: auditResults.medical,
  kcet: {
    total: auditResults.kcet.total,
    schemaErrors: auditResults.kcet.schemaErrors.length,
    invalidValues: auditResults.kcet.invalidValues.length,
    crossLinkMissesCount: auditResults.kcet.crossLinkMisses.length,
    sampleUnmapped: auditResults.kcet.crossLinkMisses.slice(0, 15)
  },
  careers: auditResults.careers
}, null, 2));

console.log('Saved detailed results to scripts/audit-report.json');
