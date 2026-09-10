/**
 * blockchainGraphService.js — TOR-AEGIS
 * Real blockchain graph traversal — Wallet → TX → Wallet edges.
 * Uses BlockCypher free API (no key required for basic lookups).
 * Stores graph edges in blockchain_graph_edges table.
 *
 * Output labeled as: "Transaction clustering — probabilistic intelligence, not identity proof"
 */

const https = require('https');
const crypto = require('crypto');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');
const { sealEvidence } = require('./evidenceVaultService');

const BLOCKCYPHER_BASE = 'https://api.blockcypher.com/v1';
const BLOCKCHAIR_BASE = 'https://api.blockchair.com';

function httpsGet(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'TOR-AEGIS/2.0 NTRO-26151' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

function uid() {
  return `BCEDGE-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Fetch full BTC address info with transactions via BlockCypher.
 * Falls back to Blockchair if BlockCypher fails.
 */
async function fetchAddressWithTxs(address, limit = 20) {
  // Try BlockCypher first
  try {
    const res = await httpsGet(
      `${BLOCKCYPHER_BASE}/btc/main/addrs/${address}?limit=${limit}&includeHex=false`
    );
    if (res.status === 200 && res.body && !res.body.error) {
      const body = res.body;
      const txrefs = [...(body.txrefs || []), ...(body.unconfirmed_txrefs || [])];
      return {
        address,
        balance: (body.balance || 0) / 1e8,
        totalReceived: (body.total_received || 0) / 1e8,
        totalSent: (body.total_sent || 0) / 1e8,
        txCount: body.n_tx || 0,
        txrefs: txrefs.slice(0, limit),
        source: 'BlockCypher',
        liveData: true
      };
    }
  } catch (e) {
    logger.warn(`[BlockchainGraph] BlockCypher failed for ${address}: ${e.message}`);
  }

  // Try Blockchair as fallback
  try {
    const res = await httpsGet(
      `${BLOCKCHAIR_BASE}/bitcoin/dashboards/address/${address}?limit=${limit}`
    );
    if (res.status === 200 && res.body?.data?.[address]) {
      const d = res.body.data[address];
      const addr = d.address || {};
      const txs = d.transactions || [];
      return {
        address,
        balance: (addr.balance || 0) / 1e8,
        totalReceived: (addr.received || 0) / 1e8,
        totalSent: (addr.spent || 0) / 1e8,
        txCount: addr.transaction_count || 0,
        txrefs: txs.slice(0, limit).map(txHash => ({ tx_hash: txHash })),
        source: 'Blockchair',
        liveData: true
      };
    }
  } catch (e) {
    logger.warn(`[BlockchainGraph] Blockchair failed for ${address}: ${e.message}`);
  }

  return { address, liveData: false, source: 'Unavailable', txrefs: [] };
}

/**
 * Fetch a single transaction to extract sender/receiver relationships.
 */
async function fetchTransaction(txHash, chain = 'btc') {
  try {
    const res = await httpsGet(
      `${BLOCKCYPHER_BASE}/${chain}/main/txs/${txHash}?limit=20&includeHex=false`
    );
    if (res.status === 200 && res.body && !res.body.error) {
      const tx = res.body;
      const inputs = (tx.inputs || []).map(i => ({
        address: (i.addresses || [])[0] || 'UNKNOWN',
        value: (i.output_value || 0) / 1e8
      }));
      const outputs = (tx.outputs || []).map(o => ({
        address: (o.addresses || [])[0] || 'UNKNOWN',
        value: (o.value || 0) / 1e8
      }));
      return {
        txHash,
        blockHeight: tx.block_height,
        confirmedAt: tx.confirmed,
        totalInput: inputs.reduce((s, i) => s + i.value, 0),
        totalOutput: outputs.reduce((s, o) => s + o.value, 0),
        inputs,
        outputs,
        liveData: true
      };
    }
  } catch (e) {
    logger.warn(`[BlockchainGraph] TX fetch failed for ${txHash}: ${e.message}`);
  }
  return { txHash, inputs: [], outputs: [], liveData: false };
}

/**
 * Store a blockchain graph edge (from_address → to_address via tx_hash).
 */
function storeEdge(edge) {
  const db = getDB();
  if (!db) return null;
  const edgeId = uid();
  try {
    db.prepare(`
      INSERT OR IGNORE INTO blockchain_graph_edges (
        edge_id, from_address, to_address, tx_hash, chain,
        value_native, block_height, confirmed_at, source,
        actor_id, case_id, relationship_type, collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      edgeId,
      edge.from, edge.to, edge.txHash,
      edge.chain || 'BTC',
      edge.value || 0,
      edge.blockHeight || null,
      edge.confirmedAt || null,
      edge.source || 'BlockCypher',
      edge.actorId || null,
      edge.caseId || null,
      edge.type || 'SENT_TO'
    );
    return edgeId;
  } catch { return null; }
}

/**
 * Build a transaction graph for an address.
 * Fetches real transactions and creates SENT_TO / RECEIVED_FROM edges.
 *
 * IMPORTANT: Transaction clustering is probabilistic intelligence.
 * Output is labeled accordingly.
 */
async function buildAddressGraph(address, options = {}) {
  const {
    actorId = null,
    caseId = null,
    maxDepth = 1,
    maxTxs = 15,
    chain = 'btc'
  } = options;

  logger.info(`[BlockchainGraph] Building graph for ${address} (depth=${maxDepth})`);

  const addressData = await fetchAddressWithTxs(address, maxTxs);
  const edges = [];
  const counterparties = new Set();
  const visited = new Set([address.toLowerCase()]);

  if (addressData.liveData && addressData.txrefs.length > 0) {
    // Sample first N transactions for graph (avoid rate limiting)
    const sampleTxs = addressData.txrefs.slice(0, Math.min(maxTxs, 10));

    for (const ref of sampleTxs) {
      if (!ref.tx_hash) continue;
      const tx = await fetchTransaction(ref.tx_hash, chain);
      if (!tx.liveData) continue;

      // Create edges from inputs → outputs
      for (const inp of tx.inputs) {
        for (const out of tx.outputs) {
          if (inp.address === address) {
            // This address sent to out.address
            const edgeId = storeEdge({
              from: address,
              to: out.address,
              txHash: tx.txHash,
              chain: chain.toUpperCase(),
              value: out.value,
              blockHeight: tx.blockHeight,
              confirmedAt: tx.confirmedAt,
              source: addressData.source,
              actorId,
              caseId,
              type: 'SENT_TO'
            });
            if (edgeId) {
              edges.push({ edgeId, from: address, to: out.address, value: out.value, type: 'SENT_TO', txHash: tx.txHash });
              counterparties.add(out.address);
            }
          } else if (out.address === address) {
            // Someone sent to this address
            const edgeId = storeEdge({
              from: inp.address,
              to: address,
              txHash: tx.txHash,
              chain: chain.toUpperCase(),
              value: out.value,
              blockHeight: tx.blockHeight,
              confirmedAt: tx.confirmedAt,
              source: addressData.source,
              actorId,
              caseId,
              type: 'SENT_TO'
            });
            if (edgeId) {
              edges.push({ edgeId, from: inp.address, to: address, value: out.value, type: 'RECEIVED_FROM', txHash: tx.txHash });
              counterparties.add(inp.address);
            }
          }
        }
      }

      // Small delay to respect public API rate limits
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Seal as evidence
  let evidenceId = null;
  if (edges.length > 0) {
    const sealed = sealEvidence(
      { address, edgeCount: edges.length, counterparties: [...counterparties] },
      {
        source: addressData.source,
        collector: 'blockchainGraphService',
        collectorVersion: '1.0',
        caseId,
        actorId,
        contentType: 'JSON',
        classification: 'RESTRICTED',
        tags: ['blockchain', 'graph', chain]
      }
    );
    evidenceId = sealed.evidenceId;
  }

  return {
    address,
    chain: chain.toUpperCase(),
    balance: addressData.balance,
    totalReceived: addressData.totalReceived,
    totalSent: addressData.totalSent,
    txCount: addressData.txCount,
    edgesBuilt: edges.length,
    counterparties: [...counterparties].slice(0, 20),
    edges,
    evidenceId,
    source: addressData.source,
    liveData: addressData.liveData,
    // IMPORTANT: Always include this label
    analystNote: 'Transaction clustering is probabilistic intelligence — not identity proof. Analyst review required.',
    queriedAt: new Date().toISOString()
  };
}

/**
 * Get stored graph edges for an address.
 */
function getAddressEdges(address, limit = 100) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT * FROM blockchain_graph_edges
      WHERE from_address = ? OR to_address = ?
      ORDER BY collected_at DESC LIMIT ?
    `).all(address, address, limit);
  } catch { return []; }
}

/**
 * Get blockchain graph for an actor.
 */
function getActorBlockchainGraph(actorId) {
  const db = getDB();
  if (!db) return { nodes: [], edges: [] };
  try {
    const edges = db.prepare(`
      SELECT * FROM blockchain_graph_edges WHERE actor_id = ? ORDER BY collected_at DESC LIMIT 200
    `).all(actorId);
    const nodeSet = new Set();
    for (const e of edges) { nodeSet.add(e.from_address); nodeSet.add(e.to_address); }
    return {
      nodes: [...nodeSet].map(a => ({ id: a, type: 'wallet', label: a.slice(0, 12) + '...' })),
      edges: edges.map(e => ({
        id: e.edge_id,
        from: e.from_address,
        to: e.to_address,
        txHash: e.tx_hash,
        value: e.value_native,
        chain: e.chain,
        type: e.relationship_type,
        confirmedAt: e.confirmed_at
      })),
      analystNote: 'Graph represents on-chain observations. Transaction clustering is probabilistic intelligence.'
    };
  } catch { return { nodes: [], edges: [] }; }
}

module.exports = {
  buildAddressGraph,
  fetchAddressWithTxs,
  fetchTransaction,
  getAddressEdges,
  getActorBlockchainGraph
};
