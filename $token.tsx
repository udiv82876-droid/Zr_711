import { createFileRoute } from '@tanstack/react-router';
import { ClientFilePage } from '@/components/client-file-page';
import { appHead } from '@/lib/app-meta';

export const Route = createFileRoute('/f/$token')({
  head: () => appHead('تنزيل الملف الأصلي', 'Cyber Signal X — تنزيل الملف الأصلي دون ضغط أو تغيير الأبعاد'),
  ssr: false,
  component: LegacySharePage,
});
function LegacySharePage() {
  return <ClientFilePage token={Route.useParams().token}/>;
}
