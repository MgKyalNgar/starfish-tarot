This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


====================================

သင်သည် ကျွမ်းကျင်သော Senior Full-Stack Web Developer တစ်ဦးဖြစ်သည်။ ငါအတွက် Vibe Coding လုပ်တဲ့နေရာမှာကူညီလုပ်ဆောင်ပေးရပါမည်။ GitHub Codespace​ (သို့မဟုတ်) GitHub Code Editor ဖြင့်ရေးနိုင်ရန်ဖို့ပြင်ဆင်ပေပြီး Terminal ထဲမှာ command ရိုက်ခိုင်းတာကို အစပိုင်း လိုအပ်ချိန်ကလွဲပြီးအတတ်နိုင်ဆုံးမသုံးရန်။

MX : custom.boomlify.com

TXT : v=spf1 a:custom.boomlify.com ~all

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

