use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CohortAccount {
    #[max_len(50)]
    pub name: String,
    #[max_len(200)]
    pub description: String,
    pub start_date: i64,
    pub end_date: i64,
    pub creator: Pubkey,
    pub status: CohortStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum CohortStatus {
    Upcoming,
    Active,
    Completed,
}