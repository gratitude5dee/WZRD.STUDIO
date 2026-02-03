
# Finalize Project Setup Edge Function

This Edge Function orchestrates the creation of shots from scenes, generates visual prompts, and initiates image generation for a new project storyboard.

## How it works

1. Frontend invokes this function at the end of project setup.
2. Function retrieves project and scene data.
3. For each scene:
   - Generates multiple shot ideas using Claude
   - Determines appropriate shot types
   - Creates shot records in the database
   - Generates detailed visual prompts
   - Triggers image generation asynchronously

## Requirements

This function depends on the following environment variables:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (supplied by Supabase)
- `ANTHROPIC_API_KEY` for generating shot ideas and visual prompts
- `LUMA_API_KEY` for image generation (used by the generate-shot-image function)

## Dependencies

This function relies on:
- The `_shared/prompts.ts` module for Claude prompt templates
- The `_shared/claude.ts` module for API interactions
- The `_shared/auth.ts` module for user authentication
- The `generate-shot-image` function for actual image generation
