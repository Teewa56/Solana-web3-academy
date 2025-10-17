const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        image: /jpeg|jpg|png|gif|webp/,
        video: /mp4|avi|mkv|mov|webm/,
        audio: /mp3|wav|ogg|m4a/,
        document: /pdf|doc|docx|txt|md/,
        archive: /zip|rar|7z/
    };

    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mimetype = file.mimetype;

    // Check if file type is allowed
    let isAllowed = false;
    for (const type in allowedTypes) {
        if (allowedTypes[type].test(extname)) {
            isAllowed = true;
            break;
        }
    }

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, audio, documents, and archives are allowed.'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    fileFilter: fileFilter
});

// Specific upload configurations
const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 10); // Max 10 files
const uploadFields = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

// Assignment submission upload
const uploadAssignment = upload.single('assignment');

// Course media upload
const uploadCourseMedia = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]);

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
        console.error('Error deleting file:', error);
    }
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    uploadAssignment,
    uploadCourseMedia,
    handleUploadError,
    cleanupFile,
    uploadsDir
};