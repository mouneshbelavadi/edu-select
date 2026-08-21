const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient, CollegeType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const VALID_28_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bInst\b/gi, 'Institute')
    .replace(/\bTech\b/gi, 'Technology')
    .replace(/\bUniv\b/gi, 'University')
    .replace(/\bEngg\b/gi, 'Engineering')
    .replace(/\bCol\b/gi, 'College');
}

function parseFees(feesStr) {
  if (!feesStr) return 150000;
  if (typeof feesStr === 'number') return feesStr;
  const str = String(feesStr);
  const match = str.match(/([0-9.]+)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (str.includes('Lakh') || str.includes('lakh')) {
      return Math.round(val * 100000);
    }
    if (val < 100) return Math.round(val * 100000);
    return Math.round(val);
  }
  return 150000;
}

function parseRating(ratingStr) {
  if (!ratingStr) return 4.0;
  if (typeof ratingStr === 'number') return Math.min(5, Math.max(1, ratingStr));
  const match = String(ratingStr).match(/([0-9.]+)/);
  if (match) {
    const r = parseFloat(match[1]);
    return Math.min(5, Math.max(1, r));
  }
  return 4.0;
}

function slugify(name, state) {
  return `${name}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function importExcel() {
  console.log('🚀 Starting Excel Ingestion Pipeline (28 States)...');
  const filePath = 'c:\\Users\\moune\\OneDrive\\Desktop\\project_new\\India_Engineering_College_Database_28_States_TEST_DATA.xlsx';

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found at: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

  // 1. Seed demo user for authentication
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'aarav.sharma@example.com' },
    update: { passwordHash },
    create: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      passwordHash,
    },
  });
  console.log('✅ Demo user verified:', demoUser.email);

  const seenSlugs = new Set();
  const seenNormalized = new Map();
  let totalImported = 0;

  for (const stateName of VALID_28_STATES) {
    const ws = workbook.Sheets[stateName];
    if (!ws) {
      console.warn(`⚠️ Sheet not found for state: ${stateName}`);
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const headers = (rows[0] || []).map(h => String(h).trim());
    const dataRows = rows.slice(1);

    const nameColIdx = headers.findIndex(h => /college\s*name/i.test(h) || /institute\s*name/i.test(h));
    const locColIdx = headers.findIndex(h => /location/i.test(h) || /city/i.test(h));
    const feesColIdx = headers.findIndex(h => /fees/i.test(h));
    const ratingColIdx = headers.findIndex(h => /rating/i.test(h));
    const overviewColIdx = headers.findIndex(h => /overview/i.test(h));

    for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
      const row = dataRows[rowIdx];
      let rawName = '';

      if (nameColIdx !== -1 && row[nameColIdx]) {
        rawName = row[nameColIdx];
      } else {
        for (let cell of row) {
          if (cell && typeof cell === 'string' && cell.length > 5 && !cell.startsWith('TEST DATA')) {
            rawName = cell;
            break;
          }
        }
      }

      if (!rawName) continue;

      const normalizedName = normalizeName(rawName);
      const loc = locColIdx !== -1 && row[locColIdx] ? String(row[locColIdx]).trim() : (stateName === 'Karnataka' ? 'Bangalore' : stateName);
      const fees = feesColIdx !== -1 ? parseFees(row[feesColIdx]) : 150000;
      const rating = ratingColIdx !== -1 ? parseRating(row[ratingColIdx]) : 4.0;
      const overview = overviewColIdx !== -1 && row[overviewColIdx] ? String(row[overviewColIdx]).trim() : `${normalizedName} is a premier engineering institution located in ${loc}, ${stateName}, offering undergraduate and postgraduate technical programs with modern research facilities.`;

      const normKey = `${normalizedName.toLowerCase()}|${stateName.toLowerCase()}`;
      if (seenNormalized.has(normKey)) continue;
      seenNormalized.set(normKey, true);

      let slug = slugify(normalizedName, stateName);
      let uniqueSlug = slug;
      let counter = 1;
      while (seenSlugs.has(uniqueSlug)) {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      seenSlugs.add(uniqueSlug);

      let type = CollegeType.PRIVATE;
      if (/government|govt|university visvesvaraya|national institute|indian institute/i.test(normalizedName)) {
        type = CollegeType.GOVERNMENT;
      } else if (/autonomous/i.test(normalizedName) || /deemed/i.test(normalizedName)) {
        type = CollegeType.DEEMED;
      }

      const college = await prisma.college.upsert({
        where: { slug: uniqueSlug },
        update: {
          name: normalizedName,
          city: loc,
          state: stateName,
          type,
          fees,
          rating,
          overview,
        },
        create: {
          name: normalizedName,
          slug: uniqueSlug,
          city: loc,
          state: stateName,
          type,
          establishedYear: 1980 + (rowIdx % 40),
          fees,
          rating,
          overview,
          imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        },
      });

      // Seed core branch courses if not already present
      const existingCourses = await prisma.course.count({ where: { collegeId: college.id } });
      if (existingCourses === 0) {
        await prisma.course.createMany({
          data: [
            { collegeId: college.id, name: 'B.Tech Computer Science & Engineering', duration: '4 Years', fees, seats: 120 },
            { collegeId: college.id, name: 'B.Tech Artificial Intelligence & ML', duration: '4 Years', fees, seats: 60 },
            { collegeId: college.id, name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: Math.round(fees * 0.95), seats: 120 },
            { collegeId: college.id, name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: Math.round(fees * 0.85), seats: 60 },
          ],
        });
      }

      // Seed placement record if not already present
      const existingPlacements = await prisma.placement.count({ where: { collegeId: college.id } });
      if (existingPlacements === 0) {
        const avgPkg = Number(((fees / 25000) + 4.5).toFixed(1));
        const highestPkg = Number(((fees / 15000) + 15.0).toFixed(1));
        await prisma.placement.create({
          data: {
            collegeId: college.id,
            year: 2024,
            avgPackage: avgPkg,
            highestPackage: highestPkg,
            placementPercentage: 88.5,
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Microsoft', 'Amazon'],
          },
        });
      }

      totalImported++;
    }
  }

  console.log(`🎉 Successfully imported ${totalImported} colleges across all 28 states into PostgreSQL!`);
}

importExcel()
  .catch((err) => {
    console.error('❌ Error during import:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
