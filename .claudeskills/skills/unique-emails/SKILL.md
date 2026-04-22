---
name: Unique Emails
description: Global rule to ensure email addresses are unique in database records for signups and registrations
---

# Unique Email Enforcement

As a global rule across this and all other projects, follow these strict guidelines when dealing with any features where a user submits an email address (e.g., newsletter signups, user registrations, waitlists):

1. **Database Constraints**: Always define the `email` column in your database tables as `UNIQUE`. This ensures data integrity at the lowest level.
   - *Example (SQL)*: `email TEXT NOT NULL UNIQUE`
2. **Graceful Error Handling**: When inserting an email into the database, explicitly catch the duplicate value error constraint.
   - In Supabase/PostgreSQL, a unique constraint violation returns error code `"23505"`.
3. **User Experience Security/UX**:
   - For **newsletters/waitlists**: If an email is already subscribed (violates the unique constraint), **do not** show an error to the user stating "you are already subscribed." Simply return a `success: true` response and show the standard success message. This prevents malicious actors from enumerating/guessing scraped emails to see if someone is on your list, and it provides a smooth UX for users who forgot they already signed up.
   - For **account registrations**: *Do* inform the user that an account with that email already exists to prevent confusion, and direct them to the login or password reset flow.

**When to use this skill**:
Apply this skill whenever you are creating, reviewing, or writing database insertion scripts and form handlers that collect user email addresses.
