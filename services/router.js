/**
 * Router routes HTTP requests to appropriate controllers.
 */

'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();
const actionsController = require('./controllers/actions-controller');
const propertiesController = require('./controllers/properties-controller');
const settingsController = require('./controllers/settings-controller');

// Use JSON middleware (disable strict to allow lone strings as valid JSON)
router.use(express.json({strict:false}));
// Serve Web of Things property requests
router.use('/properties', propertiesController);
// Serve Web of Things action requests
router.use('/actions', actionsController);
// Serve settings requests
router.use('/settings', settingsController);
// Serve static files
router.use('/js/lib/dompurify',
  express.static(path.join(__dirname, '..', 'node_modules/dompurify/dist')));
router.use(express.static(path.join(__dirname, 'views')));

module.exports = router;
