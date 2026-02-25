# Visibility & Sync Checklist

If you cannot see everything related to **Ember Automation** on this laptop, please follow these steps:

## 1. Sync the Files
- **OneDrive/Explorer**: Ensure your file explorer shows the latest files. Look for `HANDOVER.md` in the root folder.
- **Git**: If using Git, run `git pull` in the `Antigravity` root directory.

## 2. Access the AI Brain
Much of the business logic lives in the hidden `.agent/brain` folder. 
- Ask Antigravity: "What is in the Ember Automation handover?"
- Or open: [HANDOVER.md](file:///c:/Users/info/OneDrive/Documents/Antigravity/HANDOVER.md)

## 3. Stitch Projects (Crucial)
The UI designs are in **Stitch**. If you don't see "Everest Motoring" in your Stitch dashboard:
1. Go to [Stitch](https://stitch.google.com).
2. Ask the primary user (on the other laptop) to **Invite** your email to the project `Everest Motoring`.
3. Update your `mcp_config.json` with your own Stitch API key if necessary.

## 4. Environment Variables
Projects like `everest-motoring` require a `.env.local` file which is **not** synced via Git for security.
- Copy `.env.example` to `.env.local` in `everest-motoring/`.
- Ask the primary user for the specific API keys for Supabase/Stitch.

## 5. Verify Setup
Run these commands in the root:
```powershell
ls HANDOVER.md  # Should exist
cat README.md   # Should mention Ember Automation
```
