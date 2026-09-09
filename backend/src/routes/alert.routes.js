const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authorize } = require('../middleware/auth');

// Alert management
router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStatistics);
router.get('/:id', alertController.getAlertById);
router.post('/', authorize('admin', 'analyst'), alertController.createAlert);
router.put('/:id', authorize('admin', 'analyst'), alertController.updateAlert);
router.put('/:id/acknowledge', alertController.acknowledgeAlert);
router.put('/:id/resolve', authorize('admin', 'analyst'), alertController.resolveAlert);
router.put('/:id/close', authorize('admin'), alertController.closeAlert);
router.put('/:id/assign', authorize('admin', 'analyst'), alertController.assignAlert);
router.post('/:id/notes', alertController.addNote);
router.post('/bulk-update', authorize('admin', 'analyst'), alertController.bulkUpdateAlerts);

module.exports = router;