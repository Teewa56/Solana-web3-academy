use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct TransferNft<'info> {
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    
    // The source token account
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    // The destination token account
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    // The owner of the 'from' account
    pub authority: Signer<'info>
}