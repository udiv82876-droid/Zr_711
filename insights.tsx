import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminQuery } from '@/lib/admin-query';
import { supabase } from '@/integrations/supabase/client';
import { appHead } from '@/lib/app-meta';

export const Route = createFileRoute('/_authenticated/insights')({
  head: () => appHead('المساعد الذكي', 'اسأل باللغة الطبيعية عن سجل أحداث ملفاتك'),
  component: InsightsPage,
});

const SUGGESTIONS = [
  'كم طلب تنزيل حصل ضمن الفترة المحددة؟',
  'أي الملفات حصلت على أكثر زيارات؟',
  'هل هناك نشاط آلي مشبوه في السجل؟',
  'ما أكثر الأجهزة والمتصفحات استخدامًا؟',
];

function InsightsPage() {
  const { data } = useSuspenseQuery(adminQuery);
  const [question, setQuestion] = useState('');
  const [fileId, setFileId] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    if (from && to && from > to) { setError('تاريخ البداية يجب أن يسبق تاريخ النهاية'); return; }
    setBusy(true);
    setAnswer('');
    setError('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('سجل الدخول أولًا');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ question: text, fileId: fileId || undefined, from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'تعذر التحليل');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('تعذر قراءة الرد');
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const part = JSON.parse(line) as { type: string; text?: string };
            if (part.type === 'text-delta' && part.text) setAnswer((a) => a + part.text);
            if (part.type === 'error') setError(part.text || 'تعذر إكمال التحليل');
          } catch {
            /* partial line */
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التحليل');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">تحليل بالذكاء الاصطناعي</p>
          <h1>اسأل عن سجل ملفاتك</h1>
          <p className="text-muted-foreground mt-3">إجابات مبنية على أحدث 1000 حدث فعلي ضمن المرشحات — للمديرين فقط.</p>
        </div>
      </div>
      <div className="grid gap-3 my-8 max-w-3xl">
        <div className="flex flex-wrap gap-3">
          <label className="field">من تاريخ<Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label className="field">إلى تاريخ<Input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        </div>
        <select className="select-control w-fit" value={fileId} onChange={(e) => setFileId(e.target.value)} aria-label="تقييد التحليل بملف">
          <option value="">كل الملفات</option>
          {data.files.map((f) => (
            <option key={f.id} value={f.id}>{f.display_name}</option>
          ))}
        </select>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(question);
          }}
        >
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="مثال: كم شخصًا حمّل ملف العرض أمس؟"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-label="سؤالك عن السجل"
          />
          <Button disabled={busy || !question.trim()}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
            اسأل
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Button key={s} variant="outline" size="sm" disabled={busy} onClick={() => { setQuestion(s); void ask(s); }}>
              <Sparkles />
              {s}
            </Button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
      {(answer || busy) && (
        <div className="max-w-3xl">
          <div className="analysis-output" dir="auto">{answer || '…'}</div>
        </div>
      )}
    </>
  );
}
