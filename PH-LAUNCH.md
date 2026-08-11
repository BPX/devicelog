# Product Hunt Launch — devicelog

## Listing

**Name:** devicelog

**Tagline:** Track your IT assets without spreadsheets — free, open-source, 2-minute setup

**Description:**
devicelog is a simple IT asset manager built for teams that are tired of tracking laptops, monitors, SSL certs, and software licenses in a Google Sheet nobody updates.

- 📦 Track laptops, monitors, phones, servers — with serials, warranties, and QR code labels
- 🔒 SSL certificate, software license, and support contract tracking with expiry alerts
- 📥 CSV import from Excel, Google Sheets, or Snipe-IT — auto column matching
- 👥 Team sync — everyone sees the same real-time inventory
- 📱 QR labels — scan from your phone to see asset details instantly
- 🌙 Dark mode built in

**Free tier:** 50 assets, 2 team members. No credit card. No time limit.
**Team plan:** $9/month — unlimited assets, unlimited members.

Built with Next.js, Supabase, and Stripe. Source-visible under BSL (converts to MIT after 4 years).

🔗 Live demo (no signup): https://devicelog.dev/demo

**Topics:** Developer Tools, Productivity, Open Source

**Images:**
- Primary: Screenshot of the dashboard in dark mode showing the stat cards + recent assets table
- Gallery: Assets table with QR code modal, Certs page with expiry indicators, Employee roster

---

## Maker's First Comment (post immediately after launch)

Hey Product Hunt! 👋

I built devicelog because I've been the "spreadsheet IT guy" at three different companies and it always ends the same way — outdated data, missing serials, expired certs nobody noticed until the site went down, and Slack threads asking "who has the spare monitor?"

Snipe-IT is great but requires self-hosting. Asset Panda starts at $50/month. Spreadsheets are free but they're not a database.

So I built the thing I wanted: drop a CSV, get QR codes, track certs, scan from your phone. Free for small teams. No server to maintain.

**A few honest things:**

- This is a solo project. I wrote every line of code (with AI help on the boilerplate).
- The storage bucket upload currently has a 500KB limit — working on raising it.
- It's source-visible under BSL, meaning you can read the code, contribute, and self-host for non-production use. MIT after 4 years.

**What I'd love feedback on:**

- Is the free tier useful as-is or should I raise/lower the limits?
- What's the one thing that would make you switch from a spreadsheet?
- Any features you'd want before considering the Team plan?

I'll be in the comments all day. Ask me anything about the stack, the Supabase RLS setup, or whatever.

— BPX
