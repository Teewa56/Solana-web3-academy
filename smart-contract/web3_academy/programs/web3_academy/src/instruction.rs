use anchor_lang::prelude::*;
use crate::state::cohort::*;
use crate::state::course::*;
use crate::state::submission::*;
use crate::state::assignment::*;
use crate::state::role::*;

#[account(has_one = authority)]
pub role: Account<'info, RoleAccount>

#[account(mut)]
pub metadata_account: AccountInfo<'info>

#[account(
    init,
    payer = payer,
    mint::decimals = 0,
    mint::authority = payer,
    mint::freeze_authority = payer
)]
pub mint: Account<'info, Mint>

#[account(
    init_if_needed,
    payer = payer,
    associated_token::mint = mint,
    associated_token::authority = payer
)]
pub token_account: Account<'info, TokenAccount>

#[account(mut)]
pub payer: Signer<'info>

pub system_program: Program<'info, System>
pub associated_token_program: Program<'info, AssociatedToken>
pub rent: Sysvar<'info, Rent>

#[account(address = mpl_token_metadata::ID)]
pub token_metadata_program: AccountInfo<'info>

// SPL Token Program
#[account(address = token::ID)]
pub token_program: Program<'info, Token>

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
}//manage cohort status

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
) -> Result<()>  {
    msg!("Initializing Mint Ticket");
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::mint_to(cpi_ctx, 1)?; // Minting 1 token

    msg!("Creating metadata account");
    let creators = vec![
        Creator {
            address: creator_key,
            verified: true,
            share: 100,
        },
    ];

    let metadata_instruction = create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.metadata_account.key(),
        ctx.accounts.mint.key(),
        ctx.accounts.payer.key(),
        ctx.accounts.payer.key(),
        ctx.accounts.payer.key(),
        title,
        "SMB".to_string(), // Symbol
        uri,
        Some(creators),
        500, // Seller fee basis points
        true,
        true,
        None,
        None,
        None,
    );

    invoke(
        &metadata_instruction,
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
        ],
    )?;

    msg!("Creating master edition account");
    let master_edition_instruction = create_master_edition_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.master_edition_account.key(),
        ctx.accounts.mint.key(),
        ctx.accounts.payer.key(),
        ctx.accounts.payer.key(),
        ctx.accounts.metadata_account.key(),
        ctx.accounts.payer.key(),
        Some(0), // Max supply 0 for non-fungible
    );

    invoke(
        &master_edition_instruction,
        &[
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
        ],
    )?;
    msg!("Minting NFT certificate for course {:?}", course);
    msg!("Metadata: {}, {}, {}", name, symbol, uri);
    Ok(())
}

pub fn issue_certificate(
    ctx: Context<TransferNft>, 
    _amount: u64
) -> Result<()>{
    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_context, 1)?; // Always 1 for NFTs
    Ok(())
} 

pub fn create_role() -> Role<()>{
    //create a role for a user
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