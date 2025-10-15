use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CourseAccount {
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub instructor: Pubkey,
    pub cohort: Pubkey,
    #[max_len(200)]
    pub media_url: String,
    pub created_at: i64,
}