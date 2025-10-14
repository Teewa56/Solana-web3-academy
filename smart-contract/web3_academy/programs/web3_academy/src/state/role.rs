use anchor_lang::prelude::*;

#[account]
pub struct RoleAccount {
    pub authority: Pubkey,
    pub is_admin: bool,
    pub is_instructor: bool,
}