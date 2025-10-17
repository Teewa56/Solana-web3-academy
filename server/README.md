# Web3 Academy Backend - Complete Setup Guide

## 🎯 What Has Been Implemented

### ✅ High Priority Features (COMPLETED)
1. **Email Verification System**
   - OTP generation and verification
   - Email verification endpoint
   - OTP resend functionality
   - 10-minute expiry

2. **Solana Blockchain Integration**
   - Full Anchor program integration
   - Cohort creation on-chain
   - Course creation on-chain
   - Student enrollment on-chain
   - Assignment submission on-chain
   - Grading on-chain
   - NFT certificate minting
   - Certificate transfer

### ✅ Medium Priority Features (COMPLETED)
1. **NFT Certificate Minting**
   - Generate certificate metadata
   - Upload metadata to IPFS
   - Mint NFT on Solana
   - Transfer to student wallet
   - Certificate verification

2. **File Upload & IPFS**
   - Multer file upload middleware
   - IPFS/Pinata integration
   - Course media upload (video/audio)
   - Assignment file upload
   - Certificate metadata upload
   - File management (pin/unpin)

3. **Gamification System**
   - Points system with multiple triggers
   - Badge system (8 badge types)
   - Leaderboard (global and cohort-based)
   - Points breakdown
   - Admin manual awarding

4. **Course Enrollment**
   - Cohort enrollment with blockchain
   - Course enrollment
   - Unenrollment
   - Available courses listing
   - Enrollment statistics

5. **Plagiarism Detection**
   - Internal plagiarism check (against other submissions)
   - External plagiarism check (API integration ready)
   - Answer key matching
   - Keyword extraction
   - Similarity scoring
   - Comprehensive reporting

---

## 📁 New File Structure

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── authController.js ✅ (Updated)
│   │   │   └── authRoutes.js ✅ (Updated)
│   │   ├── gamification/
│   │   │   ├── gamificationController.js ✅ (New)
│   │   │   └── gamificationRoutes.js ✅ (New)
│   │   ├── enrollment/
│   │   │   ├── enrollmentController.js ✅ (New)
│   │   │   └── enrollmentRoutes.js ✅ (New)
│   │   ├── upload/
│   │   │   ├── uploadController.js ✅ (New)
│   │   │   └── uploadRoutes.js ✅ (New)
│   │   ├── chain-logic/
│   │   │   ├── certificateController.js ✅ (Updated)
│   │   │   └── certificateRoutes.js ✅ (Updated)
│   │   └── cohorts/
│   │       └── submissionController.js ✅ (Updated)
│   ├── middleware/
│   │   └── uploadMiddleware.js ✅ (New)
│   ├── utils/
│   │   ├── solanaService.js ✅ (New)
│   │   ├── ipfsService.js ✅ (New)
│   │   └── plagiarismService.js ✅ (New)
│   ├── app.js ✅ (Updated)
│   └── server.js ✅ (Updated)
├── uploads/ (auto-created)
├── idl/
│   └── web3_academy.json (required)
├── .env.example ✅ (Updated)
└── package.json ✅ (Updated)
```

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
# Required
MONGO_URI=mongodb://localhost:27017/web3academy
ACCESS_TOKEN_SECRET=<generate-32-char-secret>
REFRESH_TOKEN_SECRET=<generate-32-char-secret>
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Solana (Required for blockchain features)
CONTRACT_PROGRAM_ID=FdJCM2mmwrLXXu6ZDbsogBpBABUb7JxH8x91ZDXELqDc
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PATH=/home/user/.config/solana/id.json

# IPFS (Required for file uploads)
PINATA_API_KEY=<your-pinata-key>
PINATA_SECRET_KEY=<your-pinata-secret>
PINATA_JWT=<your-pinata-jwt>

# Optional
PLAGIARISM_API_KEY=<copyleaks-key>
```

### 3. Setup MongoDB

```bash
# Start MongoDB (if using local)
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI with your Atlas connection string
```

### 4. Setup Solana Wallet

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL
solana airdrop 2 --url devnet

# Verify balance
solana balance --url devnet
```

### 5. Setup Smart Contract IDL

Copy the IDL file from your Anchor project:

```bash
mkdir -p server/idl
cp smart-contract/web3_academy/target/idl/web3_academy.json server/idl/
```

### 6. Setup Pinata (IPFS)

1. Go to https://pinata.cloud
2. Create free account
3. Get API keys from Settings → API Keys
4. Add to `.env`

### 7. Generate JWT Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Server Output

```
✅ Database connected successfully
✅ Solana service initialized successfully
🚀 Server is running on port 5000
📍 Environment: development
🌐 API: http://localhost:5000/api/v1
```

---

## 📡 API Endpoints

### New Endpoints

#### Authentication
- `POST /api/v1/auth/verify-email` - Verify email with OTP
- `POST /api/v1/auth/resend-otp` - Resend OTP

#### Gamification
- `GET /api/v1/gamification/my-stats` - Get student stats
- `GET /api/v1/gamification/leaderboard` - Get leaderboard
- `GET /api/v1/gamification/badges` - Get available badges
- `GET /api/v1/gamification/points-breakdown` - Get points breakdown
- `POST /api/v1/gamification/award-points` - Admin: Award points
- `POST /api/v1/gamification/award-badge` - Admin: Award badge

#### Enrollment
- `POST /api/v1/enrollment/enroll-cohort` - Enroll in cohort
- `POST /api/v1/enrollment/enroll-course` - Enroll in course
- `DELETE /api/v1/enrollment/unenroll-course/:id` - Unenroll from course
- `GET /api/v1/enrollment/my-courses` - Get enrolled courses
- `GET /api/v1/enrollment/available-courses` - Get available courses
- `GET /api/v1/enrollment/stats` - Admin: Get enrollment stats

#### Upload/IPFS
- `POST /api/v1/upload/file` - Upload file to IPFS
- `POST /api/v1/upload/course-media` - Upload course video/audio
- `POST /api/v1/upload/certificate-metadata` - Upload certificate metadata
- `POST /api/v1/upload/assignment` - Upload assignment file
- `GET /api/v1/upload/pinned-files` - Admin: List pinned files
- `DELETE /api/v1/upload/unpin/:hash` - Admin: Unpin file

#### Certificates
- `GET /api/v1/certificates/verify/:nftMint` - Verify certificate
- `POST /api/v1/certificates/issue` - Admin: Issue certificate

#### Submissions
- `GET /api/v1/submissions/my/:assignmentId` - Get my submission
- `GET /api/v1/submissions/stats/:assignmentId` - Get submission stats

---

## 🧪 Testing

### Test Registration Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# 2. Check email for OTP, then verify
curl -X POST http://localhost:5000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Test Enrollment Flow

```bash
# 1. Login and get token
TOKEN="your_access_token"

# 2. Enroll in cohort
curl -X POST http://localhost:5000/api/v1/enrollment/enroll-cohort \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cohortId": "cohort_id_here",
    "walletAddress": "your_solana_wallet"
  }'

# 3. Enroll in course
curl -X POST http://localhost:5000/api/v1/enrollment/enroll-course \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course_id_here"
  }'
```

### Test File Upload

```bash
curl -X POST http://localhost:5000/api/v1/upload/file \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.pdf"
```

---

## 🔧 Configuration

### Points System

Edit `POINTS_CONFIG` in `gamificationController.js`:

```javascript
const POINTS_CONFIG = {
    ASSIGNMENT_SUBMIT: 10,
    ASSIGNMENT_PERFECT: 50,
    COURSE_COMPLETE: 100,
    // ...
};
```

### Plagiarism Threshold

Edit `similarityThreshold` in `plagiarismService.js`:

```javascript
this.similarityThreshold = 0.7; // 70%
```

### File Upload Limits

Edit in `uploadMiddleware.js`:

```javascript
limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
}
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB or check MONGO_URI

### Solana Service Failed
```
⚠️ Solana service initialization failed
```
**Solution**: 
- Check WALLET_PATH exists
- Verify CONTRACT_PROGRAM_ID is correct
- Ensure wallet has SOL for transactions

### IPFS Upload Failed
```
Error: Pinata authentication failed
```
**Solution**: Verify PINATA_API_KEY and PINATA_SECRET_KEY

### Email Sending Failed
```
Error: Invalid login
```
**Solution**: Use Gmail App Password, not regular password

---

## 📊 Database Indexes

Ensure indexes are created for performance:

```javascript
// Run in MongoDB shell
db.users.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ points: -1 });
db.submissions.createIndex({ assignment: 1, student: 1 });
db.cohorts.createIndex({ name: 1 }, { unique: true });
```

---

## 🔒 Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for specific domains
- [ ] Use MongoDB Atlas with authentication
- [ ] Keep dependencies updated
- [ ] Enable rate limiting
- [ ] Use helmet for security headers

---

## 🚢 Deployment

### Deploy to VPS

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start src/server.js --name web3-academy

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Deploy to Heroku

```bash
# Add Procfile
echo "web: node src/server.js" > Procfile

# Deploy
heroku create web3-academy-api
git push heroku main
```

---

## 📚 Next Steps

1. **Frontend Integration**: Connect React/Next.js frontend
2. **Testing**: Write unit and integration tests
3. **Documentation**: Add Swagger/OpenAPI docs
4. **Monitoring**: Setup error tracking (Sentry)
5. **Analytics**: Add usage analytics
6. **CI/CD**: Setup automated deployment

---

## 🎉 You're All Set!

Your Web3 Academy backend is now fully functional with:
✅ Email verification
✅ Blockchain integration
✅ NFT certificates
✅ File uploads (IPFS)
✅ Gamification
✅ Plagiarism detection
✅ Course enrollment

Happy coding! 🚀