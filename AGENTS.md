<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All recipient downloads use the native original attachment endpoint without browser hashing or prebuffering, so clicks start transfers directly and large files do not occupy browser memory. Preserve independent server link-status checks.
- Browser downloads cannot promise a Photos/gallery destination; preserve original bytes and let the browser and OS select the save location.
- Recipient names are tab-scoped preferences, not authorization; every original endpoint must independently recheck link status.
- Build all copied and QR share links through `shareUrl` using the root `/$token` route; preserve full random tokens and legacy `/f/$token` pages to avoid weakening access or breaking sent links.
- Both share routes render the shared client-file page so original-download behavior and recipient preferences remain identical.
- Apply shared upload policy at preparation and finalization for new originals and replacements, so current limits cannot be bypassed by stale preparations.
- Filter event logs on the server before pagination, and link notifications to their specific event, so counts and navigation match the selected data.
- External deployments use Nitro's Vercel preset and Build Output API routing; Lovable retains its pinned runtime and neither host uses a static SPA fallback.
- Vercel builds require the server-credential preflight because public browser keys cannot replace privileged file-operation credentials.
- New and replacement uploads run original transfer, incremental hashing and header-only dimension reads concurrently to reduce serial waiting without changing bytes.
