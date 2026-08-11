# devicelog Launch Checklist

## Pre-launch (do before posting anywhere)

- [ ] DNS: `devicelog.dev` resolves, HTTPS works
- [ ] Signup flow works end-to-end (sign up → create team → dashboard)
- [ ] Demo works with zero friction (no signup)
- [ ] Landing page loads fast (< 2s), no broken images
- [ ] All links work (nav, footer, CTA buttons)
- [ ] Dark mode looks good on all pages
- [ ] Mobile responsive
- [ ] `og-image.svg` renders correctly (test https://www.opengraph.xyz)
- [ ] Submitted sitemap to Google Search Console
- [ ] Contact email `hello@devicelog.dev` working

## Product Hunt (highest traffic, do first)

**Timing:** Tuesday–Thursday, 12:01 AM PST (launches reset at midnight)

1. **Schedule the launch** 1 week in advance at https://www.producthunt.com/launches
2. **First comment** — write a genuine "maker story" (why you built it, who it's for, what problem)
3. **Tagline:** "Simple IT asset management — track laptops, certs, and licenses without spreadsheets"
4. **Images:** Use the dashboard preview screenshot, dark mode preferred
5. **Makers:** Add yourself as the maker
6. **Topics:** Developer Tools, Productivity, Open Source
7. **Don't ask for upvotes** — PH algorithm penalizes this. Share the page URL, let people discover

## Hacker News

**Format:** Show HN post

**Title:** "Show HN: devicelog — Free IT asset management without spreadsheets"

**Body template:**
> I built devicelog because every IT team I've worked with tracks their laptops and certs in a Google Sheet that nobody updates. Snipe-IT is great but requires self-hosting. Asset Panda is $50/mo minimum.
>
> What it does:
> - Track laptops, monitors, servers, phones with serials and warranties
> - SSL cert, software license, and support contract tracking with expiry alerts
> - QR code labels you can scan from your phone
> - CSV import from existing spreadsheets or Snipe-IT exports
> - Free tier: 50 assets, 2 team members. Team: $9/mo unlimited
>
> Tech: Next.js 16 static export, Supabase, Stripe
> License: BSL (source-visible, MIT after 4 years)
>
> Live demo (no signup): https://devicelog.dev/demo
> Happy to answer questions about the stack, the Supabase RLS setup, or anything else.

**Tips:**
- Post between 8–10 AM ET on a weekday
- Stay in the thread for the first 2 hours to reply to every comment
- Don't use a brand new HN account (needs some history)

## Reddit

**Subreddits:**
- r/sysadmin (largest IT audience, but strict self-promo rules — must be useful content)
- r/selfhosted (if framing as Snipe-IT alternative)
- r/SideProject (builder community)
- r/SaaS

**Format:** Don't post a landing page link as the main post. Post useful content and mention devicelog naturally.

**r/sysadmin example — post a guide:**
> Title: "How I stopped tracking IT assets in spreadsheets — a free alternative"
> Content: Walk through your CSV import flow with screenshots. End with: "I built this tool (devicelog.dev) because [reason]. Here's what it does. Free tier available."

**r/selfhosted example:**
> Title: "Open-source IT asset tracker alternative to Snipe-IT"
> Content: Comparison to Snipe-IT. Mention BSL license, point to GitHub repo.

## Directories (free, high-domain-authority backlinks)

Submit to:
- https://www.saashub.com — "IT Asset Management Software"
- https://alternativeto.net — tag: "snipe-it"
- https://www.producthunt.com/products/devicelog (after launch)
- https://www.indiehackers.com/products
- https://betalist.com
- https://saasworthy.com

## Content marketing (ongoing)

**Blog posts to write:**
1. "Snipe-IT vs Spreadsheets vs devicelog: Which IT Asset Manager is Right for Your Team?" (3,000+ words)
2. "How to Track SSL Certificates and Domains (Without Letting Them Expire)"
3. "IT Asset Management for Remote Teams: Complete Guide 2025"
4. "QR Code Asset Labels: How to Set Up Mobile Barcode Scanning"

**SEO keywords to target:**
- "free IT asset management software" (2,400/mo)
- "snipe it alternative" (1,600/mo)
- "IT asset tracking spreadsheet template" (1,000/mo)
- "QR code asset labels" (700/mo)
- "SSL certificate expiry tracker" (500/mo)

## First-week goals

- [ ] 10 signups
- [ ] 1 team with > 5 assets added
- [ ] 1 GitHub star (from someone you don't know)
- [ ] 1 piece of user feedback (via GitHub Issues)
