/**
 * Router routes HTTP requests to appropriate controllers.
 */
const express = require('express');
const path = require('path');
const router = express.Router();
const actionsController = require('./controllers/actions-controller');
const propertiesController = require('./controllers/properties-controller');

// Use JSON middleware (disable strict to allow lone strings as valid JSON)
router.use(express.json({strict:false}));
// Serve action requests
router.use('/actions', actionsController);
router.use('/properties', propertiesController);
// Serve static files
router.use('/js/lib/dompurify',
  express.static(path.join(__dirname, '..', 'node_modules/dompurify/dist')));
router.use(express.static(path.join(__dirname, 'views')));

module.exports = router;
