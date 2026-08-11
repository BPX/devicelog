# Trackstack

Simple IT asset management for small teams. Track laptops, monitors, SSL certificates, and software licenses — no spreadsheets required.

**[trackstack.dev](https://trackstack.dev)** · [Live Demo](https://trackstack.dev/demo)

---

## Features

- 📦 **Asset tracking** — laptops, monitors, phones, servers, printers with serials, warranties, and QR codes
- 🔒 **Certificate & license tracking** — SSL certs, software licenses, support contracts with expiry alerts
- 👥 **Team sync** — shared inventory, assigned owners, full audit trail
- 📥 **CSV import/export** — drop your spreadsheet, we handle the rest
- 🌙 **Dark mode** — built-in

## Tech Stack

- **Frontend:** Next.js 16 (static export), React 19, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Payments:** Stripe
- **Analytics:** Vercel Analytics + Speed Insights

## License

This project is licensed under the **Business Source License 1.1** — you can view the source, contribute, and use it for non-production purposes. Production use (hosting it as a service) requires a commercial license. The license converts to MIT on **August 10, 2030**.

See [LICENSE](./LICENSE) for details.

## Getting Started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export
```
