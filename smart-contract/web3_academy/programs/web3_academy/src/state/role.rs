use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RoleAccount {
    pub authority: Pubkey,
    pub is_admin: bool,
    pub is_instructor: bool,
}