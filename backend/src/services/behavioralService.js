/**
 * behavioralService.js — TOR Sentinel 2.0
 * Behavioral profiling: UTC timezone inference, OPSEC scoring, activity correlation.
 */

// ─── UTC Timezone Inference from Posting Timestamps ────────────────────────────
function inferTimezone(postingTimestamps) {
  if (!postingTimestamps || postingTimestamps.length === 0) {
    return { timezone: 'Unknown', confidence: 0, activityHeatmap: new Array(24).fill(0) };
  }

  const hourCounts = new Array(24).fill(0);
  postingTimestamps.forEach(ts => {
    const d = new Date(ts);
    hourCounts[d.getUTCHours()]++;
  });

  // Find peak activity window (3-hour rolling average)
  let maxRolling = 0, peakHour = 0;
  for (let h = 0; h < 24; h++) {
    const rolling = hourCounts[h] + hourCounts[(h + 1) % 24] + hourCounts[(h + 2) % 24];
    if (rolling > maxRolling) { maxRolling = rolling; peakHour = h + 1; }
  }

  // Infer "awake" hours = 9:00–23:00 local time → peak UTC maps to local timezone
  // Assuming activity peak = ~14:00 local (2pm)
  const utcOffset = ((14 - peakHour) + 24) % 24;
  const offsetHours = utcOffset > 12 ? utcOffset - 24 : utcOffset;

  const timezoneMap = {
    '-11': 'Pacific/Samoa', '-10': 'Pacific/Honolulu', '-8': 'America/Los_Angeles',
    '-7': 'America/Denver', '-6': 'America/Chicago', '-5': 'America/New_York',
    '-4': 'America/Halifax', '-3': 'America/Sao_Paulo', '0': 'Europe/London',
    '1': 'Europe/Paris', '2': 'Europe/Helsinki', '3': 'Europe/Moscow',
    '4': 'Asia/Dubai', '5': 'Asia/Karachi', '5.5': 'Asia/Kolkata',
    '6': 'Asia/Dhaka', '7': 'Asia/Bangkok', '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo', '10': 'Australia/Sydney', '12': 'Pacific/Auckland',
  };

  const inferredTz = timezoneMap[String(offsetHours)] || `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  const totalPosts = postingTimestamps.length;
  const peakPct = (maxRolling / totalPosts) * 100;
  const confidence = Math.min(Math.round(peakPct * 1.5), 92);

  return {
    inferredTimezone: inferredTz,
    utcOffset: offsetHours,
    confidence,
    activityHeatmap: hourCounts,
    peakHour,
    totalPostsAnalyzed: totalPosts,
    interpretation: inferTzInterpretation(inferredTz, confidence),
  };
}

function inferTzInterpretation(tz, confidence) {
  if (confidence >= 70) return `High confidence actor operates in ${tz} timezone. Activity patterns are consistent with a single geographic region.`;
  if (confidence >= 50) return `Moderate evidence suggests ${tz}. Actor may use VPNs or have irregular sleep patterns.`;
  return 'Insufficient data for reliable timezone inference. Collect more posting timestamps.';
}

// ─── OPSEC Score ───────────────────────────────────────────────────────────────
function calculateOpSecScore(actor) {
  let score = 100;
  const findings = [];
  const recommendations = [];

  // PGP key age
  if (actor.pgpCreationDate) {
    const ageMonths = (Date.now() - new Date(actor.pgpCreationDate)) / (30 * 86400000);
    if (ageMonths < 6) { score -= 10; findings.push('PGP key is less than 6 months old — new or rotated'); }
    else if (ageMonths > 36) { score -= 15; findings.push('PGP key is over 3 years old — long-term operation'); }
  } else {
    score -= 20; findings.push('No PGP key found'); recommendations.push('Always sign messages with PGP');
  }

  // Wallet reuse
  const walletCount = (actor.cryptoWallets || []).length;
  if (walletCount === 1) { score -= 25; findings.push('Single wallet reused across all transactions'); recommendations.push('Use unique wallets per transaction'); }
  else if (walletCount < 3) { score -= 10; findings.push('Low wallet diversity'); }

  // Handle reuse across markets
  const marketCount = (actor.marketplaces || []).length;
  if (marketCount > 2) { score -= 15; findings.push('Same handle active on multiple marketplaces simultaneously'); recommendations.push('Use different handles per marketplace'); }

  // Contact ID exposure
  const contactCount = (actor.contactIds || []).length;
  if (contactCount > 2) { score -= 10; findings.push(`${contactCount} contact IDs exposed`); }

  // Origin IP revealed
  if (actor.originIpAttribution) { score -= 30; findings.push('Origin server IP de-cloaked via TLS/favicon fingerprinting'); recommendations.push('Rotate hosting, change SSL certs'); }

  const level = score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : score >= 25 ? 'LOW' : 'CRITICAL';
  return {
    score: Math.max(score, 0),
    level,
    color: score >= 75 ? '#4caf50' : score >= 50 ? '#ff9800' : score >= 25 ? '#f44336' : '#9c27b0',
    findings,
    recommendations,
    interpretation: `Actor OPSEC rated ${level} (${Math.max(score, 0)}/100). ${findings.length} vulnerabilities detected.`,
  };
}

// ─── Cross-Marketplace Activity Correlation ────────────────────────────────────
function correlateActivityPatterns(actorA, actorB) {
  if (!actorA.postTimestamps || !actorB.postTimestamps) {
    return { correlated: false, confidence: 0, reason: 'Insufficient timestamp data' };
  }
  const tsA = actorA.postTimestamps.map(t => new Date(t).getTime());
  const tsB = actorB.postTimestamps.map(t => new Date(t).getTime());
  
  let syncCount = 0;
  const WINDOW_MS = 3600000; // 1-hour window
  tsA.forEach(ta => {
    if (tsB.some(tb => Math.abs(ta - tb) < WINDOW_MS)) syncCount++;
  });
  
  const syncRate = tsA.length > 0 ? syncCount / tsA.length : 0;
  const confidence = Math.round(syncRate * 100);
  return {
    correlated: syncRate > 0.3,
    syncRate: Math.round(syncRate * 1000) / 1000,
    confidence,
    syncCount,
    interpretation: syncRate > 0.5 ? 'HIGH CORRELATION — simultaneous cross-market activity strongly suggests same operator' : syncRate > 0.3 ? 'MODERATE — partial overlap in posting times' : 'LOW — posting patterns not synchronized',
  };
}

// ─── Language Detection (simple heuristics) ───────────────────────────────────
function detectLanguageHeuristics(text) {
  const lower = text.toLowerCase();
  const indicators = [
    { lang: 'Russian', code: 'RU', patterns: [/\b(и|в|на|не|что|как|для|это|от|но)\b/g, /[а-яё]/g] },
    { lang: 'German', code: 'DE', patterns: [/\b(ich|und|das|die|der|ist|nicht|ein|mit|zu)\b/g, /[äöüß]/g] },
    { lang: 'Spanish', code: 'ES', patterns: [/\b(y|en|de|que|el|la|no|es|por|con)\b/g, /[ñáéíóú]/g] },
    { lang: 'French', code: 'FR', patterns: [/\b(le|la|les|de|du|des|et|en|un|une)\b/g, /[àâçèéêëîïôùûü]/g] },
    { lang: 'English', code: 'EN', patterns: [/\b(the|and|is|in|it|of|to|a|that|i)\b/g] },
  ];

  let best = { lang: 'Unknown', code: 'XX', score: 0 };
  indicators.forEach(ind => {
    let score = 0;
    ind.patterns.forEach(p => { const m = lower.match(p); score += m ? m.length : 0; });
    if (score > best.score) best = { lang: ind.lang, code: ind.code, score };
  });

  const machineTranslated = detectMachineTranslation(text);
  return {
    primaryLanguage: best.lang,
    languageCode: best.code,
    confidence: Math.min(Math.round((best.score / Math.max(text.split(' ').length, 1)) * 200), 95),
    machineTranslatedFlag: machineTranslated,
    machineTranslationEvidence: machineTranslated ? 'Suspiciously uniform grammar, no colloquialisms detected' : null,
  };
}

function detectMachineTranslation(text) {
  const words = text.match(/\b\w+\b/g) || [];
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const sentLens = sentences.map(s => s.split(' ').length);
  const sentVariance = sentLens.length > 1 ? Math.sqrt(sentLens.reduce((s, l) => s + Math.pow(l - sentLens.reduce((a, b) => a + b, 0) / sentLens.length, 2), 0) / sentLens.length) : 10;
  return sentVariance < 2.5 && avgWordLen > 5.5;
}

// ─── Pricing Pattern Analysis ─────────────────────────────────────────────────
function analyzePricingPatterns(listings) {
  if (!listings || listings.length === 0) return null;
  const prices = listings.map(l => l.price).filter(p => p > 0);
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const discounts = listings.filter(l => l.originalPrice && l.price < l.originalPrice);
  
  return {
    averagePrice: Math.round(avg * 100) / 100,
    minPrice: min, maxPrice: max,
    discountFrequency: listings.length > 0 ? Math.round((discounts.length / listings.length) * 100) : 0,
    pricingStyle: avg > 5 ? 'Premium Seller' : avg > 1 ? 'Mid-market' : 'Volume Seller',
    consistencyScore: max > 0 ? Math.round((1 - (max - min) / max) * 100) : 0,
  };
}

// ─── Generate Sample Behavioral Data ────────────────────────────────────────────
function generateSampleBehavioralData(actorHandle) {
  const seed = actorHandle.charCodeAt(0) + actorHandle.charCodeAt(1);
  const peakHour = (seed % 8) + 10; // 10:00 - 17:00 UTC range
  
  const timestamps = Array.from({ length: 60 }, (_, i) => {
    const hoursAgo = i * 24 + (Math.random() * 6 - 3);
    const hour = (peakHour + Math.floor(Math.random() * 4) - 2 + 24) % 24;
    const d = new Date(Date.now() - hoursAgo * 3600000);
    d.setUTCHours(hour, Math.floor(Math.random() * 60), 0, 0);
    return d.toISOString();
  });

  const listings = Array.from({ length: 12 }, (_, i) => ({
    price: Math.round((seed * 0.03 + i * 0.2 + 0.5) * 100) / 100,
    originalPrice: i % 4 === 0 ? Math.round((seed * 0.04 + i * 0.2 + 0.7) * 100) / 100 : null,
    title: `Listing #${i + 1}`,
  }));

  return { timestamps, listings };
}

module.exports = {
  inferTimezone, calculateOpSecScore, correlateActivityPatterns,
  detectLanguageHeuristics, analyzePricingPatterns, generateSampleBehavioralData,
};
