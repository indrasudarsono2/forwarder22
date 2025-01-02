const router = require('express').Router();
const adminController = require('../controller/adminController');

router.post('/', adminController.push);
router.get('/errorFile', adminController.errorFile);
router.get('/errorMessage', adminController.errorMessage);
router.get('/fileMaster', adminController.fileMaster);

module.exports = router;