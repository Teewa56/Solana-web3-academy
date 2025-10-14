use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Grade must be between 0 and 100")]
    InvalidGrade,
}