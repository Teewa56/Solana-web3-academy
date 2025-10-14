use anchor_lang::prelude::*;

#[account]
pub struct CohortAccount {
    pub name: String,
    pub description: String,
    pub start_date: i64,
    pub end_date: i64,
    pub creator: Pubkey,
    pub status: CohortStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CohortStatus {
    Upcoming,
    Active,
    Completed,
}