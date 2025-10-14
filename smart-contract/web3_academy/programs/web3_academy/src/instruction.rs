use anchor_lang::prelude::*;
use crate::state::cohort::*;
use crate::state::course::*;
use crate::state::submission::*;
use crate::state::assignment::*;
use crate::state::role::*;

#[account(has_one = authority)]
pub role: Account<'info, RoleAccount>,

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

#[derive(Accounts)]
pub struct SubmitAssignment<'info> {
    #[account(init, payer = student, space = 8 + 256)]
    pub submission: Account<'info, AssignmentSubmissionAccount>,
    #[account(mut)]
    pub student: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GradeAssignment<'info> {
    #[account(mut)]
    pub submission: Account<'info, AssignmentSubmissionAccount>,
    pub instructor: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintCertificate<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    // Add metadata and mint accounts here later
}

pub fn create_cohort(ctx: Context<CreateCohort>, name: String, description: String, start_date: i64, end_date: i64) -> Result<()> {
    require!(role.is_admin, CustomError::Unauthorized);
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
    require!(role.is_admin, CustomError::Unauthorized);
    let course = &mut ctx.accounts.course;
    course.title = title;
    course.description = description;
    course.instructor = ctx.accounts.signer.key();
    course.cohort = cohort;
    course.media_url = media_url;
    course.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}

pub fn submit_assignment(
    ctx: Context<SubmitAssignment>,
    course: Pubkey,
    submission_link: String,
) -> Result<()> {
    let submission = &mut ctx.accounts.submission;
    submission.student = ctx.accounts.student.key();
    submission.course = course;
    submission.submission_link = submission_link;
    submission.submitted_at = Clock::get()?.unix_timestamp;
    submission.grade = None;
    Ok(())
}

pub fn grade_assignment(
    ctx: Context<GradeAssignment>,
    grade: u8,
) -> Result<()> {
    require!(role.is_admin, CustomError::Unauthorized);
    require!(grade <= 100, CustomError::InvalidGrade);
    ctx.accounts.submission.grade = Some(grade);
    Ok(())
}

pub fn mint_certificate(
    ctx: Context<MintCertificate>,
    course: Pubkey,
    uri: String,
    name: String,
    symbol: String,
) -> Result<()> {
    // Placeholder: integrate with Metaplex Token Metadata
    msg!("Minting NFT certificate for course {:?}", course);
    msg!("Metadata: {}, {}, {}", name, symbol, uri);
    Ok(())
}

pub fun create_role() -> Role<()>{

}

pub fn create_assignment_template(
    ctx: Context<CreateAssignmentTemplate>,
    title: String,
    description: String,
    deadline: i64,
    course: Pubkey,
) -> Result<()> {
    let template = &mut ctx.accounts.template;
    template.course = course;
    template.title = title;
    template.description = description;
    template.created_by = ctx.accounts.instructor.key();
    template.deadline = deadline;
    Ok(())
}

pub fn enroll_student(
    ctx: Context<EnrollStudent>,
    cohort: Pubkey,
) -> Result<()> {
    let enrollment = &mut ctx.accounts.enrollment;
    enrollment.student = ctx.accounts.student.key();
    enrollment.cohort = cohort;
    enrollment.enrolled_at = Clock::get()?.unix_timestamp;
    Ok(())
}