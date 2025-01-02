const router = require('express').Router();
const apiController = require('../controller/apiController');
const apiReport = require('../controller/apiReport');
const apiSectorLogController = require('../controller/apiSectorLogController');
const apiUkController = require('../controller/apiUkController');
const apiSfplController = require('../controller/apiSfplController');
const apiHadesController = require('../controller/apiHadeController');
const apiDashboardController = require('../controller/apiDashboardController');
const apiSendData = require('../controller/apiSendData');
const apiAftnController = require('../controller/apiAftnController');

router.get('/pardi', apiController.pardi);
router.get('/ovset', apiController.ovset);
router.get('/lebeg', apiController.lebeg);
router.get('/bunik', apiController.bunik);
router.get('/plbJmb', apiController.plbJmb);
router.get('/mimixRupka', apiController.mimixRupka);

router.get('/uk', apiUkController.uk);
// router.put('/updateData', apiUkController.updateData);
router.post('/bufferingSfpl', apiSfplController.bufferingSfpl)
router.post('/getData', apiSendData.sendData);

router.post('/report', apiReport.dataReport);
router.post('/tapor', apiReport.tapor);
router.post('/lebaranReport', apiReport.lebaranReport);
router.post('/reportUpdate', apiReport.updateReport)
router.post('/reportUpdateTable', apiReport.updateReportTable);

router.post('/buffering', apiSectorLogController.buffering);
router.post('/sectorLog', apiSectorLogController.readSectorLog);
router.post('/modalSectorLog', apiSectorLogController.modalSectorLog);

router.get('/download/:file', apiHadesController.download);
router.get('/downloadAftn/:date', apiHadesController.aftn);

router.get('/sector', apiDashboardController.sector);
router.post('/dashboard', apiDashboardController.dashboard);
router.post('/allSfpl', apiDashboardController.allSfpl);
router.post('/dataPerSector', apiDashboardController.dataPerSerctor);
router.post('/dataPerPoint', apiDashboardController.dataPerPoint);
router.post('/tsdData', apiDashboardController.tsdData);

router.post('/aftn', apiAftnController.gettingData);
module.exports = router;