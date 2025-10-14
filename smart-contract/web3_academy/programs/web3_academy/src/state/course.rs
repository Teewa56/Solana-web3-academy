use anchor_lang::prelude::*;

#[account]
pub struct CourseAccount {
    pub title: String,
    pub description: String,
    pub instructor: Pubkey,
    pub cohort: Pubkey,
    pub media_url: String,
    pub created_at: i64,
}