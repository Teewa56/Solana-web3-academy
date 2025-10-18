// ==============================================
// WEB3 ACADEMY - COMPLETE API ENDPOINTS
// ==============================================

// BASE URL: http://localhost:5000/api/v1

// ==============================================
// 1. AUTHENTICATION ENDPOINTS
// ==============================================

POST /auth/register
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student" // or "admin"
}
Response: { success, message, data }

POST /auth/login
Body: {
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { success, accessToken, user }

POST /auth/verify-email
Body: {
  "email": "john@example.com",
  "otp": "123456"
}
Response: { success, accessToken, userData }

POST /auth/resend-otp
Body: {
  "email": "john@example.com"
}
Response: { success, message }

POST /auth/logout
Headers: Authorization: Bearer <token>
Response: { success, message }

POST /auth/refresh-token
Response: { success, accessToken }

POST /auth/forgot-password
Body: {
  "email": "john@example.com"
}
Response: { success, message }

POST /auth/reset-password
Body: {
  "token": "resetToken123",
  "newPassword": "newPassword123"
}
Response: { success, message }

// ==============================================
// 2. USER ENDPOINTS
// ==============================================

GET /users/profile
Headers: Authorization: Bearer <token>
Response: { success, user }

PUT /users/update-profile
Headers: Authorization: Bearer <token>
Body: {
  "fullName": "Jane Doe",
  "bio": "Blockchain developer",
  "avatar": "https://..."
}
Response: { success, user }

// ==============================================
// 3. STUDENT ENDPOINTS
// ==============================================

GET /students
Headers: Authorization: Bearer <token>
Response: { success, student }

PUT /students/update-student
Headers: Authorization: Bearer <token>
Body: {
  "solanaWallet": "ABC123XYZ..."
}
Response: { success, student }

POST /students/enroll-cohort
Headers: Authorization: Bearer <token>
Body: {
  "cohortId": "cohortId123"
}
Response: { success, message, student }

GET /students/:id/courses
Headers: Authorization: Bearer <token>
Response: { success, courses }

GET /students/:id/submissions
Headers: Authorization: Bearer <token>
Response: { success, submissions }

// ==============================================
// 4. COHORT ENDPOINTS
// ==============================================

GET /cohorts
Response: { success, cohorts }

GET /cohorts/:id
Response: { success, cohort }

GET /cohorts/:id/students
Response: { success, students }

POST /cohorts
Headers: Authorization: Bearer <token>
Body: {
  "name": "Solana Bootcamp Q4",
  "description": "Learn Solana development",
  "startDate": "2025-10-18",
  "endDate": "2025-12-18"
}
Response: { success, cohort }

PUT /cohorts/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "...",
  "description": "...",
  "status": "active" // "upcoming", "active", "completed"
}
Response: { success, cohort }

// ==============================================
// 5. COURSE ENDPOINTS
// ==============================================

GET /courses
Response: { success, courses }

GET /courses/:id
Response: { success, course }

GET /courses/cohort/:cohortId
Response: { success, courses }

POST /courses
Headers: Authorization: Bearer <token>
Body: {
  "title": "Intro to Anchor",
  "description": "Learn Anchor framework",
  "chain": "solana",
  "contractAddress": "ABC123XYZ...",
  "media": {
    "text": "Course content",
    "audio": "https://ipfs.io/...",
    "video": "https://ipfs.io/..."
  },
  "cohort": "cohortId123"
}
Response: { success, course }

PUT /courses/:id
Headers: Authorization: Bearer <token>
Body: { title, description, chain, contractAddress, media }
Response: { success, course }

DELETE /courses/:id
Headers: Authorization: Bearer <token>
Response: { success, message }

// ==============================================
// 6. ASSIGNMENT ENDPOINTS
// ==============================================

GET /assignments/:id
Response: { success, assignment }

GET /assignments/course/:courseId
Response: { success, assignments }

POST /assignments
Headers: Authorization: Bearer <token>
Body: {
  "title": "Build a Token",
  "description": "Create SPL token",
  "answer": "Expected solution",
  "dueDate": "2025-10-25",
  "course": "courseId123"
}
Response: { success, assignment }

PUT /assignments/:id
Headers: Authorization: Bearer <token>
Body: { title, description, answer, dueDate, isActive }
Response: { success, assignment }

// ==============================================
// 7. SUBMISSION ENDPOINTS
// ==============================================

POST /submissions/submit
Headers: Authorization: Bearer <token>
Body: {
  "assignmentId": "assignmentId123",
  "content": "Solution code",
  "fileUrl": "https://..."
}
Response: { success, submission, plagiarismCheck, bonusPoints }

GET /submissions/:assignmentId
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&status=ungraded
Response: { success, submissions, totalPages, total, count }

GET /submissions/:assignmentId/my-submission
Headers: Authorization: Bearer <token>
Response: { success, submission }

PUT /submissions/:submissionId/grade
Headers: Authorization: Bearer <token>
Body: {
  "grade": 85,
  "feedback": "Great work"
}
Response: { success, submission, studentPoints }

GET /submissions/:assignmentId/stats
Response: { success, stats }

// ==============================================
// 8. GAMIFICATION ENDPOINTS
// ==============================================

GET /gamification/my-stats
Headers: Authorization: Bearer <token>
Response: { success, stats }

GET /gamification/leaderboard
Query: ?cohortId=cohortId123&limit=50
Response: { success, leaderboard, count }

GET /gamification/badges
Headers: Authorization: Bearer <token>
Response: { success, earned, total, progress, badges }

GET /gamification/points-breakdown
Headers: Authorization: Bearer <token>
Response: { success, breakdown }

POST /gamification/award-points
Headers: Authorization: Bearer <token>
Body: {
  "studentId": "studentId123",
  "points": 100,
  "reason": "Bonus achievement"
}
Response: { success, totalPoints, newBadges }

POST /gamification/award-badge
Headers: Authorization: Bearer <token>
Body: {
  "studentId": "studentId123",
  "badgeName": "Course Master"
}
Response: { success, badges, points }

// ==============================================
// 9. ENROLLMENT ENDPOINTS
// ==============================================

POST /enrollments/enroll-cohort
Headers: Authorization: Bearer <token>
Body: {
  "cohortId": "cohortId123",
  "walletAddress": "ABC123XYZ..." // optional
}
Response: { success, cohort, blockchainEnrollment }

POST /enrollments/enroll-course
Headers: Authorization: Bearer <token>
Body: {
  "courseId": "courseId123"
}
Response: { success, course }

DELETE /enrollments/unenroll-course/:courseId
Headers: Authorization: Bearer <token>
Response: { success, message }

GET /enrollments/my-courses
Headers: Authorization: Bearer <token>
Response: { success, courses, count }

GET /enrollments/available-courses
Headers: Authorization: Bearer <token>
Response: { success, cohort, courses, count }

GET /enrollments/stats
Headers: Authorization: Bearer <token>
Query: ?cohortId=cohortId123
Response: { success, stats }

// ==============================================
// 10. CERTIFICATE ENDPOINTS
// ==============================================

POST /certificates/generate
Headers: Authorization: Bearer <token>
Body: {
  "courseId": "courseId123"
}
Response: { success, certificateData, message }

POST /certificates/mint-nft
Headers: Authorization: Bearer <token>
Body: {
  "courseId": "courseId123",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/...",
  "certificateData": { ... }
}
Response: { success, nftMint, txId, explorerUrl, points, badges }

GET /certificates/my-certificates
Headers: Authorization: Bearer <token>
Response: { success, certificates, count }

GET /certificates/verify/:nftMint
Response: { success, verified, certificate }

POST /certificates/issue
Headers: Authorization: Bearer <token>
Body: {
  "studentId": "studentId123",
  "courseId": "courseId123",
  "grade": 85
}
Response: { success, message, studentWallet, nextStep }

// ==============================================
// 11. UPLOAD ENDPOINTS
// ==============================================

POST /upload/file
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: FormData with file
Response: { success, data }

POST /upload/course-media
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: FormData with video/audio, Body: { courseTitle }
Response: { success, data }

POST /upload/certificate-metadata
Headers: Authorization: Bearer <token>
Body: {
  "certificateData": { studentName, courseName, cohortName, grade, ... }
}
Response: { success, data }

POST /upload/assignment
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: FormData with file, Body: { assignmentId }
Response: { success, data }

GET /upload/pinned-files
Headers: Authorization: Bearer <token>
Response: { success, data }

DELETE /upload/unpin/:ipfsHash
Headers: Authorization: Bearer <token>
Response: { success, message, data }

// ==============================================
// 12. ADMIN ENDPOINTS
// ==============================================

GET /admin/users
Headers: Authorization: Bearer <token>
Response: { success, users }

POST /admin/users/promote
Headers: Authorization: Bearer <token>
Body: {
  "userId": "userId123"
}
Response: { success, user, admin }

DELETE /admin/users/:userId
Headers: Authorization: Bearer <token>
Response: { success, message }

GET /admin/stats
Headers: Authorization: Bearer <token>
Response: { success, stats }

// ==============================================
// 13. HEALTH CHECK
// ==============================================

GET /health
Response: { success, message }

GET /
Response: Custom message about the API

// ==============================================
// ERROR RESPONSES (All endpoints can return)
// ==============================================

401 Unauthorized
{ success: false, message: "No token provided" }

403 Forbidden
{ success: false, message: "Invalid token or insufficient permissions" }

404 Not Found
{ success: false, message: "Resource not found" }

400 Bad Request
{ success: false, message: "Validation error" }

500 Internal Server Error
{ success: false, message: "Internal server error" }

// ==============================================
// TESTING WITH CURL
// ==============================================

// Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@test.com","password":"pass123"}'

// Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

// Get Profile (with token)
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// Create Cohort (with token)
curl -X POST http://localhost:5000/api/v1/cohorts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Cohort 1","description":"Test","startDate":"2025-10-18","endDate":"2025-12-18"}'