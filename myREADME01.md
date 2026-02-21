# Starfish-Tarot
A Progressive Web App for Myanmar Tarot Reading.


# 🔮 Starfish Tarot - PWA Project

A Progressive Web App for Myanmar Tarot Reading built with Next.js and Supabase.

---

## 🚀 Development Log & Decisions

### Session 1: Initial Setup & Workflow (2026-02-21)

#### **1. Project Goal:**
- To build a modern, PWA-enabled Tarot reading web application for Myanmar users.
- Key features include: Daily Draw, Private Readings (Booking), and Premium Subscriptions.

#### **2. Technology Stack & Architecture:**
- **Frontend:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Deployment:** Vercel

#### **3. Development Environment Decision:**
- **Problem:** The user cannot install development software (like VS Code) on their work machine.
- **Solution:** We will use **GitHub Codespaces** for a full, cloud-based development environment that runs in the browser. No local installation is needed.

#### **4. Workflow Decision (Supabase-First):**
- We will first create the database schema directly in Supabase using the SQL Editor.
- Then, we will connect the Next.js application to it using the Supabase URL and Anon Key.

#### **5. Technical Issue & Resolution:**
- **Issue:** `npx create-next-app` failed inside Codespaces due to the repository name (`Starfish-Tarot`) containing capital letters, which is against npm's naming rules.
- **Resolution:** The repository will be renamed to `starfish-tarot` (all lowercase). We will then create a new Codespace from the renamed repository to proceed with the Next.js installation.

---

### Next Steps:
1.  Rename the GitHub repository to `starfish-tarot`.
2.  Create a new GitHub Codespace.
3.  Run `npx create-next-app@latest .` inside the new Codespace terminal.


