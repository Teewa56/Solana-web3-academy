const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Magic bytes for file type verification
const MAGIC_BYTES = {
    image: [
        [0xFF, 0xD8, 0xFF], // JPEG
        [0x89, 0x50, 0x4E, 0x47], // PNG
        [0x47, 0x49, 0x46], // GIF
        [0x52, 0x49, 0x46, 0x46] // WEBP (RIFF)
    ],
    video: [
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // MP4
        [0x1A, 0x45, 0xDF, 0xA3] // WebM/MKV
    ],
    audio: [
        [0xFF, 0xFB], // MP3
        [0x52, 0x49, 0x46, 0x46], // WAV (RIFF)
        [0x4F, 0x67, 0x67, 0x53] // OGG
    ],
    document: [
        [0x25, 0x50, 0x44, 0x46] // PDF
    ]
};

function checkMagicBytes(filePath, fileType) {
    const buffer = Buffer.alloc(8);
    try {
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        const magicSets = MAGIC_BYTES[fileType] || [];
        
        for (const magicBytes of magicSets) {
            let match = true;
            for (let i = 0; i < magicBytes.length; i++) {
                if (buffer[i] !== magicBytes[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        
        return false;
    } catch (error) {
        logger.error('Magic byte check failed:', error);
        return false;
    }
}

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        image: /jpeg|jpg|png|gif|webp/,
        video: /mp4|avi|mkv|mov|webm/,
        audio: /mp3|wav|ogg|m4a/,
        document: /pdf|doc|docx|txt|md/,
        archive: /zip|rar|7z/
    };

    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');

    // Check if file type is allowed
    let fileType = null;
    for (const [type, regex] of Object.entries(allowedTypes)) {
        if (regex.test(extname)) {
            fileType = type;
            break;
        }
    }

    if (!fileType) {
        cb(new Error('Invalid file type. Only images, videos, audio, documents, and archives are allowed.'));
        return;
    }

    // Skip magic byte check for archives (compression varies)
    if (fileType === 'archive') {
        cb(null, true);
        return;
    }

    // Store file type for later validation
    req.fileType = fileType;
    cb(null, true);
};

// Multer configurations
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    fileFilter: fileFilter
});

const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 10);
const uploadFields = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);
const uploadAssignment = upload.single('assignment');
const uploadCourseMedia = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]);

// Post-upload validation middleware for magic bytes
const validateMagicBytes = (req, res, next) => {
    if (!req.file || !req.fileType) {
        return next();
    }

    try {
        const isValid = checkMagicBytes(req.file.path, req.fileType);
        
        if (!isValid) {
            cleanupFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'File content does not match file extension. Possible malicious file.'
            });
        }
        next();
    } catch (error) {
        if (req.file) {
            cleanupFile(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'File validation failed'
        });
    }
};

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 100MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next();
};

// Cleanup uploaded file
const cleanupFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        logger.error('Error deleting file:', error);
    }
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    uploadAssignment,
    uploadCourseMedia,
    handleUploadError,
    validateMagicBytes,
    cleanupFile,
    uploadsDir
};