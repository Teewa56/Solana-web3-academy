pub mod instruction;
pub mod state;

use anchor_lang::prelude::*;
use instruction::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
};
use mpl_token_metadata::{
    pda::{find_master_edition_account, find_metadata_account},
    state::{DataV2, Creator},
    instruction::{create_metadata_accounts_v3, create_master_edition_v3},
};
use solana_program::program::invoke;

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

    pub fn submit_assignment(
        ctx: Context<SubmitAssignment>,
        course: Pubkey,
        submission_link: String,
    ) -> Result<()> {
        submit_assignment(ctx, course, submission_link)
    }

    pub fn grade_assignment(ctx: Context<GradeAssignment>, grade: u8) -> Result<()> {
        grade_assignment(ctx, grade)
    }

    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        course: Pubkey,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        mint_certificate(ctx, course, uri, name, symbol)
    }

}