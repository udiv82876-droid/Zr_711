import { createFileRoute } from "@tanstack/react-router";
import { previewKind } from "@/lib/wasl";

// Inline preview, only for formats that cannot execute active content.
export const Route = createFileRoute("/api/public/p/$token")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { lookupByToken, recordEvent, streamOriginal } = await import("@/lib/files.server");
        const { file, state } = await lookupByToken(params.token);
        if (!file || state !== "active" || !file.allow_preview) {
          return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
        }
        const kind = previewKind(file.mime_type, file.extension);
        if (kind === "none") return new Response(null, { status: 415 });
        const range = request.headers.get("range");
        if (!range || /^bytes=0-/.test(range)) {
          const url = new URL(request.url);
          await recordEvent(request, { file, token: params.token, type: "preview_load", visitId: url.searchParams.get("v") });
        }
        const res = await streamOriginal(request, file, "inline");
        if (kind !== "pdf") res.headers.set("content-security-policy", "sandbox; default-src 'none'");
        res.headers.set("x-frame-options", "SAMEORIGIN");
        return res;
      },
    },
  },
});
