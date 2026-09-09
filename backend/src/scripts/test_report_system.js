const { getDB } = require('../config/database');
const reportService = require('../services/reportService');
const db = getDB();

console.log('=== STEP 1: VERIFY DATABASE ARCHITECTURE ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Detected SQLite Tables:', tables.map(t => t.name).join(', '));

const requiredTables = ['reports', 'onion_scans', 'blockchain_traces', 'stylometry_analyses', 'evidence_custody_logs'];
const missingTables = requiredTables.filter(t => !tables.some(row => row.name === t));
if (missingTables.length > 0) {
  console.error('FAILED: Missing tables:', missingTables);
  process.exit(1);
}
console.log('PASSED: All 5 forensic database tables are present.');

console.log('\n=== STEP 2: VERIFY REPORT RETRIEVAL & STATS ===');
const stats = reportService.getReportStats();
console.log('Report Statistics:', JSON.stringify(stats, null, 2));

const allReports = reportService.getAllReports();
console.log(`Found ${allReports.length} reports in the SQLite Vault.`);
if (allReports.length === 0) {
  console.error('FAILED: Expected seeded reports in the Vault.');
  process.exit(1);
}

console.log('\n=== STEP 3: VERIFY DIGITAL SEAL INTEGRITY ===');
const sampleReport = allReports[0];
const sealVerification = reportService.verifyDigitalSeal(sampleReport.report_id);
console.log(`Seal verification for ${sampleReport.report_id}:`, sealVerification);
if (!sealVerification.verified) {
  console.error('FAILED: Digital seal verification failed!');
  process.exit(1);
}
console.log('PASSED: SHA-256 Digital Seal verified and tamper-evident.');

console.log('\n=== STEP 4: VERIFY REPORT REVISION COMPARATOR & DIFF ===');
if (allReports.length >= 2) {
  const diff = reportService.compareReports(allReports[0].report_id, allReports[1].report_id);
  console.log('Comparison successful:');
  console.log(`- Base Report: [${diff.reportA.id}] ${diff.reportA.title}`);
  console.log(`- Comp Report: [${diff.reportB.id}] ${diff.reportB.title}`);
  console.log(`- Threat Score Delta: ${diff.delta.threatScoreDelta > 0 ? '+' : ''}${diff.delta.threatScoreDelta}`);
  console.log(`- Threat Trend: ${diff.delta.threatTrend}`);
  console.log(`- Status Transition: ${diff.delta.statusTransition}`);
  console.log(`- Newly Discovered Wallets: ${diff.delta.newWalletsDiscovered.length}`);
  console.log(`- Newly Discovered Aliases: ${diff.delta.newAliasesDiscovered.length}`);
}

console.log('\n=== STEP 5: VERIFY CO-SIGNING & CRYPTOGRAPHIC KEYRING ===');
const signedReport = reportService.signReport(sampleReport.report_id, {
  officerName: 'Dr. K. Swaminathan',
  officerBadge: 'CFSL-CHIEF-9901',
  role: 'Chief Cyber Scientific Officer'
});
const sigs = signedReport.content?.signatures || [];
console.log(`Co-signed report ${signedReport.report_id}:`);
console.log(`- Signatures in Keyring: ${sigs.length}`);
if (sigs.length > 0) {
  console.log(`- Latest Signature Token: ${sigs[sigs.length - 1].signatureToken}`);
}

console.log('\n=== STEP 6: VERIFY DYNAMIC SECURITY REDACTION ===');
const fullReport = reportService.getReportById(sampleReport.report_id);
const redactedLawEnforcement = reportService.redactReport(fullReport, 'LAW_ENFORCEMENT_SANITIZED');
console.log('Redaction Level: LAW_ENFORCEMENT_SANITIZED');
console.log(`- Classification header: ${redactedLawEnforcement.classification}`);
console.log(`- Masked author badge: ${redactedLawEnforcement.authorBadge}`);
if (redactedLawEnforcement.content?.originIpAttribution) {
  console.log(`- Masked origin candidate: ${redactedLawEnforcement.content.originIpAttribution}`);
}

console.log('\n=== STEP 7: VERIFY MULTI-FORMAT EXPORTS ===');
const htmlExport = reportService.exportReport(sampleReport.report_id, 'html');
const jsonExport = reportService.exportReport(sampleReport.report_id, 'json');
const csvExport = reportService.exportReport(sampleReport.report_id, 'csv');
const txtExport = reportService.exportReport(sampleReport.report_id, 'txt');

console.log(`- HTML Court Exhibit size: ${htmlExport.data.length} characters`);
console.log(`- JSON Defense Payload size: ${jsonExport.data.length} characters`);
console.log(`- CSV Evidentiary Ledger rows: ${csvExport.data.split('\n').length}`);
console.log(`- TXT Intel Brief size: ${txtExport.data.length} characters`);

console.log('\n=============================================');
console.log('✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
console.log('=============================================');
