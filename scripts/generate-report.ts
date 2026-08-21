/**
 * Phase 0: Pre-Import Report Generator
 * 
 * Produces the required report artifact matching Section 4 of the build plan:
 * - Total states processed (must equal 28)
 * - Colleges per state
 * - Total raw college records
 * - Exact duplicates found
 * - Fuzzy duplicates found
 * - Invalid / missing records
 * - Records flagged NEEDS_REVIEW
 * - Successfully imported records
 */

export interface PreImportReport {
  totalStatesProcessed: number;
  collegesPerState: Record<string, number>;
  totalRawRecords: number;
  exactDuplicatesFound: number;
  fuzzyDuplicatesFound: number;
  invalidMissingRecords: number;
  recordsFlaggedNeedsReview: number;
  successfullyImportedRecords: number;
  timestamp: string;
}

export function formatReportMarkdown(report: PreImportReport): string {
  const stateRows = Object.entries(report.collegesPerState)
    .map(([state, count]) => `| ${state} | ${count} |`)
    .join('\n');

  return `# Pre-Import Dataset Report (28-State Workbook)

**Generated:** ${report.timestamp}

## Summary Metrics

| Metric | Count / Status | Notes |
|---|---|---|
| **Total States Processed** | ${report.totalStatesProcessed} / 28 | ${report.totalStatesProcessed === 28 ? '✅ Complete 28 States' : '⚠️ Gaps Found'} |
| **Total Raw College Records** | ${report.totalRawRecords} | Total rows across all state sheets |
| **Exact Duplicates Found** | ${report.exactDuplicatesFound} | Byte-identical name & state after normalization |
| **Fuzzy / Spelling Duplicates** | ${report.fuzzyDuplicatesFound} | Flagged for manual confirmation |
| **Invalid / Missing Records** | ${report.invalidMissingRecords} | Missing essential fields |
| **Records Flagged NEEDS_REVIEW** | ${report.recordsFlaggedNeedsReview} | Ambiguous data preserved for admin resolution |
| **Successfully Ready for Import** | ${report.successfullyImportedRecords} | Clean validated records ready for PostgreSQL |

## State-wise Breakdown

| State | College Records |
|---|---|
${stateRows}

---
*Note: This report is a mandatory review checkpoint before committing records to Neon PostgreSQL.*
`;
}
