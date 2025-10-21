import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          })

          const { accessToken } = response.data
          localStorage.setItem('accessToken', accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-email', data),

  resendOTP: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: () =>
    api.post('/auth/refresh-token'),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),

  updateProfile: (data: { fullName?: string; bio?: string; avatar?: string }) =>
    api.put('/users/update-profile', data),
}

// Student API
export const studentAPI = {
  getStudent: () =>
    api.get('/students'),

  updateStudent: (data: { solanaWallet?: string }) =>
    api.put('/students/update-student', data),

  enrollCohort: (data: { cohortId: string }) =>
    api.post('/students/enroll-cohort', data),

  getCourses: (studentId: string) =>
    api.get(`/students/${studentId}/courses`),

  getSubmissions: (studentId: string) =>
    api.get(`/students/${studentId}/submissions`),
}

// Course API
export const courseAPI = {
  getCourses: () =>
    api.get('/courses'),

  getCourse: (id: string) =>
    api.get(`/courses/${id}`),

  getCoursesByCohort: (cohortId: string) =>
    api.get(`/courses/cohort/${cohortId}`),

  createCourse: (data: any) =>
    api.post('/courses', data),

  updateCourse: (id: string, data: any) =>
    api.put(`/courses/${id}`, data),

  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`),
}

// Cohort API
export const cohortAPI = {
  getCohorts: () =>
    api.get('/cohorts'),

  getCohort: (id: string) =>
    api.get(`/cohorts/${id}`),

  getCohortStudents: (id: string) =>
    api.get(`/cohorts/${id}/students`),

  createCohort: (data: any) =>
    api.post('/cohorts', data),

  updateCohort: (id: string, data: any) =>
    api.put(`/cohorts/${id}`, data),
}

// Assignment API
export const assignmentAPI = {
  getAssignment: (id: string) =>
    api.get(`/assignments/${id}`),

  getAssignmentsByCourse: (courseId: string) =>
    api.get(`/assignments/course/${courseId}`),

  createAssignment: (data: any) =>
    api.post('/assignments', data),

  updateAssignment: (id: string, data: any) =>
    api.put(`/assignments/${id}`, data),
}

// Submission API
export const submissionAPI = {
  submitAssignment: (data: { assignmentId: string; content: string; fileUrl?: string }) =>
    api.post('/submissions/submit', data),

  getSubmissions: (assignmentId: string, params?: any) =>
    api.get(`/submissions/${assignmentId}`, { params }),

  getMySubmission: (assignmentId: string) =>
    api.get(`/submissions/${assignmentId}/my-submission`),

  gradeSubmission: (submissionId: string, data: { grade: number; feedback?: string }) =>
    api.put(`/submissions/${submissionId}/grade`, data),

  getSubmissionStats: (assignmentId: string) =>
    api.get(`/submissions/${assignmentId}/stats`),
}

// Gamification API
export const gamificationAPI = {
  getMyStats: () =>
    api.get('/gamification/my-stats'),

  getLeaderboard: (params?: { cohortId?: string; limit?: number }) =>
    api.get('/gamification/leaderboard', { params }),

  getBadges: () =>
    api.get('/gamification/badges'),

  getPointsBreakdown: () =>
    api.get('/gamification/points-breakdown'),

  awardPoints: (data: { studentId: string; points: number; reason: string }) =>
    api.post('/gamification/award-points', data),

  awardBadge: (data: { studentId: string; badgeName: string }) =>
    api.post('/gamification/award-badge', data),
}

// Certificate API
export const certificateAPI = {
  generateCertificate: (data: { courseId: string }) =>
    api.post('/certificates/generate', data),

  mintNFT: (data: { courseId: string; ipfsUrl: string; certificateData: any }) =>
    api.post('/certificates/mint-nft', data),

  getMyCertificates: () =>
    api.get('/certificates/my-certificates'),

  verifyCertificate: (nftMint: string) =>
    api.get(`/certificates/verify/${nftMint}`),

  issueCertificate: (data: { studentId: string; courseId: string; grade: number }) =>
    api.post('/certificates/issue', data),
}

// Enrollment API
export const enrollmentAPI = {
  enrollCohort: (data: { cohortId: string; walletAddress?: string }) =>
    api.post('/enrollments/enroll-cohort', data),

  enrollCourse: (data: { courseId: string }) =>
    api.post('/enrollments/enroll-course', data),

  unenrollCourse: (courseId: string) =>
    api.delete(`/enrollments/unenroll-course/${courseId}`),

  getMyCourses: () =>
    api.get('/enrollments/my-courses'),

  getAvailableCourses: () =>
    api.get('/enrollments/available-courses'),

  getEnrollmentStats: (params?: { cohortId?: string }) =>
    api.get('/enrollments/stats', { params }),
}

// Upload API
export const uploadAPI = {
  uploadFile: (formData: FormData) =>
    api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  uploadCourseMedia: (formData: FormData, courseTitle: string) =>
    api.post('/upload/course-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { courseTitle }
    }),

  uploadCertificateMetadata: (data: any) =>
    api.post('/upload/certificate-metadata', data),

  uploadAssignment: (formData: FormData, assignmentId: string) =>
    api.post('/upload/assignment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { assignmentId }
    }),

  getPinnedFiles: () =>
    api.get('/upload/pinned-files'),

  unpinFile: (ipfsHash: string) =>
    api.delete(`/upload/unpin/${ipfsHash}`),
}

// Admin API
export const adminAPI = {
  getUsers: () =>
    api.get('/admin/users'),

  promoteUser: (data: { userId: string }) =>
    api.post('/admin/users/promote', data),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),

  getStats: () =>
    api.get('/admin/stats'),
}

export default api
