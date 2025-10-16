const express = require('express');
const {
    generateCertificate,
    mintNFT,
    getUserCertificates
} = require('../controllers/certificateController');

const router = express.Router();

router.post('/generate', generateCertificate);
router.post('/mint-nft', mintNFT);
router.get('/my-certificates', getUserCertificates);

module.exports = router;