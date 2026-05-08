# B2 — Implement TikTok / YouTube / LinkedIn publishing

## Goal

Wire actual publishers for the three platforms that currently appear in the platform selector but throw `Publishing to {platform} not yet supported` in `lib/publish.ts`.

## Why

Reels going to "facebook, instagram, tiktok, youtube" silently no-op for two of those platforms today. Either we implement them, or we remove them from the UI to stop misleading users. Default: implement.

## Prerequisites

- A1 done. A3 helpful (so analytics records exist for these platforms too) — but not strictly required.
- The user must complete OAuth app registration for each platform. **Confirm with the user which platforms are approved before starting.** If TikTok / YouTube / LinkedIn approval isn't done, this step is blocked.

## Files involved

- **Create migration**: `supabase/migrations/008_platform_oauth.sql` if `social_accounts` is missing platform-specific columns (most platforms fit existing schema; check `extra jsonb` if needed).
- **Create**: `src/app/api/auth/tiktok/init/route.ts`, `src/app/api/auth/tiktok/callback/route.ts` (and same for `youtube`, `linkedin`).
- **Modify**: `src/lib/publish.ts` — add `publishToTikTok`, `publishToYouTube`, `publishToLinkedIn`. Wire into the `for (const account of accounts)` loop.
- **Modify**: `src/app/dashboard/workspaces/[id]/platforms/page.tsx` — add Connect buttons for the new platforms.
- **Modify**: `src/lib/analytics-fetch.ts` (from A3) — add fetchers for the three platforms.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task B2**: Implement publishing for TikTok, YouTube, and LinkedIn — currently stubbed out in `src/lib/publish.ts`.
>
> **Step 0 — Capability check.** **Before writing any code, ask the user**:
>
> - Are the OAuth apps registered and approved for each of TikTok, YouTube, LinkedIn?
> - For TikTok: Content Posting API approval (separate from login) — yes/no.
> - For YouTube: which scope — `youtube.upload` vs `youtube.readonly` — and is the channel verified for daily upload limits >50?
> - For LinkedIn: Marketing API access (organization posting requires Marketing Developer Platform approval) — yes/no.
>
> If any of these are not approved, scope this step to only the approved platform(s), or pause until approval lands. **Do not write OAuth flows for platforms that can't actually publish.**
>
> **Step 1 — OAuth scaffolding (per approved platform).** For each approved platform, mirror the structure of `src/app/api/auth/gbp/init` + `callback`:
>
> - `init` route: redirects to the platform's OAuth authorize URL with the right scopes and a CSRF state token.
> - `callback` route: exchanges code for tokens, stores in `social_accounts` with `platform = 'tiktok' | 'youtube' | 'linkedin'`, including `account_id`, `account_name`, `access_token`, `refresh_token`, and any platform-specific extras in an `extra jsonb` column.
> - Add `social_accounts.extra jsonb` via migration 008 if it's not already there.
>
> Scopes (verify against current platform docs before using):
>
> - TikTok: `video.upload, user.info.basic`.
> - YouTube: `https://www.googleapis.com/auth/youtube.upload`.
> - LinkedIn: `w_member_social` (personal) or `w_organization_social` (page) — pick based on whether the workspace targets a personal profile or a Company Page.
>
> **Step 2 — Publishers in `lib/publish.ts`**:
>
> - `publishToTikTok(account, content, mediaUrls)`:
>   - TikTok requires a video. If `mediaUrls` has no video URL, throw `Error('TikTok requires a video')`.
>   - Use the [Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) flow: `POST open.tiktokapis.com/v2/post/publish/video/init/` with the video URL, then poll status. Caption goes in the request.
>   - Honor TikTok's caption length cap (150 chars). If `content` is longer, truncate at the last whole word + `…`.
> - `publishToYouTube(account, content, mediaUrls)`:
>   - YouTube needs a video file URL we can stream into a resumable upload. Use the [`videos.insert`](https://developers.google.com/youtube/v3/docs/videos/insert) endpoint with `uploadType=resumable`.
>   - Title = first line of content (max 100 chars). Description = rest. Tags from hashtags in the content. Privacy = `public`.
> - `publishToLinkedIn(account, content, mediaUrls)`:
>   - Use the v2 [`ugcPosts`](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api) API. Choose `IMAGE` / `VIDEO` / `ARTICLE` / `NONE` based on `mediaUrls`.
>   - Author URN = `urn:li:person:{account_id}` or `urn:li:organization:{account_id}` depending on the OAuth scope used.
>   - Visibility = `PUBLIC`.
>
> Each publisher returns `{ id }` like the existing FB/IG publishers — that id goes into `post_results.platform_post_id`.
>
> **Step 3 — Wire the dispatcher.** Update the loop in `publishPost()`:
>
> ```ts
> } else if (account.platform === 'tiktok') {
>     publishedRef = await publishToTikTok(account, postAny.content, postAny.media_urls)
> } else if (account.platform === 'youtube') { ... }
> else if (account.platform === 'linkedin') { ... }
> ```
>
> **Step 4 — Analytics fetchers.** Add to `src/lib/analytics-fetch.ts` (from A3):
>
> - `fetchTikTokMetrics(videoId, accessToken)` — TikTok's Display API for views/likes/comments/shares.
> - `fetchYouTubeMetrics(videoId, accessToken)` — YouTube Analytics API.
> - `fetchLinkedInMetrics(ugcPostId, accessToken)` — `socialActions/{urn}` endpoint.
>
> Map onto existing `post_results` columns. Where a metric doesn't translate (e.g. no `saved` on YouTube), leave null.
>
> **Step 5 — Platforms UI.** In `src/app/dashboard/workspaces/[id]/platforms/page.tsx`, add Connect / Disconnect buttons for the three new platforms. Match the FB/IG Connect button styling.
>
> **Constraints**:
>
> - All token refresh must follow the same pattern as `src/lib/gbp.ts` — wrap fetch calls in a helper that retries on 401 after a refresh.
> - Token expiry differs per platform (TikTok 24h access, 365d refresh; YouTube 1h access, refresh forever unless revoked; LinkedIn 60d access, no refresh — relogin required). Surface "Reconnect required" in the UI when refresh fails.
> - **Don't add `npm install googleapis`** — that's a 30MB+ package. Use direct `fetch` calls. If you think the SDK is genuinely better, surface that in your response with rationale and let the user decide.
> - If any platform proves too risky / undocumented, **scope it out and ask the user** rather than ship something fragile.

## Acceptance criteria

- [ ] OAuth flow works for each approved platform (Connect button → callback → row in `social_accounts`).
- [ ] Posting a test post via the existing approval flow targets the new platforms successfully.
- [ ] `post_results` rows created on success.
- [ ] Token refresh works on 401.
- [ ] Disconnected/expired tokens produce a clear "Reconnect required" UI state — not a silent failure.
- [ ] No 30MB+ SDK packages added without explicit user approval.
- [ ] Lint + typecheck clean.

## Out of scope

- LinkedIn analytics for organization pages requires a separate API approval — defer if not yet granted.
- TikTok carousel / image posts — defer; v1 is video only.
- YouTube Shorts-specific metadata (the `#Shorts` tag handles classification) — fine for v1.
- Cross-posting analytics aggregation across platforms in the dashboard — that's a UI follow-up.

## If we choose to *remove* instead of implement

If the user decides to skip B2 entirely:

- Strip TikTok/YouTube/LinkedIn from the `platforms` arrays in `everest-motoring/src/app/admin/inventory/socialAction.js` (`buildReelPost`, `buildVideoPost`).
- Remove them from the platform selector UI in compose / approvals / brand kit.
- Delete the unused OAuth init/callback routes if any exist as stubs.

This is the cheaper path. Recommend it if the user only really cares about FB/IG/GBP for the foreseeable future.
