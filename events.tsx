import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Activity, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminQuery } from '@/lib/admin-query';
import { getEvents } from '@/lib/admin.functions';
import { EVENT_LABEL, formatDateTime, saveCsvName } from '@/lib/wasl';
import { appHead } from '@/lib/app-meta';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/events')({
  validateSearch: (s: Record<string, unknown>): { fileId?: string; eventId?: string } => ({ ...(typeof s['fileId'] === 'string' ? { fileId: s['fileId'] } : {}), ...(typeof s['eventId'] === 'string' ? { eventId: s['eventId'] } : {}) }),
  head: () => appHead('سجل الأحداث', 'سجل الزيارات والتنزيلات الفعلية من الخادم'),
  component: EventsPage,
});

type EventRow = Awaited<ReturnType<typeof getEvents>>['rows'][number];

function EventsPage() {
  const { fileId, eventId } = Route.useSearch();
  const { data: admin } = useSuspenseQuery(adminQuery);
  const fetchEvents = useServerFn(getEvents);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [fileId, eventId, search, type, date]);
  const { data, isPending, error } = useQuery({
    queryKey: ['events', fileId ?? 'all', eventId, page, search, type, date],
    queryFn: () => fetchEvents({ data: { page, ...(fileId ? { fileId } : {}), ...(eventId ? { eventId } : {}), ...(search ? { search } : {}), ...(type !== 'all' ? { type } : {}), ...(date ? { date } : {}) } }),
    refetchInterval: 15000,
  });
  const rows = data?.rows ?? [];
  const fileName = fileId ? admin.files.find((f) => f.id === fileId)?.display_name : null;

  function exportCsv() {
    const header = 'الملف,الجهاز المعلن,الحدث,التاريخ,نوع الجهاز,نظام التشغيل,المتصفح,الدولة,IP,تحقق البصمة';
    const lines = rows.map((e: EventRow) =>
      [e.file_name ?? '', e.device_label ?? '', EVENT_LABEL[e.event_type] ?? e.event_type, e.created_at, e.device_type ?? '', e.os ?? '', e.browser ?? '', e.country ?? '', e.ip ?? '', e.hash_verified == null ? '' : e.hash_verified ? 'مطابق' : 'غير مطابق']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const blob = new Blob(['﻿' + header + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = saveCsvName('events');
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    toast.success('تم تصدير السجل المعروض');
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">بيانات فعلية من الخادم</p>
          <h1>سجل الزيارات والتنزيلات</h1>
          {fileName && <p className="text-muted-foreground mt-3">مفلتر على الملف: {fileName}</p>}
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download />
          تصدير CSV
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 my-6">
        <Input aria-label="بحث في السجل" placeholder="ابحث باسم ملف أو جهاز…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <select className="select-control" value={type} onChange={(e) => setType(e.target.value)} aria-label="نوع الحدث">
          <option value="all">كل الأحداث</option>
          {Object.entries(EVENT_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Input type="date" aria-label="التاريخ" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
      </div>
      {error && <p role="alert" className="text-destructive mb-4">تعذر تحميل السجل، حاول مجددًا.</p>}
      <div className="overflow-x-auto border rounded-lg" aria-busy={isPending}>
        <table className="data-table">
          <thead>
            <tr><th>الملف</th><th>الحدث</th><th>التاريخ والوقت</th><th>الجهاز</th><th>النظام / المتصفح</th><th>الدولة / IP</th><th>البصمة</th></tr>
          </thead>
          <tbody>
            {rows.map((e: EventRow) => (
              <tr key={e.id}>
                <td><strong dir="auto">{e.file_name ?? '—'}</strong>{e.device_label && <small className="block text-muted-foreground mt-1">{e.device_label}</small>}</td>
                <td>{EVENT_LABEL[e.event_type] ?? e.event_type}{e.is_bot ? <small className="block text-muted-foreground">آلي محتمل</small> : null}</td>
                <td className="whitespace-nowrap">{formatDateTime(e.created_at)}</td>
                <td>{e.device_type ?? '—'}</td>
                <td>{e.os ?? '—'} / {e.browser ?? '—'}</td>
                <td>{e.country ?? '—'}<small className="block text-muted-foreground" dir="ltr">{e.ip ?? ''}</small></td>
                <td>{e.hash_verified == null ? '—' : e.hash_verified ? 'مطابقة' : 'غير مطابقة'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isPending && <p role="status" className="p-6 text-muted-foreground">جارٍ تحميل السجل…</p>}
        {!isPending && !error && rows.length === 0 && (
          <div className="empty-state"><Activity /><h3>لا أحداث مطابقة</h3><p>ستظهر هنا الزيارات والتنزيلات فور حدوثها.</p></div>
        )}
      </div>
      <div className="flex items-center justify-between mt-5">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronRight />السابق</Button>
        <span className="text-sm text-muted-foreground">صفحة {(page + 1).toLocaleString('ar')} · {(data?.count ?? 0).toLocaleString('ar')} حدثًا</span>
        <Button variant="outline" disabled={(page + 1) * 100 >= (data?.count ?? 0)} onClick={() => setPage(page + 1)}>التالي<ChevronLeft /></Button>
      </div>
    </>
  );
}
