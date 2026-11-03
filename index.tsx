import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldCheck, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { appHead } from '@/lib/app-meta';
import cloud from '@/assets/file-cloud.jpg';
import logo from '@/assets/download-4k-logo.png';

export const Route = createFileRoute('/')({
  head: () => appHead('تسجيل الدخول', 'Cyber Signal X — مشاركة الملفات الأصلية بروابط آمنة'),
  component: Index,
});

// Username sign-in: the username maps to the account's internal email.
const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@cybersignalx.app`;

function Index() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void nav({ to: '/dashboard' });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) setMessage('اسم المستخدم أو كلمة المرور غير صحيحة');
    else await nav({ to: '/dashboard' });
    setBusy(false);
  }

  return (
    <main className="login-page">
      <div className="login-top brand">
        <img src={logo} alt="تحميل ملفات 4K" className="size-14 object-contain"/>
        <span>Cyber Signal X<small>WASL / تحميل</small></span>
      </div>
      <div className="login-layout">
        <section className="login-form">
          <p className="eyebrow">مساحة الإدارة</p>
          <h1>أهلًا بعودتك.</h1>
          <p className="mt-3 mb-8 text-muted-foreground">ملفاتك الأصلية. روابطك. مساحة عمل واحدة.</p>
          <form onSubmit={submit} className="space-y-5">
            <label className="field">اسم المستخدم
              <Input autoComplete="username" dir="ltr" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ALZUBAIR" />
            </label>
            <label className="field">كلمة المرور
              <Input type="password" autoComplete="current-password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>
            {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
            <Button disabled={busy} size="lg" className="w-full">
              {busy ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}تسجيل الدخول
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-8 flex gap-2 items-center"><ShieldCheck className="size-4" />الوصول إلى الإدارة للحسابات المخولة فقط.</p>
        </section>
        <section className="login-art">
          <img src={cloud} alt="ملفات محفوظة في مساحة مشاركة سحابية" />
          <div className="login-art-caption"><h2>الأصل يبقى أصلًا.</h2><p>مشاركة موثوقة، دون التنازل عن الجودة.</p></div>
        </section>
      </div>
      <footer className="login-footer"><span>© Cyber Signal X</span><Link to="/privacy">الخصوصية</Link></footer>
    </main>
  );
}
