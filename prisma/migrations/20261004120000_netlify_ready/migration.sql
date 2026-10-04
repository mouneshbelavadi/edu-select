-- DropForeignKey
ALTER TABLE "SavedCollege" DROP CONSTRAINT "SavedCollege_collegeId_fkey";

-- CreateTable
CREATE TABLE "CollegeOverride" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollegeOverride_collegeId_key" ON "CollegeOverride"("collegeId");
