use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::error::CustomError;
use crate::state::*;

// ==================== COHORT CONTEXTS ====================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCohort<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CohortAccount::INIT_SPACE,
        seeds = [b"cohort", name.as_bytes()],
        bump,
        constraint = cohort.key() == Pubkey::find_program_address(
            &[b"cohort", name.as_bytes()],
            &crate::ID
        ).0 @ CustomError::InvalidRole
    )]
    pub cohort: Account<'info, CohortAccount>,
    
    #[account(
        constraint = role.is_admin @ CustomError::Unauthorized
    )]
    pub role: Account<'info, RoleAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCohortStatus<'info> {
    #[account(
        mut,
        constraint = cohort.creator == authority.key() @ CustomError::Unauthorized
    )]
    pub cohort: Account<'info, CohortAccount>,
    
    #[account(
        constraint = role.is_admin @ CustomError::Unauthorized
    )]
    pub role: Account<'info, RoleAccount>,
    
    pub authority: Signer<'info>,
}

// ==================== COURSE CONTEXTS ====================

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateCourse<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CourseAccount::INIT_SPACE,
        seeds = [b"course", title.as_bytes()],
        bump
    )]
    pub course: Account<'info, CourseAccount>,
    
    #[account(
        constraint = role.is_admin || role.is_instructor @ CustomError::Unauthorized
    )]
    pub role: Account<'info, RoleAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ==================== ENROLLMENT CONTEXTS ====================

#[derive(Accounts)]
pub struct EnrollStudent<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + EnrollmentAccount::INIT_SPACE,
        seeds = [b"enrollment", student.key().as_ref()],
        bump
    )]
    pub enrollment: Account<'info, EnrollmentAccount>,
    
    #[account(mut)]
    pub student: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ==================== ASSIGNMENT CONTEXTS ====================

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateAssignmentTemplate<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AssignmentTemplateAccount::INIT_SPACE,
        seeds = [b"assignment", title.as_bytes()],
        bump
    )]
    pub template: Account<'info, AssignmentTemplateAccount>,
    
    #[account(
        constraint = role.is_admin || role.is_instructor @ CustomError::Unauthorized
    )]
    pub role: Account<'info, RoleAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitAssignment<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + AssignmentSubmissionAccount::INIT_SPACE,
        seeds = [
            b"submission",
            student.key().as_ref(),
            course.key().as_ref()
        ],
        bump,
        constraint = submission.key() == Pubkey::find_program_address(
            &[b"submission", student.key().as_ref(), course.key().as_ref()],
            &crate::ID
        ).0 @ CustomError::InvalidRole
    )]
    pub submission: Account<'info, AssignmentSubmissionAccount>,
    
    pub course: Account<'info, CourseAccount>,
    
    #[account(mut)]
    pub student: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GradeAssignment<'info> {
    #[account(mut)]
    pub submission: Account<'info, AssignmentSubmissionAccount>,
    
    #[account(
        constraint = role.is_admin || role.is_instructor @ CustomError::Unauthorized
    )]
    pub role: Account<'info, RoleAccount>,
    
    pub instructor: Signer<'info>,
}

// ==================== ROLE CONTEXTS ====================

#[derive(Accounts)]
pub struct CreateRole<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RoleAccount::INIT_SPACE,
        seeds = [b"role", authority.key().as_ref()],
        bump
    )]
    pub role: Account<'info, RoleAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ==================== NFT CERTIFICATE CONTEXTS ====================

#[derive(Accounts)]
pub struct MintCertificate<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + 165,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Validated by Metaplex program
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,
    
    /// CHECK: Validated by Metaplex program
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// CHECK: Metaplex Token Metadata Program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferCertificate<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}