pub mod instruction;
pub mod state;

use anchor_lang::prelude::*;
use instruction::*;

declare_id!("FdJCM2mmwrLXXu6ZDbsogBpBABUb7JxH8x91ZDXELqDc");

#[program]
pub mod web3_academy_contract {
    use super::*;

    pub fn create_cohort(
        ctx: Context<CreateCohort>,
        name: String,
        description: String,
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        create_cohort(ctx, name, description, start_date, end_date)
    }

    pub fn create_course(
        ctx: Context<CreateCourse>,
        title: String,
        description: String,
        media_url: String,
        cohort: Pubkey,
    ) -> Result<()> {
        create_course(ctx, title, description, media_url, cohort)
    }
}
