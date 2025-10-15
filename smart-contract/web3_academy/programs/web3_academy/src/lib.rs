use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
};
use mpl_token_metadata::{
    instruction::{create_master_edition_v3, create_metadata_accounts_v3},
    state::{Creator, DataV2},
};
use solana_program::program::invoke;

pub mod error;
pub mod instructions;
pub mod state;

pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("FdJCM2mmwrLXXu6ZDbsogBpBABUb7JxH8x91ZDXELqDc");

#[program]
pub mod web3_academy {
    use super::*;

    // ==================== COHORT MANAGEMENT ====================
    pub fn create_cohort(
        ctx: Context<CreateCohort>,
        name: String,
        description: String,
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        let cohort = &mut ctx.accounts.cohort;
        cohort.name = name;
        cohort.description = description;
        cohort.start_date = start_date;
        cohort.end_date = end_date;
        cohort.creator = ctx.accounts.authority.key();
        cohort.status = CohortStatus::Upcoming;

        msg!("Cohort created: {}", cohort.name);
        Ok(())
    }

    pub fn update_cohort_status(
        ctx: Context<UpdateCohortStatus>,
        new_status: CohortStatus,
    ) -> Result<()> {
        let cohort = &mut ctx.accounts.cohort;
        cohort.status = new_status;

        msg!("Cohort status updated to: {:?}", new_status);
        Ok(())
    }

    // ==================== COURSE MANAGEMENT ====================
    pub fn create_course(
        ctx: Context<CreateCourse>,
        title: String,
        description: String,
        media_url: String,
        cohort_key: Pubkey,
    ) -> Result<()> {
        let course = &mut ctx.accounts.course;
        course.title = title;
        course.description = description;
        course.instructor = ctx.accounts.authority.key();
        course.cohort = cohort_key;
        course.media_url = media_url;
        course.created_at = Clock::get()?.unix_timestamp;

        msg!("Course created: {}", course.title);
        Ok(())
    }

    // ==================== ENROLLMENT ====================
    pub fn enroll_student(
        ctx: Context<EnrollStudent>,
        cohort_key: Pubkey,
    ) -> Result<()> {
        let enrollment = &mut ctx.accounts.enrollment;
        enrollment.student = ctx.accounts.student.key();
        enrollment.cohort = cohort_key;
        enrollment.enrolled_at = Clock::get()?.unix_timestamp;

        msg!("Student enrolled: {}", enrollment.student);
        Ok(())
    }

    // ==================== ASSIGNMENT MANAGEMENT ====================
    pub fn create_assignment_template(
        ctx: Context<CreateAssignmentTemplate>,
        title: String,
        description: String,
        deadline: i64,
        course_key: Pubkey,
    ) -> Result<()> {
        let template = &mut ctx.accounts.template;
        template.course = course_key;
        template.title = title;
        template.description = description;
        template.created_by = ctx.accounts.authority.key();
        template.deadline = deadline;

        msg!("Assignment template created: {}", template.title);
        Ok(())
    }

    pub fn submit_assignment(
        ctx: Context<SubmitAssignment>,
        course_key: Pubkey,
        submission_link: String,
    ) -> Result<()> {
        let submission = &mut ctx.accounts.submission;
        submission.student = ctx.accounts.student.key();
        submission.course = course_key;
        submission.submission_link = submission_link;
        submission.submitted_at = Clock::get()?.unix_timestamp;
        submission.grade = None;

        msg!("Assignment submitted by: {}", submission.student);
        Ok(())
    }

    pub fn grade_assignment(
        ctx: Context<GradeAssignment>,
        grade: u8,
    ) -> Result<()> {
        require!(grade <= 100, CustomError::InvalidGrade);
        
        let submission = &mut ctx.accounts.submission;
        submission.grade = Some(grade);

        msg!("Assignment graded: {} points", grade);
        Ok(())
    }

    // ==================== ROLE MANAGEMENT ====================
    pub fn create_role(
        ctx: Context<CreateRole>,
        is_admin: bool,
        is_instructor: bool,
    ) -> Result<()> {
        let role = &mut ctx.accounts.role;
        role.authority = ctx.accounts.authority.key();
        role.is_admin = is_admin;
        role.is_instructor = is_instructor;

        msg!("Role created for: {}", role.authority);
        Ok(())
    }

    // ==================== NFT CERTIFICATE ====================
    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        course_key: Pubkey,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        msg!("Minting certificate NFT");

        // Mint 1 token to the token account
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        msg!("Token minted");

        // Create metadata account
        let creators = vec![Creator {
            address: ctx.accounts.payer.key(),
            verified: true,
            share: 100,
        }];

        let data_v2 = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: Some(creators),
            collection: None,
            uses: None,
        };

        let metadata_instruction = create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            data_v2.name,
            data_v2.symbol,
            data_v2.uri,
            data_v2.creators,
            data_v2.seller_fee_basis_points,
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
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("Metadata account created");

        // Create master edition account
        let master_edition_instruction = create_master_edition_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_edition_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.payer.key(),
            Some(0),
        );

        invoke(
            &master_edition_instruction,
            &[
                ctx.accounts.master_edition_account.to_account_info(),
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("Master edition created");
        msg!("Certificate NFT minted for course: {:?}", course_key);
        Ok(())
    }

    pub fn transfer_certificate(
        ctx: Context<TransferCertificate>,
        _amount: u64,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_context, 1)?;

        msg!("Certificate transferred to student");
        Ok(())
    }
}