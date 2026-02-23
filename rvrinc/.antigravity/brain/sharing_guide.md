# Sharing your Antigravity Project — Step-by-Step Guide

To collaborate with a team member on a different Gmail account, follow these steps to ensure they have the code, the AI context (Brain), and the UI designs.

---

## 1. Share the Codebase (The "Lead" User)
Antigravity works on local files, so you must use a central repository to sync your code.

1.  **Initialize Git:** If you haven't already, open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "initial commit"
    ```
2.  **Create a Repository:** Go to [GitHub](https://github.com/new) and create a new **Private** repository.
3.  **Push Code:** Follow the instructions on GitHub to push your local code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```
4.  **Invite Team Member:** In your GitHub repository, go to **Settings > Collaborators** and invite your teammate's GitHub account.

---

## 2. Share the "AI Brain" (Context)
Antigravity's memory (like our `implementation_plan.md` and `task.md`) is stored in your personal app data folder. To share this memory so your teammate's AI "remembers" what we've done:

1.  **Move Artifacts to Project:** Create a folder named `.antigravity/brain` inside your project root.
2.  **Copy Files:** Copy all `.md` files from your local brain folder into this new project folder.
3.  **Commit & Push:**
    ```bash
    git add .antigravity/
    git commit -m "chore: sharing AI context/brain"
    git push
    ```
4.  **Teammate's Action:** When your teammate opens the project, they should tell their Antigravity: *"Review the history in .antigravity/brain to understand what has been done so far."*

---

## 3. Share the UI Designs (Stitch)
If you used Stitch for your UI, you need to grant permission to their Gmail account.

1.  **Open Stitch Dashboard:** Visit the Stitch web interface (usually reachable via your project links).
2.  **Invite Collaborator:** Go to the project settings for **rvr-legal-live** (ID: `prj_CS3NtPGx4OMtt67G37KysCxysoNi`) and add your teammate's Gmail address as a contributor.
3.  **Provide Project ID:** Send the Project ID (`prj_CS3NtPGx4OMtt67G37KysCxysoNi`) to your teammate.

---

## 🚀 Team Member: How to Get Started
1.  **Clone the Repo:** `git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
2.  **Open in Antigravity:** Open the cloned folder as a new workspace.
3.  **Sync Context:** Tell Antigravity: *"I am continuing work on this project. Read .antigravity/brain/task.md and walkthrough.md to get up to speed."*
4.  **Begin Work:** They can now see the same files, same history, and same UI designs.
