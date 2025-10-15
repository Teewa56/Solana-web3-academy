use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Grade must be between 0 and 100")]
    InvalidGrade,
    
    #[msg("Unauthorized: Admin or Instructor access required")]
    Unauthorized,
    
    #[msg("Invalid role configuration")]
    InvalidRole,
    
    #[msg("Cohort has already started")]
    CohortAlreadyStarted,
    
    #[msg("Cohort has not started yet")]
    CohortNotStarted,
    
    #[msg("Assignment deadline has passed")]
    DeadlinePassed,
    
    #[msg("Assignment already submitted")]
    AlreadySubmitted,
    
    #[msg("Course not found in cohort")]
    CourseNotFound,
    
    #[msg("Student not enrolled in cohort")]
    NotEnrolled,
    
    #[msg("Invalid course completion status")]
    InvalidCompletionStatus,
    
    #[msg("Certificate already minted")]
    CertificateAlreadyMinted,
    
    #[msg("Insufficient grade for certificate")]
    InsufficientGrade,
    
    #[msg("Invalid date range")]
    InvalidDateRange,
    
    #[msg("Name too long")]
    NameTooLong,
    
    #[msg("Description too long")]
    DescriptionTooLong,
    
    #[msg("URL too long")]
    UrlTooLong,
}