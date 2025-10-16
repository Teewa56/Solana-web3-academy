use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct EnrollmentAccount {
    pub student: Pubkey,
    pub cohort: Pubkey,
    pub enrolled_at: i64,
}