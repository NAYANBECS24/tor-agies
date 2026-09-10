/**
 * stylometryService.js — TOR-AEGIS
 * Real NLP stylometric analysis pipeline.
 * No external API required — pure Node.js feature extraction.
 *
 * Pipeline:
 *   Text → Normalize → Feature Extract → Style Vector → Cosine Similarity → Calibrated Score
 *
 * Features extracted:
 *   - Character trigrams
 *   - Word bigrams
 *   - Function word frequency
 *   - Sentence length distribution
 *   - Vocabulary richness (type-token ratio)
 *   - Yule's K statistic
 *   - Punctuation density
 *   - Caps ratio
 *   - Average word/sentence length
 *
 * Output:
 *   { similarity: 0.91, confidence: 'supporting', analyst_note: 'Analyst review required' }
 *   NOT: "94% match — identity confirmed"
 */

const crypto = require('crypto');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

const MODEL_VERSION = 'style-v1.0';
const FEATURE_VERSION = 'features-v1.0';

// High-frequency English function words (stopwords for authorship analysis)
const FUNCTION_WORDS = [
  'the', 'a', 'an', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up',
  'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'that',
  'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'not', 'no', 'only', 'also', 'just', 'very', 'more', 'most', 'other',
  'some', 'any', 'all', 'both', 'each', 'few', 'more', 'such', 'than'
];

// ─── Text Normalization ───────────────────────────────────────────────────────

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')  // Non-breaking spaces
    .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
    .replace(/[\u201c\u201d]/g, '"')  // Smart double quotes
    .trim();
}

function tokenizeWords(text) {
  return text.toLowerCase().match(/\b[a-z']+\b/g) || [];
}

function tokenizeSentences(text) {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
}

// ─── Feature Extraction ───────────────────────────────────────────────────────

/**
 * Extract character trigrams from text (normalized, lowercase).
 * Returns frequency map of top-N trigrams.
 */
function extractCharTrigrams(text, topN = 200) {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  const counts = {};
  for (let i = 0; i < normalized.length - 2; i++) {
    const tg = normalized.slice(i, i + 3);
    if (/^[a-z ']+$/.test(tg)) {
      counts[tg] = (counts[tg] || 0) + 1;
    }
  }
  // Return top N by frequency
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
}

/**
 * Extract word bigrams frequency map.
 */
function extractWordBigrams(words, topN = 150) {
  const counts = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]}_${words[i + 1]}`;
    counts[bg] = (counts[bg] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
}

/**
 * Extract function word frequency distribution (normalized by total word count).
 */
function extractFunctionWordFreq(words) {
  const total = words.length || 1;
  const freq = {};
  for (const fw of FUNCTION_WORDS) {
    const count = words.filter(w => w === fw).length;
    freq[fw] = parseFloat((count / total).toFixed(6));
  }
  return freq;
}

/**
 * Calculate Yule's K — measure of vocabulary richness.
 * Higher K = more repetitive vocabulary (potential authorship signature).
 */
function calculateYuleK(words) {
  if (words.length === 0) return 0;
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const M1 = words.length;
  const freqOfFreq = {};
  for (const v of Object.values(freq)) {
    freqOfFreq[v] = (freqOfFreq[v] || 0) + 1;
  }

  let sum = 0;
  for (const [r, fr] of Object.entries(freqOfFreq)) {
    sum += fr * Math.pow(Number(r), 2);
  }

  const K = 10000 * (sum - M1) / Math.pow(M1, 2);
  return parseFloat(K.toFixed(2));
}

/**
 * Main feature extraction function. Returns a feature vector object.
 */
function extractFeatures(text) {
  const normalized = normalizeText(text);
  const words = tokenizeWords(normalized);
  const sentences = tokenizeSentences(normalized);

  const wordCount = words.length;
  const charCount = normalized.length;
  const uniqueWords = new Set(words);
  const sentenceCount = sentences.length || 1;

  const avgWordLength = wordCount > 0
    ? parseFloat((words.reduce((s, w) => s + w.length, 0) / wordCount).toFixed(3))
    : 0;

  const avgSentenceLength = wordCount > 0
    ? parseFloat((wordCount / sentenceCount).toFixed(2))
    : 0;

  const vocabRichness = wordCount > 0
    ? parseFloat((uniqueWords.size / wordCount).toFixed(4))
    : 0;

  const punctCount = (normalized.match(/[.,!?;:'"()\-]/g) || []).length;
  const punctuationDensity = charCount > 0
    ? parseFloat((punctCount / charCount).toFixed(4))
    : 0;

  const capsCount = (normalized.match(/[A-Z]/g) || []).length;
  const capsRatio = charCount > 0
    ? parseFloat((capsCount / charCount).toFixed(4))
    : 0;

  const yuleK = calculateYuleK(words);
  const functionWordFreq = extractFunctionWordFreq(words);
  const charTrigrams = extractCharTrigrams(normalized);
  const wordBigrams = extractWordBigrams(words);

  return {
    wordCount,
    charCount,
    avgWordLength,
    avgSentenceLength,
    vocabRichness,
    punctuationDensity,
    capsRatio,
    yuleK,
    functionWordFreq,
    charTrigrams,
    wordBigrams,
    modelVersion: MODEL_VERSION,
    featureVersion: FEATURE_VERSION
  };
}

// ─── Similarity Calculation ───────────────────────────────────────────────────

/**
 * Cosine similarity between two frequency maps.
 */
function cosineSimilarity(mapA, mapB) {
  const allKeys = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  let dot = 0, normA = 0, normB = 0;
  for (const k of allKeys) {
    const a = mapA[k] || 0;
    const b = mapB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute weighted similarity between two feature vectors.
 * Weights reflect authorship-attribution literature consensus.
 */
function computeSimilarity(featA, featB) {
  const weights = {
    charTrigrams: 0.35,
    functionWordFreq: 0.25,
    wordBigrams: 0.20,
    scalars: 0.20  // avg word length, sentence length, Yule's K, etc.
  };

  const charSim = cosineSimilarity(featA.charTrigrams || {}, featB.charTrigrams || {});
  const funcSim = cosineSimilarity(featA.functionWordFreq || {}, featB.functionWordFreq || {});
  const bigramSim = cosineSimilarity(featA.wordBigrams || {}, featB.wordBigrams || {});

  // Scalar feature similarity (1 - normalized absolute difference)
  const scalarKeys = ['avgWordLength', 'avgSentenceLength', 'vocabRichness',
    'punctuationDensity', 'capsRatio', 'yuleK'];
  let scalarSim = 0;
  let scalarCount = 0;
  for (const k of scalarKeys) {
    const a = featA[k] || 0;
    const b = featB[k] || 0;
    const maxVal = Math.max(Math.abs(a), Math.abs(b), 0.0001);
    scalarSim += 1 - Math.min(Math.abs(a - b) / maxVal, 1);
    scalarCount++;
  }
  scalarSim = scalarCount > 0 ? scalarSim / scalarCount : 0;

  const weighted = (
    charSim * weights.charTrigrams +
    funcSim * weights.functionWordFreq +
    bigramSim * weights.wordBigrams +
    scalarSim * weights.scalars
  );

  return parseFloat(weighted.toFixed(4));
}

/**
 * Map similarity score to a human-readable confidence label.
 * Does NOT claim certainty — always requires analyst review.
 */
function calibrateConfidence(similarity) {
  if (similarity >= 0.90) return { level: 'strong_supporting', label: 'Strong supporting evidence', color: 'warning' };
  if (similarity >= 0.75) return { level: 'supporting', label: 'Supporting evidence', color: 'info' };
  if (similarity >= 0.60) return { level: 'weak_supporting', label: 'Weak supporting evidence', color: 'default' };
  if (similarity >= 0.40) return { level: 'inconclusive', label: 'Inconclusive', color: 'default' };
  return { level: 'dissimilar', label: 'Dissimilar style', color: 'success' };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze a single text sample and store its feature vector.
 */
function analyzeText(text, options = {}) {
  const { actorId = null, caseId = null, sourceUrl = null } = options;

  if (!text || text.trim().length < 50) {
    return { success: false, error: 'Text too short (minimum 50 characters)' };
  }

  const features = extractFeatures(text);
  const textHash = crypto.createHash('sha256').update(text).digest('hex');
  const corpusId = `CORPUS-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const db = getDB();
  if (db) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO stylometry_corpus (
          corpus_id, actor_id, case_id, source_url, text_hash, word_count, char_count,
          avg_word_length, avg_sentence_length, vocab_richness, yule_k,
          punctuation_density, caps_ratio, function_word_freq_json,
          char_trigrams_json, word_bigrams_json, text_preview, model_version, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        corpusId, actorId, caseId, sourceUrl, textHash,
        features.wordCount, features.charCount,
        features.avgWordLength, features.avgSentenceLength, features.vocabRichness,
        features.yuleK, features.punctuationDensity, features.capsRatio,
        JSON.stringify(features.functionWordFreq),
        JSON.stringify(features.charTrigrams),
        JSON.stringify(features.wordBigrams),
        text.slice(0, 300),
        MODEL_VERSION
      );
    } catch (e) {
      logger.warn(`[Stylometry] Failed to store corpus entry: ${e.message}`);
    }
  }

  return {
    success: true,
    corpusId,
    textHash,
    wordCount: features.wordCount,
    charCount: features.charCount,
    avgWordLength: features.avgWordLength,
    avgSentenceLength: features.avgSentenceLength,
    vocabRichness: features.vocabRichness,
    yuleK: features.yuleK,
    punctuationDensity: features.punctuationDensity,
    capsRatio: features.capsRatio,
    modelVersion: MODEL_VERSION,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Compare two text samples and return a calibrated similarity score.
 * This is the primary public endpoint for the Stylometry UI screen.
 */
function compareTexts(textA, textB, options = {}) {
  const { actorId = null, caseId = null } = options;

  if (!textA || !textB) {
    return { success: false, error: 'Two text samples required' };
  }
  if (textA.trim().length < 50 || textB.trim().length < 50) {
    return { success: false, error: 'Both texts must be at least 50 characters' };
  }

  logger.info(`[Stylometry] Comparing texts (A: ${textA.length} chars, B: ${textB.length} chars)`);

  const featA = extractFeatures(textA);
  const featB = extractFeatures(textB);
  const similarity = computeSimilarity(featA, featB);
  const confidence = calibrateConfidence(similarity);
  const analysisId = `STYLO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Store the analysis result
  const db = getDB();
  if (db) {
    try {
      db.prepare(`
        INSERT INTO stylometry_analyses (
          analysis_id, corpus_a_preview, corpus_b_preview, similarity_score,
          verdict, metrics_json, confidence_pct, analyzed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        analysisId,
        textA.slice(0, 200),
        textB.slice(0, 200),
        Math.round(similarity * 100),
        confidence.label,
        JSON.stringify({
          charTrigramSim: cosineSimilarity(featA.charTrigrams, featB.charTrigrams),
          functionWordSim: cosineSimilarity(featA.functionWordFreq, featB.functionWordFreq),
          wordBigramSim: cosineSimilarity(featA.wordBigrams, featB.wordBigrams),
          yuleKA: featA.yuleK, yuleKB: featB.yuleK,
          vocabRichnessA: featA.vocabRichness, vocabRichnessB: featB.vocabRichness
        }),
        Math.round(similarity * 100)
      );
    } catch (e) {
      logger.warn(`[Stylometry] Failed to store analysis: ${e.message}`);
    }
  }

  return {
    success: true,
    analysisId,
    similarity: parseFloat(similarity.toFixed(4)),
    similarityPct: Math.round(similarity * 100),
    confidence: confidence.level,
    confidenceLabel: confidence.label,
    confidenceColor: confidence.color,
    modelVersion: MODEL_VERSION,
    featureVersion: FEATURE_VERSION,
    sampleCountA: featA.wordCount,
    sampleCountB: featB.wordCount,
    // Breakdown by feature type
    breakdown: {
      charTrigrams: parseFloat(cosineSimilarity(featA.charTrigrams, featB.charTrigrams).toFixed(4)),
      functionWords: parseFloat(cosineSimilarity(featA.functionWordFreq, featB.functionWordFreq).toFixed(4)),
      wordBigrams: parseFloat(cosineSimilarity(featA.wordBigrams, featB.wordBigrams).toFixed(4))
    },
    scalarFeatures: {
      avgWordLengthA: featA.avgWordLength, avgWordLengthB: featB.avgWordLength,
      avgSentenceLengthA: featA.avgSentenceLength, avgSentenceLengthB: featB.avgSentenceLength,
      vocabRichnessA: featA.vocabRichness, vocabRichnessB: featB.vocabRichness,
      yuleKA: featA.yuleK, yuleKB: featB.yuleK
    },
    // IMPORTANT: Always include this label
    analystNote: 'Style similarity score is probabilistic supporting evidence. Analyst review required before any attribution claim.',
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Get recent analyses from DB.
 */
function getRecentAnalyses(limit = 20) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT analysis_id, corpus_a_preview, corpus_b_preview, similarity_score,
             verdict, confidence_pct, analyzed_at
      FROM stylometry_analyses ORDER BY analyzed_at DESC LIMIT ?
    `).all(limit);
  } catch { return []; }
}

/**
 * Get corpus entries for an actor.
 */
function getActorCorpus(actorId) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT corpus_id, text_hash, word_count, avg_word_length, vocab_richness,
             yule_k, model_version, collected_at, text_preview
      FROM stylometry_corpus WHERE actor_id = ? ORDER BY collected_at DESC
    `).all(actorId);
  } catch { return []; }
}

module.exports = {
  analyzeText,
  compareTexts,
  extractFeatures,
  getRecentAnalyses,
  getActorCorpus,
  MODEL_VERSION,
  FEATURE_VERSION
};
