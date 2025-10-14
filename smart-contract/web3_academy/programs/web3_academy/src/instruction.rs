use anchor_lang::prelude::*;
use crate::state::cohort::*;
use crate::state::course::*;

#[derive(Accounts)]
pub struct CreateCohort<'info> {
    #[account(init, payer = signer, space = 8 + 256)]
    pub cohort: Account<'info, CohortAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCourse<'info> {
    #[account(init, payer = signer, space = 8 + 512)]
    pub course: Account<'info, CourseAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_cohort(ctx: Context<CreateCohort>, name: String, description: String, start_date: i64, end_date: i64) -> Result<()> {
    let cohort = &mut ctx.accounts.cohort;
    cohort.name = name;
    cohort.description = description;
    cohort.start_date = start_date;
    cohort.end_date = end_date;
    cohort.creator = ctx.accounts.signer.key();
    cohort.status = CohortStatus::Upcoming;
    Ok(())
}

pub fn create_course(
    ctx: Context<CreateCourse>,
    title: String,
    description: String,
    media_url: String,
    cohort: Pubkey,
) -> Result<()> {
    let course = &mut ctx.accounts.course;
    course.title = title;
    course.description = description;
    course.instructor = ctx.accounts.signer.key();
    course.cohort = cohort;
    course.media_url = media_url;
    course.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}