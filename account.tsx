import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Save, UserRound, BellRing, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminQuery } from '@/lib/admin-query';
import { supabase } from '@/integrations/supabase/client';
import { appHead } from '@/lib/app-meta';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/account')({
  head: () => appHead('حسابي', 'الملف الشخصي وتفضيلات التنبيهات'),
  component: AccountPage,
});

function AccountPage() {
  const { data } = useSuspenseQuery(adminQuery);
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState(data.profile?.display_name ?? '');
  const [notifications, setNotifications] = useState(data.profile?.notifications_enabled ?? true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: u }) => setEmail(u.user?.email ?? ''));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: data.userId, display_name: name, notifications_enabled: notifications, updated_at: new Date().toISOString() });
      if (error) throw new Error('تعذر حفظ الملف الشخصي');
      await qc.invalidateQueries({ queryKey: ['admin'] });
      toast.success('تم حفظ حسابك');
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
          <p className="eyebrow">حسابك</p>
          <h1>الملف الشخصي</h1>
        </div>
        <Button variant="outline" onClick={() => void supabase.auth.signOut()}><LogOut />تسجيل الخروج</Button>
      </div>
      <form className="grid gap-5 my-8 max-w-xl" onSubmit={(e) => void submit(e)}>
        <div className="flex items-center gap-4">
          <span className="avatar-letter size-12 text-lg">{name.slice(0, 1) || 'م'}</span>
          <div>
            <strong>{name || 'مدير'}</strong>
            <p className="text-sm text-muted-foreground" dir="ltr">{email}</p>
          </div>
        </div>
        <label className="field"><span className="flex items-center gap-2"><UserRound className="size-4" />اسم العرض</span><Input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="flex gap-2 items-center">
          <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
          <span className="flex items-center gap-2"><BellRing className="size-4" />تنبيهات التنزيل داخل لوحة التحكم</span>
        </label>
        <div>
          <Button disabled={busy}><Save />{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>
        </div>
      </form>
    </>
  );
}
