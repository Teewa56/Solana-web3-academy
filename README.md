# Web3 Academy

A decentralized learning management system (LMS) built on Solana blockchain that provides blockchain-verified credentials through NFT certificates. Web3 Academy combines traditional backend infrastructure with smart contracts to deliver an immersive educational experience focused on blockchain development.

## 🌟 Overview

Web3 Academy is a comprehensive educational platform that bridges Web2 and Web3 technologies. Students can enroll in cohorts, complete courses, submit assignments, and earn blockchain-verified NFT certificates upon completion. The platform ensures credential authenticity through Solana's blockchain while maintaining a robust off-chain infrastructure for day-to-day operations.

### Key Features

- **Cohort-Based Learning**: Organize students into cohorts with specific start/end dates
- **Course Management**: Create and manage courses with multimedia content (text, audio, video via IPFS)
- **Assignment System**: Submit, grade, and track assignments with plagiarism checks
- **Blockchain Verification**: Mint NFT certificates for course completion on Solana
- **Role-Based Access Control**: Separate permissions for students, instructors, and admins
- **Gamification**: Points, badges, and leaderboards to incentivize learning
- **Email Notifications**: Automated emails for key events (acceptance, results, certificates)
- **Security First**: Rate limiting, input sanitization, XSS protection, and NoSQL injection prevention

---

## 📁 Project Structure

```
├── server/                          # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── dbConfig.js          # MongoDB connection
│   │   │   └── env.js               # Environment variables
│   │   ├── middleware/              # Express middleware
│   │   │   ├── authMiddleware.js    # JWT authentication
│   │   │   ├── errorMiddleware.js   # Error handling
│   │   │   ├── rateLimiter.js       # Rate limiting (100 req/15min)
│   │   │   ├── roleCheck.js         # Role-based access control
│   │   │   └── validator.js         # Request validation
│   │   ├── modules/                 # Feature modules
│   │   │   ├── admin/               # Admin management
│   │   │   ├── auth/                # Authentication
│   │   │   ├── chain-logic/         # Blockchain interaction
│   │   │   ├── cohorts/             # Cohort management
│   │   │   ├── courses/             # Course management
│   │   │   ├── students/            # Student management
│   │   │   └── models/              # Database models
│   │   ├── templates/               # Email templates (EJS)
│   │   ├── utils/                   # Utility functions
│   │   │   ├── authHelpers.js       # OTP, password hashing
│   │   │   ├── emailService.js      # Email sending
│   │   │   ├── jwtHelpers.js        # JWT token management
│   │   │   └── logger.js            # Winston logger
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── security-test/               # Security testing scripts
│   ├── tests/                       # Unit/integration tests
│   └── package.json
│
└── smart-contract/web3_academy/     # Solana Smart Contract (Anchor)
    ├── programs/web3_academy/
    │   └── src/
    │       ├── state/               # State accounts
    │       │   ├── assignment.rs    # Assignment template state
    │       │   ├── cohort.rs        # Cohort state
    │       │   ├── course.rs        # Course state
    │       │   ├── enrollmentAcc.rs # Student enrollment
    │       │   ├── role.rs          # Role management
    │       │   ├── submission.rs    # Assignment submission
    │       │   └── transferNft.rs   # NFT transfer logic
    │       ├── instruction.rs       # Program instructions
    │       ├── error.rs             # Custom errors
    │       └── lib.rs               # Program entry point
    ├── tests/                       # Anchor tests
    ├── migrations/                  # Deployment scripts
    └── Anchor.toml                  # Anchor configuration
```

---

## 🚀 Getting Started

### Prerequisites

**Backend:**
- Node.js (v16+)
- MongoDB (v4.4+)
- npm or yarn

**Smart Contract:**
- Rust (1.89.0)
- Solana CLI (1.18+)
- Anchor Framework (0.32.1)

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/web3academy
DB_HOST=localhost

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
SALT_ROUNDS=10

# CORS
CORS_ORIGIN_LOCAL=http://localhost:3000
CORS_ORIGIN_PROD=https://yourdomain.com

# Email Configuration
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
```

---

## 🔧 Installation & Setup

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run the server
npm start

# For development with auto-reload
npm run dev
```

The API will be available at `http://localhost:5000`

### Smart Contract Setup

```bash
# Navigate to smart contract directory
cd smart-contract/web3_academy

# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test

# Deploy to localnet
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

**Program ID**: `FdJCM2mmwrLXXu6ZDbsogBpBABUb7JxH8x91ZDXELqDc`

---

## 📊 Database Models

### User Model
```javascript
{
  fullName: String (required),
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'admin'],
  profile: {
    bio: String,
    avatar: String
  },
  isActive: Boolean,
  isEmailVerified: Boolean,
  resetPasswordToken: String,
  timestamps: true
}
```

### Student Model
```javascript
{
  user: ObjectId (ref: User),
  registeredCourses: [ObjectId],
  applicationVerified: Boolean,
  cohort: ObjectId (ref: Cohort),
  points: Number,
  coursesCompleted: Number,
  badges: [String],
  timestamps: true
}
```

### Cohort Model
```javascript
{
  name: String (required, unique),
  description: String,
  startDate: Date,
  endDate: Date,
  students: [ObjectId],
  courses: [ObjectId],
  status: Enum ['active', 'completed', 'upcoming'],
  timestamps: true
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  chain: String,
  contractAddress: String,
  media: {
    text: String,
    audio: String (IPFS),
    video: String (IPFS)
  },
  cohort: ObjectId,
  createdBy: ObjectId (ref: Admin),
  timestamps: true
}
```

### Assignment Model
```javascript
{
  title: String (required),
  description: String (required),
  answer: String (required),
  dueDate: Date (required),
  course: ObjectId (ref: Course),
  isActive: Boolean,
  submissions: [ObjectId],
  timestamps: true
}
```

### Submission Model
```javascript
{
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: Student),
  content: String,
  fileUrl: String,
  txId: String, // Blockchain transaction ID
  passedPlagiarismCheck: Boolean,
  passedAssignmentCheck: Boolean,
  verifiedOwnership: Boolean,
  submittedAt: Date,
  timestamps: true
}
```

---

## 🔗 Smart Contract Architecture

### State Accounts

#### CohortAccount
```rust
pub struct CohortAccount {
    pub name: String,
    pub description: String,
    pub start_date: i64,
    pub end_date: i64,
    pub creator: Pubkey,
    pub status: CohortStatus, // Upcoming, Active, Completed
}
```

#### CourseAccount
```rust
pub struct CourseAccount {
    pub title: String,
    pub description: String,
    pub instructor: Pubkey,
    pub cohort: Pubkey,
    pub media_url: String,
    pub created_at: i64,
}
```

#### AssignmentSubmissionAccount
```rust
pub struct AssignmentSubmissionAccount {
    pub student: Pubkey,
    pub course: Pubkey,
    pub submission_link: String,
    pub submitted_at: i64,
    pub grade: Option<u8>, // 0-100
}
```

#### RoleAccount
```rust
pub struct RoleAccount {
    pub authority: Pubkey,
    pub is_admin: bool,
    pub is_instructor: bool,
}
```

### Instructions

1. **create_cohort**: Initialize a new cohort (admin only)
2. **create_course**: Add a course to a cohort (admin only)
3. **submit_assignment**: Student submits assignment
4. **grade_assignment**: Instructor grades submission (0-100)
5. **mint_certificate**: Mint NFT certificate for course completion
6. **issue_certificate**: Transfer NFT certificate to student
7. **enroll_student**: Enroll student in cohort
8. **create_assignment_template**: Create assignment template for course

---

## 🔐 Security Features

### Backend Security

- **Helmet.js**: Secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: 
  - `hpp`: Prevents HTTP parameter pollution
- **JWT Authentication**: Access & refresh token strategy
- **Password Hashing**: bcrypt with configurable salt rounds
- **Request Validation**: Joi schema validation
- **HTTP-Only Cookies**: Secure token storage
- **Morgan Logging**: HTTP request logging
- **Winston Logger**: Application-level logging

### Smart Contract Security

- **Access Control**: Role-based permissions (admin, instructor, student)
- **Input Validation**: Grade validation (0-100 range)
- **Account Ownership**: `has_one` constraints
- **Signer Verification**: Required signers for state changes
- **Overflow Protection**: Enabled in release profile

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/authTest.test.js

# Security tests
node security-test/penetrationTest.js
```

**Available Security Tests:**
- NoSQL Injection testing
- XSS vulnerability testing
- Static analysis (ESLint)
- Dynamic analysis (Node debugger)

### Smart Contract Tests

```bash
# Run Anchor tests
anchor test

# Run specific test
anchor test --skip-local-validator
```

### Load Testing

```bash
# Using Artillery
npm install -g artillery
artillery run load-test.yml
```

Configuration: 60s duration, 20 requests/second

---

## 📧 Email Templates

Available email templates (located in `src/templates/`):

1. **welcomeEmail.ejs**: New user registration
2. **otpEmail.ejs**: OTP for email verification (10-min expiry)
3. **studentAcceptance.ejs**: Program admission approval
4. **studentRemoval.ejs**: Program removal notice
5. **courseRegistration.ejs**: Course enrollment confirmation
6. **resultNotification.ejs**: Course results announcement
7. **certificateTemplate.ejs**: NFT certificate metadata

---

## 🎮 Gamification System

### Points System
- Course completion: Variable points
- Assignment submission: Points awarded
- Early submission bonus: Additional points
- Perfect score bonus: Extra points

### Badges
- Course-specific badges (e.g., "JavaScript Basics", "Blockchain 101")
- Achievement badges
- Milestone badges

### Leaderboard
- Global ranking by points
- Cohort-specific leaderboards
- Course completion tracking

---

## 🔄 Workflow Examples

### Student Registration Flow

1. User registers via `/api/v1/auth/register`
2. OTP sent to email for verification
3. User verifies email with OTP
4. Student profile created automatically
5. Welcome email sent

### Course Completion Flow

1. Student enrolls in cohort
2. Student completes course assignments
3. Instructor grades submissions on-chain
4. System calculates final grade
5. NFT certificate minted if grade ≥ passing threshold
6. Certificate transferred to student wallet
7. Result notification email sent

### Assignment Submission Flow

1. Student submits assignment (off-chain)
2. Submission recorded in database with `txId`
3. Plagiarism check performed
4. Assignment check against answer key
5. Instructor grades on Solana blockchain
6. Grade synchronized to database
7. Student notified of result

---

## 🛠️ API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
```

### Student Endpoints

```
GET    /api/v1/students/:id
PUT    /api/v1/students/:id
GET    /api/v1/students/:id/courses
POST   /api/v1/students/:id/enroll
GET    /api/v1/students/:id/submissions
```

### Course Endpoints

```
GET    /api/v1/courses
POST   /api/v1/courses (admin)
GET    /api/v1/courses/:id
PUT    /api/v1/courses/:id (admin)
DELETE /api/v1/courses/:id (admin)
```

### Cohort Endpoints

```
GET    /api/v1/cohorts
POST   /api/v1/cohorts (admin)
GET    /api/v1/cohorts/:id
PUT    /api/v1/cohorts/:id (admin)
GET    /api/v1/cohorts/:id/students
```

### Assignment Endpoints

```
GET    /api/v1/assignments
POST   /api/v1/assignments (admin)
POST   /api/v1/assignments/:id/submit
PUT    /api/v1/assignments/:id/grade (admin)
```

---

## 📈 Monitoring & Analytics

### SonarQube Integration

```bash
# Install SonarQube scanner
npm install -g sonar-scanner

# Run analysis
sonar-scanner
```

Configuration in `sonar.properties`:
- Project key: `my_project_key`
- Project name: `Web3Academy`
- Host: `http://localhost:9000`

### Winston Logging

Logs are stored in:
- `error.log`: Error-level logs
- `combined.log`: All logs

Log format: JSON with timestamps

---

## 🚢 Deployment

### Backend Deployment

**Prerequisites:**
- VPS/Cloud instance (AWS, DigitalOcean, etc.)
- MongoDB Atlas or managed MongoDB
- Domain with SSL certificate

```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start src/server.js --name web3academy-api

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Smart Contract Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet-beta (⚠️ costs real SOL)
anchor deploy --provider.cluster mainnet-beta
```

**Post-deployment:**
1. Update program ID in `Anchor.toml`
2. Update program ID in `lib.rs` using `declare_id!`
3. Rebuild and redeploy
4. Update backend with new contract addresses

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Backend**: ESLint with Airbnb style guide
- **Smart Contract**: Rust fmt and clippy
- Write tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Team

**Project**: Web3 Academy  
**Focus**: Blockchain Education with Solana

---

## 🙏 Acknowledgments

- Anchor Framework by Coral
- Solana Foundation
- Node.js Community
- MongoDB Team

---

**Built with ❤️ for the Web3 Education Community**