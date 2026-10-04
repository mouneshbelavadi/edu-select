import fs from 'fs';
import path from 'path';

// Define verification script
function checkCareerData() {
  console.log('--- Checking EduSelect Career Datasets Relational Integrity ---');

  const baseDir = path.join(process.cwd(), 'src', 'data', 'careers');
  const collegesPath = path.join(process.cwd(), 'src', 'data', 'colleges.json');

  const taxonomy = JSON.parse(fs.readFileSync(path.join(baseDir, 'taxonomy.json'), 'utf-8'));
  const clusters = JSON.parse(fs.readFileSync(path.join(baseDir, 'careerClusters.json'), 'utf-8'));
  const pathways = JSON.parse(fs.readFileSync(path.join(baseDir, 'pathways.json'), 'utf-8'));
  const exams = JSON.parse(fs.readFileSync(path.join(baseDir, 'exams.json'), 'utf-8'));
  const branches = JSON.parse(fs.readFileSync(path.join(baseDir, 'engineeringBranches.json'), 'utf-8'));
  const graduates = JSON.parse(fs.readFileSync(path.join(baseDir, 'graduateCareers.json'), 'utf-8'));
  const govtJobs = JSON.parse(fs.readFileSync(path.join(baseDir, 'govtJobs.json'), 'utf-8'));
  const colleges = JSON.parse(fs.readFileSync(collegesPath, 'utf-8'));

  console.log(`[Loaded] Taxonomy version: ${taxonomy.meta?.version || '1.0.0'}`);
  console.log(`[Count] Clusters: ${clusters.items.length}`);
  console.log(`[Count] Pathways: ${pathways.items.length}`);
  console.log(`[Count] Exams: ${exams.items.length}`);
  console.log(`[Count] Engineering Branches: ${branches.items.length}`);
  console.log(`[Count] Graduate Careers: ${graduates.items.length}`);
  console.log(`[Count] Government Jobs: ${govtJobs.items.length}`);
  console.log(`[Count] Real Colleges: ${colleges.length}`);

  const examIds = new Set(exams.items.map((e: any) => e.id));
  const clusterIds = new Set(clusters.items.map((c: any) => c.id));
  const govtJobIds = new Set(govtJobs.items.map((g: any) => g.id));
  const branchCodes = new Set(branches.items.map((b: any) => b.code));

  const errors: string[] = [];

  // 1. Pathways checks
  pathways.items.forEach((p: any) => {
    (p.entranceExamIds || []).forEach((eid: string) => {
      if (!examIds.has(eid)) errors.push(`Pathway ${p.id} references missing entranceExamId: ${eid}`);
    });
    (p.nextExamIds || []).forEach((eid: string) => {
      if (!examIds.has(eid)) errors.push(`Pathway ${p.id} references missing nextExamId: ${eid}`);
    });
    (p.clusterIds || []).forEach((cid: string) => {
      if (!clusterIds.has(cid)) errors.push(`Pathway ${p.id} references missing clusterId: ${cid}`);
    });
    if (p.linkedDataset && !['engineeringBranches', 'govtJobs'].includes(p.linkedDataset)) {
      errors.push(`Pathway ${p.id} has invalid linkedDataset: ${p.linkedDataset}`);
    }
  });

  // 2. Engineering Branches checks
  branches.items.forEach((b: any) => {
    (b.clusterIds || []).forEach((cid: string) => {
      if (!clusterIds.has(cid)) errors.push(`Branch ${b.id} references missing clusterId: ${cid}`);
    });
  });

  // 3. commonToAllBranches checks
  (branches.commonToAllBranches?.governmentExams || []).forEach((ge: any) => {
    if (!govtJobIds.has(ge.examId)) errors.push(`commonToAllBranches references missing govt examId: ${ge.examId}`);
  });
  (branches.commonToAllBranches?.higherStudies || []).forEach((hs: any) => {
    (hs.examIds || []).forEach((eid: string) => {
      if (!examIds.has(eid)) errors.push(`commonToAllBranches higherStudies references missing examId: ${eid}`);
    });
  });

  // 4. Graduate Careers checks
  graduates.items.forEach((g: any) => {
    (g.clusterIds || []).forEach((cid: string) => {
      if (!clusterIds.has(cid)) errors.push(`Graduate Career ${g.id} references missing clusterId: ${cid}`);
    });
    (g.govtJobIds || []).forEach((gid: string) => {
      if (!govtJobIds.has(gid)) errors.push(`Graduate Career ${g.id} references missing govtJobId: ${gid}`);
    });
    (g.pgExamIds || []).forEach((eid: string) => {
      if (!examIds.has(eid)) errors.push(`Graduate Career ${g.id} references missing pgExamId: ${eid}`);
    });
  });

  // 5. Govt Jobs checks
  govtJobs.items.forEach((j: any) => {
    (j.clusterIds || []).forEach((cid: string) => {
      if (!clusterIds.has(cid)) errors.push(`Govt Job ${j.id} references missing clusterId: ${cid}`);
    });
  });

  // 6. Colleges branchCodes match engineeringBranches
  colleges.forEach((c: any) => {
    (c.courses || []).forEach((crs: any) => {
      if (crs.branchCode && !branchCodes.has(crs.branchCode)) {
        errors.push(`College ${c.id} course ${crs.id} has unknown branchCode: ${crs.branchCode}`);
      }
    });
  });

  if (errors.length > 0) {
    console.error(`\n❌ Found ${errors.length} relational errors in career datasets:`);
    errors.slice(0, 20).forEach((err) => console.error(`  - ${err}`));
    if (errors.length > 20) console.error(`  ... and ${errors.length - 20} more errors.`);
    process.exit(1);
  }

  console.log('\n✅ All career and college relational links verified successfully! 0 errors.\n');
}

checkCareerData();
