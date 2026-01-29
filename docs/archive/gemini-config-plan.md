Here’s a more concise Markdown playbook tailored specifically for Gemini CLI, using the author’s GEMINI.md as the strategic layer.

You can paste this into your own ⁠SYSTEM.md⁠ or into another agent’s config as instructions.# Goal

Configure **Gemini CLI** to:

1. Use **Prashanth Subrahmanyam’s `GEMINI.md`** as the high‑level strategic layer.

2. Introduce a separate `SYSTEM.md` as the **firmware** (core operational rules).

3. Activate the override via `GEMINI_SYSTEM_MD` so Gemini CLI uses our `SYSTEM.md` while still reading `GEMINI.md`.

You are the coding agent responsible for automating this setup.

---

## References (for you to consult)

- Gemini CLI repo (core prompt implementation):

  - https://github.com/google-gemini/gemini-cli

- Article (this workflow is based on):

  - “Practical Gemini CLI: Bring your own system instruction” – on Medium, Google Cloud – Community

- Author’s GEMINI instructions (use these as our `GEMINI.md` baseline):

  - GEMINI.md by Prashanth Subrahmanyam:

    - https://gist.github.com/prashanthsubrahmanyam  ← browse and locate the `GEMINI.md` referenced in the article  

      (it is linked from the “my GEMINI.md file” in the article)

Use these only as context; do not modify them directly in the remote source.

---

## Step 1 – Extract Gemini CLI’s Core System Prompt

1. In a Gemini CLI session against the **gemini-cli** repo, run a prompt that:

   - Reads `packages/core/src/core/prompts.ts`.

   - Extracts the full system prompt into `@code/tmp/SYSTEM.md`.

   Use this prompt (or equivalent):

   ```text

   There is a system prompt in the file @code/github/gemini-cli/packages/core/src/core/prompts.ts

   Extract this content into @code/tmp/SYSTEM.md

2. Save the extracted file into the project where we use Gemini CLI:

 ▫ Create a ⁠.gemini⁠ directory at the project root if it does not exist.

 ▫ Copy the extracted file to:

 ⁃ ⁠.gemini/system.raw.md⁠  (unaltered snapshot of the default system prompt)

3. Briefly summarize in a comment at the top of ⁠system.raw.md⁠ what the default prompt does (tools, safety, workflows).

Wait for my confirmation to proceed.

Step 2 – Create a Custom ⁠SYSTEM.md⁠ (Firmware Layer)

1. Create ⁠.gemini/system.md⁠ in the project root with this structure:# SYSTEM.md – Core Operational Firmware

## Purpose

- Fundamental, non-negotiable rules to ensure safe, stable and correct tool usage.

## Tool Usage Protocols

- Rules for filesystem operations, shell commands, and external tools.

- Requirements such as using absolute paths where appropriate.

- How to call Gemini CLI tools correctly.

## Safety & Security

- Always explain destructive actions before executing them.

- Require explicit user confirmation for operations that delete, overwrite, or rewrite many files.

- Never expose secrets or credentials.

## Workflow Mechanics

- Git workflow (branching, commit messages, PR process).

- Required steps before committing or pushing changes.

- How to structure code edits and refactors.

## Invariants

- Rules that must never be broken even if other instructions conflict.

2. Compare:

 ▫ ⁠.gemini/system.raw.md⁠ (default prompt)

 ▫ ⁠.gemini/system.md⁠ (your new firmware)Ensure you carry over any behavior from ⁠system.raw.md⁠ that is necessary for Gemini CLI to function (e.g., tool invocation conventions, mandatory checks). Do not copy persona or project‑specific content.

3. Annotate (in comments, e.g. ⁠<!-- ... -->⁠) which rules were preserved from the original and why.

Show me a short summary of what ⁠SYSTEM.md⁠ now guarantees, then wait for approval.

Step 3 – Use the Author’s ⁠GEMINI.md⁠ as Strategic Layer

1. Download Prashanth’s ⁠GEMINI.md⁠:

 ▫ Go to the author’s gist profile:

 ⁃ https://gist.github.com/prashanthsubrahmanyam

 ▫ Locate the ⁠GEMINI.md⁠ that is linked from the article’s “my GEMINI.md file” reference.

 ▫ Download or copy its contents.

2. Place this file as the project’s ⁠GEMINI.md⁠:

 ▫ Create or overwrite ⁠./GEMINI.md⁠ in the project root with the author’s content.

3. Review this ⁠GEMINI.md⁠ only to:

 ▫ Confirm it focuses on:

 ⁃ Persona / role definition.

 ⁃ Problem‑solving workflow (e.g., thinking loop).

 ⁃ High‑level tech stack guidelines.

 ⁃ Interaction behaviors (e.g., “ask for approval before major refactor”).

 ▫ If you see low‑level tool rules (filesystem, concrete shell patterns, git mechanics), consider moving those into ⁠SYSTEM.md⁠ instead and trimming them from ⁠GEMINI.md⁠ (with my approval).

Provide me a 3–5 bullet summary of the author’s ⁠GEMINI.md⁠ content and what role it plays.

Step 4 – Wire Up ⁠GEMINI_SYSTEM_MD⁠

1. Preferred project‑local configuration:

 ▫ Ensure ⁠.gemini/system.md⁠ exists and is finalized.

 ▫ Set the environment variable so Gemini CLI uses it:

# bash / zsh

export GEMINI_SYSTEM_MD=true

orset -x GEMINI_SYSTEM_MD true

or$env:GEMINI_SYSTEM_MD = "true"

With ⁠GEMINI_SYSTEM_MD=true⁠ or ⁠1⁠, Gemini CLI will read ⁠.gemini/system.md⁠ as its core system prompt for this project.

2. Verify the override:

 ▫ Run a small Gemini CLI request in this project, e.g.:gemini ask "Summarize your core operational rules."

 ▫ Confirm:

 ⁃ The CLI footer shows ⁠|⌐■_■|⁠, indicating a custom system prompt.

 ⁃ The answer reflects the rules defined in ⁠.gemini/system.md⁠.

Report back with the verification result.

Step 5 – Ongoing Maintenance

1. When upgrading Gemini CLI:

 ▫ Re‑extract the core prompt from the updated ⁠prompts.ts⁠ into ⁠.gemini/system.raw.md⁠ (overwrite it).

 ▫ Diff the new ⁠system.raw.md⁠ against:

 ⁃ The previous version (if you keep it).

 ⁃ ⁠.gemini/system.md⁠.

 ▫ Merge in any new essential operational rules into ⁠SYSTEM.md⁠.

2. Keep instructions clean:

 ▫ Periodically check ⁠SYSTEM.md⁠ and ⁠GEMINI.md⁠ for:

 ⁃ Redundant or conflicting rules.

 ⁃ Bloated text that can be simplified.

 ▫ Ensure:

 ⁃ ⁠SYSTEM.md⁠ = low‑level safety + tools + workflows.

 ⁃ ⁠GEMINI.md⁠ = persona + strategy + project context.

Safety / Confirmation Rules

- Before:

 ▫ Overwriting ⁠SYSTEM.md⁠ or ⁠GEMINI.md⁠,

 ▫ Deleting large instruction sections,

 ▫ Changing ⁠GEMINI_SYSTEM_MD⁠ values,

- You must:

 ▫ Show me the diff.

 ▫ Ask explicitly:“Type ‘Approved’ to apply this change, or ‘Cancel’ to abort.”

Only proceed after I reply Approved.

---

