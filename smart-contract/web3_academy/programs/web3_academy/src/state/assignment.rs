use anchor_lang::prelude::*;

#[account]
pub struct AssignmentTemplateAccount {
    pub course: Pubkey,
    pub title: String,
    pub description: String,
    pub created_by: Pubkey,
    pub deadline: i64,
}