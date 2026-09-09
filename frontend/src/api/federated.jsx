// Mock API for federated learning
export const federatedApi = {
  getStatus: async () => {
    return {
      data: {
        federationActive: true,
        currentRound: 8,
        totalRounds: 10,
        roundProgress: 75,
        globalAccuracy: 0.87,
        globalRecall: 0.94,
        globalPrecision: 0.82,
        globalF1: 0.88,
        privacyScore: 0.98,
        epsilon: 1.2,
        delta: 1e-5,
        securityScore: 0.95,
        totalParticipants: 12,
        activeParticipants: 8,
        totalDataPoints: 1248000,
        avgDataPerISP: 104000,
        learningRate: 0.001,
        batchSize: 32,
        epochsPerRound: 5,
        aggregationMethod: 'fedavg',
        uploadSpeed: 45,
        downloadSpeed: 120,
        latency: 28,
        bandwidthUsage: 342
      }
    };
  },
  
  startTraining: async (params) => {
    console.log('Starting training with params:', params);
    return { data: { success: true, message: 'Training started' } };
  },
  
  getTrainingHistory: async () => {
    return {
      data: [
        { round: 1, accuracy: 0.65, loss: 0.42, participants: 4, duration: '12m' },
        { round: 2, accuracy: 0.71, loss: 0.38, participants: 6, duration: '15m' },
        { round: 3, accuracy: 0.75, loss: 0.35, participants: 7, duration: '18m' },
        { round: 4, accuracy: 0.78, loss: 0.32, participants: 8, duration: '20m' },
        { round: 5, accuracy: 0.81, loss: 0.29, participants: 9, duration: '22m' },
        { round: 6, accuracy: 0.83, loss: 0.26, participants: 10, duration: '25m' },
        { round: 7, accuracy: 0.85, loss: 0.23, participants: 11, duration: '28m' },
        { round: 8, accuracy: 0.87, loss: 0.21, participants: 12, duration: '30m' },
      ]
    };
  }
};