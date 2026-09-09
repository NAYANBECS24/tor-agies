/**
 * adaptiveAtwcEstimator.js — TOR Sentinel 2.0
 * Adaptive Time-Window Correlation (ATWC) Network-State Estimator
 *
 * Mathematically transforms public Onionoo network-state indicators into a dynamic
 * statistical latency prior (μ_prior, σ_prior) and adaptive correlation window W,
 * rather than asserting direct physical observation of encrypted circuit transit.
 *
 * Mathematical Formulation:
 *   C_t = min(1.0, 0.6 * (O_t / N_t) + 0.4 * max(0, 1 - (B_t / B_0)))
 *   μ_prior = μ_0 * (1 + 0.85 * C_t)
 *   σ_prior = σ_0 * sqrt(1 + 1.25 * C_t)
 *   W = [max(50.0, μ_prior - 2.5 * σ_prior), μ_prior + 3.0 * σ_prior]
 *
 * Note on Provenance:
 *   B_0 is the rolling median of historical snapshot averages from SQLite.
 *   Coefficients (0.6, 0.4, 0.85, 1.25) are prototype calibration parameters.
 */

const onionooCollector = require('./onionooCollector');

class AdaptiveAtwcEstimator {
  constructor() {
    this.baseMu = 350.0; // Nominal baseline circuit latency prior (ms)
    this.baseSigma = 85.0; // Nominal baseline latency variance prior (ms)
  }

  /**
   * Retrieves the current live Tor network state from the latest Onionoo snapshot
   */
  getNetworkState() {
    const snapshot = onionooCollector.getLatestSnapshot();

    if (!snapshot) {
      return {
        isAvailable: false,
        source: 'baseline_default',
        congestionFactor: 0.12,
        currentAvgBandwidthMB: '52.50 MB/s',
        historicalBaselineB0MB: '52.50 MB/s',
        baselineProvenance: { method: 'default_nominal' },
        muPrior: this.baseMu,
        sigmaPrior: this.baseSigma,
        window: [137.5, 605.0],
        windowWidthMs: 467.5,
        totalRelays: 7200,
        runningRelays: 6800,
        overloadCount: 45,
        status: 'Nominal baseline prior (Snapshot pending)',
        nomenclature: 'Estimated Network-State Latency Prior (μ_prior, σ_prior)',
        calibrationNote: 'Prototype coefficients (0.6, 0.4, 0.85, 1.25) subject to empirical calibration.'
      };
    }

    const congestion = snapshot.congestionFactor !== undefined ? snapshot.congestionFactor : 0.12;
    const mu = snapshot.adaptiveTiming?.muPrior || (this.baseMu * (1 + 0.85 * congestion));
    const sigma = snapshot.adaptiveTiming?.sigmaPrior || (this.baseSigma * Math.sqrt(1 + 1.25 * congestion));
    const windowMin = snapshot.adaptiveTiming?.windowMin || Math.max(50.0, mu - 2.5 * sigma);
    const windowMax = snapshot.adaptiveTiming?.windowMax || (mu + 3.0 * sigma);

    return {
      isAvailable: true,
      snapshotId: snapshot.snapshotId,
      source: 'onionoo_live',
      congestionFactor: congestion,
      currentAvgBandwidthMB: snapshot.avgBandwidthMB,
      historicalBaselineB0MB: snapshot.baselineB0MB,
      baselineProvenance: snapshot.baselineProvenance || {},
      muPrior: parseFloat(mu.toFixed(1)),
      sigmaPrior: parseFloat(sigma.toFixed(1)),
      window: [parseFloat(windowMin.toFixed(1)), parseFloat(windowMax.toFixed(1))],
      windowWidthMs: parseFloat((windowMax - windowMin).toFixed(1)),
      totalRelays: snapshot.totalRelays,
      runningRelays: snapshot.runningRelays,
      guardRelays: snapshot.guardRelays,
      exitRelays: snapshot.exitRelays,
      overloadCount: snapshot.overloadRelays,
      totalBandwidthGbit: snapshot.totalBandwidthGbit,
      httpCacheStatus: snapshot.httpCacheStatus,
      lastModified: snapshot.lastModified,
      timestamp: snapshot.timestamp,
      freshness: onionooCollector.getDataFreshness(),
      nomenclature: 'Estimated Network-State Latency Prior (μ_prior, σ_prior)',
      calibrationNote: 'Prototype coefficients (0.6, 0.4, 0.85, 1.25) subject to empirical calibration.',
      modelExplanation: 'Transforms public Onionoo network-state indicators into statistical prior bounds for ATWC probabilistic correlation without inspecting private encrypted user packets.'
    };
  }

  /**
   * Evaluates statistical timing correlation between an ingress event and an egress event
   * using the dynamically adjusted Gaussian latency distribution prior
   */
  correlateEvents(ingressTimeMs, egressTimeMs, relayInfo = {}) {
    const netState = this.getNetworkState();
    const deltaT = Math.abs(egressTimeMs - ingressTimeMs);

    const mu = netState.muPrior;
    const sigma = netState.sigmaPrior;
    const [wMin, wMax] = netState.window;

    // Check if within adaptive timing window
    const inWindow = deltaT >= wMin && deltaT <= wMax;

    // Gaussian probability density
    const exponent = -Math.pow(deltaT - mu, 2) / (2 * Math.pow(sigma, 2));
    const rawPdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

    // Normalize confidence to 0 - 100%
    const maxPdf = 1 / (sigma * Math.sqrt(2 * Math.PI));
    let confidence = Math.round((rawPdf / maxPdf) * 100);

    // Observed bandwidth boost factor (higher capacity relays have tighter propagation variance)
    if (relayInfo.bandwidth) {
      const bwBoost = Math.min(10, Math.round(relayInfo.bandwidth / (20 * 1024 * 1024)));
      confidence = Math.min(99, confidence + bwBoost);
    }

    return {
      ingressTime: new Date(ingressTimeMs).toISOString(),
      egressTime: new Date(egressTimeMs).toISOString(),
      observedDeltaMs: deltaT,
      priorMuMs: mu,
      priorSigmaMs: sigma,
      adaptiveWindow: [wMin, wMax],
      inWindow,
      correlationConfidence: inWindow ? Math.max(40, confidence) : Math.max(5, Math.round(confidence * 0.2)),
      congestionAtObservation: netState.congestionFactor,
      baselineB0MB: netState.historicalBaselineB0MB,
      method: 'Adaptive Time-Window Correlation (ATWC) with Onionoo Latency Prior',
      disclaimer: 'Probabilistic timing prior derived from public Tor network state; does not represent direct measurement of encrypted packet payload transit.'
    };
  }
}

module.exports = new AdaptiveAtwcEstimator();
