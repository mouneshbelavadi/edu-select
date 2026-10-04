import { PrismaClient, CollegeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES_STATES = [
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Noida', state: 'Uttar Pradesh' },
];

const COLLEGE_NAMES_PREFIX = [
  'Apex Institute of Technology & Science',
  'Metropolitan Engineering College',
  'National College of Applied Sciences',
  'Vanguard Institute of Higher Education',
  'Horizon Technological University',
  'St. Jude College of Engineering',
  'Royal Institute of Management & Science',
  'Pioneer Technological Institute',
  'Zenith Institute of Engineering',
  'Sterling College of Science & Commerce',
  'Global Institute of Technology',
  'Trident Engineering & Management Institute',
  'Matrix University of Applied Sciences',
  'Orion College of Technology',
  'Quantum Institute of Management',
  'Crestwood Technological College',
  'Summit Institute of Engineering',
  'Heritage College of Sciences',
  'Phoenix Institute of Technology',
  'Imperial Engineering College',
];

const COURSES_TEMPLATE = [
  { name: 'B.Tech Computer Science & Engineering', duration: '4 Years', seats: 180, feeRatio: 1.1 },
  { name: 'B.Tech Information Technology', duration: '4 Years', seats: 120, feeRatio: 1.05 },
  { name: 'B.Tech Electronics & Communication', duration: '4 Years', seats: 120, feeRatio: 0.95 },
  { name: 'B.Tech Mechanical Engineering', duration: '4 Years', seats: 60, feeRatio: 0.85 },
  { name: 'B.Tech Data Science & AI', duration: '4 Years', seats: 60, feeRatio: 1.2 },
  { name: 'MBA Business Analytics', duration: '2 Years', seats: 60, feeRatio: 1.15 },
  { name: 'MBA Finance & Marketing', duration: '2 Years', seats: 120, feeRatio: 1.0 },
];

const RECRUITERS = [
  'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro',
  'Accenture', 'Deloitte', 'Goldman Sachs', 'Cognizant', 'Capgemini',
  'IBM', 'Samsung', 'Oracle', 'JPMorgan Chase', 'Adobe'
];

const DUMMY_USERS = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com' },
  { name: 'Ananya Roy', email: 'ananya.roy@example.com' },
  { name: 'Rohan Gupta', email: 'rohan.gupta@example.com' },
  { name: 'Priya Nair', email: 'priya.nair@example.com' },
  { name: 'Vikram Patel', email: 'vikram.patel@example.com' },
  { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@example.com' },
  { name: 'Kabir Verma', email: 'kabir.verma@example.com' },
];

const REVIEW_COMMENTS = [
  'Excellent campus infrastructure and high placement assistance for CSE students.',
  'Faculty members are knowledgeable and encouraging. Good lab facilities.',
  'Decent college overall. Placements for core branches could be improved.',
  'Great learning environment, modern sports amenities, and active student clubs.',
  'Strong industry network and top recruiters visit every academic year.',
  'Campus life is vibrant with technical and cultural fests conducted regularly.',
];

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const createdUsers = [];

  for (const u of DUMMY_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
      },
    });
    createdUsers.push(user);
  }
  console.log(`✅ Seeded ${createdUsers.length} dummy users (password: password123)`);

  // 2. Generate 35 Colleges
  const collegeTypes = [CollegeType.GOVERNMENT, CollegeType.PRIVATE, CollegeType.DEEMED];

  for (let i = 0; i < 35; i++) {
    const cityState = CITIES_STATES[i % CITIES_STATES.length];
    const prefix = COLLEGE_NAMES_PREFIX[i % COLLEGE_NAMES_PREFIX.length];
    const suffix = i >= COLLEGE_NAMES_PREFIX.length ? ` (Campus ${Math.floor(i / COLLEGE_NAMES_PREFIX.length) + 1})` : '';
    const collegeName = `${prefix}, ${cityState.city}${suffix}`;
    const slug = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const type = collegeTypes[i % collegeTypes.length];
    const establishedYear = 1970 + Math.floor((i * 13) % 48);
    const rating = Math.round((3.2 + (i % 18) * 0.1) * 10) / 10; // 3.2 to 4.9
    const baseFee = 60000 + (i % 10) * 45000 + Math.floor(rating * 15000); // 50k - 500k range

    const overview = `${collegeName} is a premier educational institution located in ${cityState.city}, ${cityState.state}. Established in ${establishedYear}, the college is accredited with grade 'A+' and offers industry-relevant undergraduate and postgraduate programs. With modern research labs, experienced faculty, and strong industry tie-ups, students achieve high academic standards and top placements.`;

    const imageUrl = `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80`;

    // Create college
    const college = await prisma.college.upsert({
      where: { slug },
      update: {},
      create: {
        name: collegeName,
        slug,
        city: cityState.city,
        state: cityState.state,
        type,
        establishedYear,
        fees: baseFee,
        rating,
        overview,
        imageUrl,
      },
    });

    // Create 3-4 courses for this college
    const selectedCourses = COURSES_TEMPLATE.slice(0, 3 + (i % 2));
    for (const c of selectedCourses) {
      await prisma.course.create({
        data: {
          collegeId: college.id,
          name: c.name,
          duration: c.duration,
          fees: Math.round(baseFee * c.feeRatio),
          seats: c.seats,
        },
      });
    }

    // Create 3 placement records (2022, 2023, 2024)
    const baseAvg = 5.5 + (rating - 3.0) * 4.2; // 5.5 to 13.5 LPA
    for (const yr of [2022, 2023, 2024]) {
      const yearMultiplier = yr === 2024 ? 1.15 : yr === 2023 ? 1.08 : 1.0;
      const avgPkg = Math.round(baseAvg * yearMultiplier * 10) / 10;
      const highestPkg = Math.round(avgPkg * (2.2 + (i % 3) * 0.5) * 10) / 10;
      const placementPct = Math.min(99, Math.round((75 + rating * 4.5) * 10) / 10);

      const recruitersCount = 3 + (i % 3);
      const topRecs = RECRUITERS.slice(i % 5, (i % 5) + recruitersCount);

      await prisma.placement.create({
        data: {
          collegeId: college.id,
          year: yr,
          avgPackage: avgPkg,
          highestPackage: highestPkg,
          placementPercentage: placementPct,
          topRecruiters: topRecs,
        },
      });
    }

    // Create 3-4 random user reviews
    const numReviews = 3 + (i % 3);
    for (let r = 0; r < numReviews; r++) {
      const randomUser = createdUsers[(i + r) % createdUsers.length];
      const reviewRating = Math.min(5, Math.max(3, Math.round(rating + (r % 2 === 0 ? 0.3 : -0.3))));
      const comment = REVIEW_COMMENTS[(i + r) % REVIEW_COMMENTS.length];

      await prisma.review.create({
        data: {
          collegeId: college.id,
          userId: randomUser.id,
          rating: reviewRating,
          comment,
        },
      });
    }
  }

  console.log('🎉 Database seeding completed successfully with 35 colleges, courses, placements, and reviews!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
