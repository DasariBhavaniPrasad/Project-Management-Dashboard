const express = require('express');
const dashboardController = require('../controllers/dashboard');
const router = express.Router();

router.get('/dashboard', dashboardController.getDashboard);



module.exports = router;
