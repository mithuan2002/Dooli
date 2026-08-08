---
name: Managed Clerk auth
description: Durable authentication choice and transport rule for Dooli.
---

Dooli uses Replit-managed Clerk for account creation, sign-in, profile identity, and sign-out. Browser sessions use Clerk cookies; do not add local password storage, JWT handling, bearer headers, or a client token getter for the web app.

**Why:** The product needs normal micro-SaaS accounts while staying lightweight, and Replit provisions the Clerk development/production environments automatically.

**How to apply:** Keep the public landing page accessible while signed out, route authenticated users into the protected workspace, and scope browser-only MVP data by the Clerk user id.