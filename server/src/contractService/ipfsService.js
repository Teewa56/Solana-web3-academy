const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');
const credentialEncryptor = require('../utils/credentialEncryption');

class IPFSService {
    constructor() {
        try {
            const encryptedKey = process.env.PINATA_API_KEY;
            const encryptedSecret = process.env.PINATA_SECRET_KEY;
            const encryptedJwt = process.env.PINATA_JWT;

            this.pinataApiKey = credentialEncryptor.decrypt(encryptedKey);
            this.pinataSecretKey = credentialEncryptor.decrypt(encryptedSecret);
            this.pinataJWT = credentialEncryptor.decrypt(encryptedJwt);
            this.pinataBaseUrl = 'https://api.pinata.cloud';
        } catch (error) {
            logger.error('Failed to initialize IPFS service:', error);
            throw error;
        }
    }

    // Upload file to IPFS via Pinata
    async uploadFile(filePath, fileName) {
        try {
            const url = `${this.pinataBaseUrl}/pinning/pinFileToIPFS`;
            
            const data = new FormData();
            data.append('file', fs.createReadStream(filePath));
            
            const metadata = JSON.stringify({
                name: fileName,
                keyvalues: {
                    uploadedBy: 'Web3Academy',
                    timestamp: new Date().toISOString()
                }
            });
            data.append('pinataMetadata', metadata);

            const response = await axios.post(url, data, {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            logger.info(`File uploaded to IPFS: ${response.data.IpfsHash}`);

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };
        } catch (error) {
            logger.error('Error uploading to IPFS:', error);
            throw error;
        }
    }

    // Upload JSON metadata to IPFS
    async uploadJSON(jsonData, name) {
        try {
            const url = `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`;
            
            const data = {
                pinataContent: jsonData,
                pinataMetadata: {
                    name: name,
                    keyvalues: {
                        type: 'metadata',
                        uploadedBy: 'Web3Academy',
                        timestamp: new Date().toISOString()
                    }
                }
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            logger.info(`JSON uploaded to IPFS: ${response.data.IpfsHash}`);

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };
        } catch (error) {
            logger.error('Error uploading JSON to IPFS:', error);
            throw error;
        }
    }

    // Upload certificate metadata
    async uploadCertificateMetadata(certificateData) {
        try {
            const metadata = {
                name: `${certificateData.courseName} - Certificate`,
                description: `Official completion certificate for ${certificateData.courseName} issued by Web3 Academy`,
                image: certificateData.imageUrl || '', // Optional certificate image
                attributes: [
                    {
                        trait_type: 'Student Name',
                        value: certificateData.studentName
                    },
                    {
                        trait_type: 'Course',
                        value: certificateData.courseName
                    },
                    {
                        trait_type: 'Cohort',
                        value: certificateData.cohortName
                    },
                    {
                        trait_type: 'Grade',
                        value: `${certificateData.grade}%`
                    },
                    {
                        trait_type: 'Completion Date',
                        value: certificateData.completionDate
                    },
                    {
                        trait_type: 'Certificate ID',
                        value: certificateData.certificateId
                    },
                    {
                        trait_type: 'Issuer',
                        value: 'Web3 Academy'
                    },
                    {
                        trait_type: 'Blockchain',
                        value: 'Solana'
                    }
                ],
                properties: {
                    files: [],
                    category: 'certificate'
                }
            };

            return await this.uploadJSON(metadata, `certificate-${certificateData.certificateId}`);
        } catch (error) {
            logger.error('Error uploading certificate metadata:', error);
            throw error;
        }
    }

    // Upload course media
    async uploadCourseMedia(filePath, courseTitle, mediaType) {
        try {
            const fileName = `${courseTitle}-${mediaType}-${Date.now()}`;
            return await this.uploadFile(filePath, fileName);
        } catch (error) {
            logger.error('Error uploading course media:', error);
            throw error;
        }
    }

    // Unpin file from IPFS
    async unpinFile(ipfsHash) {
        try {
            const url = `${this.pinataBaseUrl}/pinning/unpin/${ipfsHash}`;
            
            await axios.delete(url, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            logger.info(`File unpinned from IPFS: ${ipfsHash}`);
            
            return { success: true, message: 'File unpinned successfully' };
        } catch (error) {
            logger.error('Error unpinning file:', error);
            throw error;
        }
    }

    // Get pinned files list
    async getPinnedFiles() {
        try {
            const url = `${this.pinataBaseUrl}/data/pinList?status=pinned`;
            
            const response = await axios.get(url, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            return {
                success: true,
                count: response.data.count,
                files: response.data.rows
            };
        } catch (error) {
            logger.error('Error fetching pinned files:', error);
            throw error;
        }
    }
}

// Singleton instance
const ipfsService = new IPFSService();

module.exports = ipfsService;