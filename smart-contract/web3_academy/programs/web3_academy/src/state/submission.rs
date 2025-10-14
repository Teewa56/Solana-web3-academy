use anchor_lang::prelude::*;

#[account]
pub struct AssignmentSubmissionAccount {
    pub student: Pubkey,
    pub course: Pubkey,
    pub submission_link: String,
    pub submitted_at: i64,
    pub grade: Option<u8>,
}