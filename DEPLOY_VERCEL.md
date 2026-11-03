# Cyber Signal X on Vercel

## Status and blocker

Source now targets Nitro's **Vercel Node preset**, not a static Vite site. Nitro generates `.vercel/output` with server functions, file endpoints, assets and routing. Do not rewrite all requests to `index.html` or set `dist` as Output Directory.

**The existing privileged Lovable Cloud operations are not portable with public keys alone.** Upload finalization, file resolution and original streaming require `SUPABASE_SERVICE_ROLE_KEY`, which Lovable Cloud does not expose for copying to Vercel. The preflight stops when server settings are missing rather than deploying broken recipient links.

For this architecture, completing external hosting requires an independently managed compatible backend with credentials you control. Migrate schema, role policies, private `files` storage and original objects, file paths, tokens, settings and account access. Preserve full tokens and original bytes. Exporting source does not transfer accounts or stored files. **This migration has not been performed.**

## Vercel setup

1. Import the GitHub repository; select **Other** when asked for a framework.
2. Select **Node.js 22.x**. `vercel.json` installs with Bun and runs `bun run build:vercel`.
3. Leave **Output Directory unset**; Nitro supplies Build Output API routing.
4. Set the following environment variables for Production and Preview using the independently managed backend. Never put private credentials in `VITE_` variables or commit them.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Browser backend address |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public browser credential |
| `VITE_SUPABASE_PROJECT_ID` | Identifier used by the generated client |
| `SUPABASE_URL` | Same backend address for server operations |
| `SUPABASE_PUBLISHABLE_KEY` | Public server credential for authenticated operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Private server credential for privileged file operations |

AI analysis also depends on `LOVABLE_API_KEY`; do not assume it is automatically provisioned on Vercel. External AI credentials/routing remain unverified.

## Short, clean links

Connect a short domain you own to Vercel, then enter its HTTPS origin in **الإعدادات → رابط الموقع العام**. Copies and QR codes use `https://your-domain/<full-token>` without `/f/` or tracking parameters. Legacy `/f/<token>` links remain supported. Never truncate access tokens.

A Vercel hostname removes `lovable` but is not necessarily short. Never configure an unconnected domain or private preview hostname as the public site address. Configure password-recovery redirects for the new origin at your independently managed authentication service; keep public signup disabled and preserve admin access.

## Performance and limits

- Uploads go directly from browser to private storage using resumable 6 MiB chunks, not through Vercel request bodies. New and replacement uploads calculate SHA-256 and read dimension headers alongside the transfer.
- Native attachment downloads do not hash or prebuffer in the browser and have no in-page counter. Each request independently rechecks current link status. Originals are streamed without transformation; Range requests remain supported.
- Downloads currently stream **through the application host**. Large transfers may outlast Vercel function duration limits and consume hosting bandwidth. A 5 GiB app limit does not guarantee successful 5 GiB Vercel downloads; test against the actual plan before launch. Do not bypass revocation with long-lived public storage URLs.
- Connection speed, storage region and device performance limit throughput. Browsers cannot guarantee saving into Photos/gallery.

## Launch checks

After migration and actual Vercel deployment: sign in, upload a real file, copy its root-token link, open signed out, confirm preview, save recipient name and download. Compare exact bytes, SHA-256 and dimensions offline. Test legacy links, suspended/expired links, Range downloads and a real-phone large transfer. **Vercel and physical-phone checks remain unverified here.**