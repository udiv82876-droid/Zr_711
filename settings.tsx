import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminQuery } from '@/lib/admin-query';
import { saveSettings } from '@/lib/manage.functions';
import { appHead } from '@/lib/app-meta';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/settings')({
  head: () => appHead('الإعدادات', 'إعدادات الموقع والخصوصية والأمان والتخزين'),
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useSuspenseQuery(adminQuery);
  const save = useServerFn(saveSettings);
  const qc = useQueryClient();
  const s = data.settings;
  const [form, setForm] = useState({
    site_name: s?.site_name ?? 'WASL',
    logo_url: s?.logo_url ?? '',
    primary_hue: s?.primary_hue ?? 230,
    public_base_url: s?.public_base_url ?? '',
    collect_ip: s?.collect_ip ?? true,
    collect_geo: s?.collect_geo ?? true,
    log_retention_days: s?.log_retention_days ?? 180,
    max_file_mb: s?.max_file_mb ?? 5120,
    blocked_extensions: s?.blocked_extensions ?? '',
    privacy_text: s?.privacy_text ?? '',
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({
        data: {
          ...form,
          logo_url: form.logo_url || null,
          public_base_url: form.public_base_url || null,
          privacy_text: form.privacy_text || null,
          primary_hue: Number(form.primary_hue),
          log_retention_days: Number(form.log_retention_days),
          max_file_mb: Number(form.max_file_mb),
        },
      });
      await qc.invalidateQueries({ queryKey: ['admin'] });
      toast.success('تم حفظ الإعدادات');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر الحفظ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">التحكم الكامل</p>
          <h1>الإعدادات</h1>
        </div>
      </div>
      <form className="settings-grid my-8 max-w-4xl" onSubmit={(e) => void submit(e)}>
        <section className="grid gap-4 content-start">
          <h2 className="font-semibold flex items-center gap-2">الهوية والروابط</h2>
          <label className="field">اسم النظام<Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} /></label>
          <label className="field">رابط الشعار (URL)<Input dir="ltr" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></label>
          <label className="field">درجة اللون الأساسي (0–360)<Input type="number" min={0} max={360} value={form.primary_hue} onChange={(e) => setForm({ ...form, primary_hue: Number(e.target.value) })} /></label>
          <label className="field">النطاق الأساسي للروابط<Input dir="ltr" placeholder="https://yourdomain.com" value={form.public_base_url} onChange={(e) => setForm({ ...form, public_base_url: e.target.value })} /></label>
        </section>
        <section className="grid gap-4 content-start">
          <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />الخصوصية والأمان</h2>
          <label className="flex gap-2 items-center"><input type="checkbox" checked={form.collect_ip} onChange={(e) => setForm({ ...form, collect_ip: e.target.checked })} />جمع عنوان IP في سجل الأحداث</label>
          <label className="flex gap-2 items-center"><input type="checkbox" checked={form.collect_geo} onChange={(e) => setForm({ ...form, collect_geo: e.target.checked })} />جمع الموقع التقريبي (الدولة/المدينة)</label>
          <label className="field">مدة الاحتفاظ بالسجل (يوم)<Input type="number" min={1} max={3650} value={form.log_retention_days} onChange={(e) => setForm({ ...form, log_retention_days: Number(e.target.value) })} /></label>
          <label className="field">الحد الأقصى لحجم الملف (م.ب)<Input type="number" min={1} max={5120} value={form.max_file_mb} onChange={(e) => setForm({ ...form, max_file_mb: Number(e.target.value) })} /></label>
          <label className="field">امتدادات محظورة (مفصولة بفواصل)<Input dir="ltr" placeholder="exe, bat" value={form.blocked_extensions} onChange={(e) => setForm({ ...form, blocked_extensions: e.target.value })} /></label>
        </section>
        <label className="field col-span-full">نص سياسة الخصوصية
          <textarea className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.privacy_text} onChange={(e) => setForm({ ...form, privacy_text: e.target.value })} />
        </label>
        <div className="col-span-full">
          <Button size="lg" disabled={busy}><Save />{busy ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}</Button>
        </div>
      </form>
    </>
  );
}
