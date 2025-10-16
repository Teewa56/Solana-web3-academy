use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, MintTo};

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
        _course_key: Pubkey,
        _uri: String,
        name: String,
        _symbol: String,
    ) -> Result<()> {
        msg!("Minting NFT certificate....");
        // Mint token
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        msg!("Certificate NFT minted successfully for: {}", name);
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
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, 1)?;

        msg!("Certificate transferred");
        Ok(())
    }
}