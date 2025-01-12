const express = require('express');
const errorController = require('../controllers/errorController');
const router = express.Router();

// Catch-all route for 404 errors
router.use(errorController.get404);

module.exports = router;
