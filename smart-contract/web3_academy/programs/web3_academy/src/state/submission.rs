use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AssignmentSubmissionAccount {
    pub student: Pubkey,
    pub course: Pubkey,
    #[max_len(200)]
    pub submission_link: String,
    pub submitted_at: i64,
    pub grade: Option<u8>,
}