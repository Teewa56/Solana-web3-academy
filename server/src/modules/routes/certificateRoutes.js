const express = require('express');
const {
    generateCertificate,
    mintNFT,
    getUserCertificates
} = require('../modules/chain-logic/certificateController');

const router = express.Router();

router.post('/generate', generateCertificate);
router.post('/mint-nft', mintNFT);
router.get('/my-certificates', getUserCertificates);

module.exports = router;