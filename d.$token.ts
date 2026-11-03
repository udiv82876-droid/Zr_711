import { createFileRoute } from "@tanstack/react-router";

// Download endpoint: status is re-checked against the database on every request.
export const Route = createFileRoute("/api/public/d/$token")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { lookupByToken, recordEvent, streamOriginal, supabaseAdmin } = await import("@/lib/files.server");
        const { file, state } = await lookupByToken(params.token);
        if (!file || state !== "active") {
          return new Response(null, { status: state === "not_found" ? 404 : 410, headers: { "cache-control": "no-store" } });
        }
        const range = request.headers.get("range");
        if (!range || /^bytes=0-/.test(range)) {
          const url = new URL(request.url);
          await recordEvent(request, {
            file,
            token: params.token,
            type: "download_start",
            visitId: url.searchParams.get("v"),
            deviceLabel: url.searchParams.get("l"),
          });
        }
        const visitId = new URL(request.url).searchParams.get("v");
        let receiptId: string | undefined;
        if (!range && visitId) {
          const { data, error } = await supabaseAdmin.from("download_receipts").insert({ file_id: file.id, visit_id: visitId.slice(0, 64), sha256: file.sha256 }).select("id").single();
          if (error) return new Response(null, { status: 503 });
          receiptId = data?.id;
        }
        return streamOriginal(request, file, "attachment", receiptId);
      },
    },
  },
});
