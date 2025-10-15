use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AssignmentTemplateAccount {
    pub course: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub created_by: Pubkey,
    pub deadline: i64,
}