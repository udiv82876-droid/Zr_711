import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {appHead} from '@/lib/app-meta';
export const Route=createFileRoute('/reset-password')({head:()=>appHead('تغيير كلمة المرور','إعادة تعيين كلمة مرور حسابك'),component:Reset});
function Reset(){const [password,setPassword]=useState('');const [error,setError]=useState('');const nav=useNavigate();return <main className="max-w-md mx-auto py-24 px-5"><h1 className="text-2xl mb-8">كلمة مرور جديدة</h1><form className="space-y-4" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password});if(error)setError(error.message);else await nav({to:'/dashboard'});}}><Input aria-label="كلمة مرور جديدة" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><p role="alert">{error}</p><Button>حفظ كلمة المرور</Button></form></main>;}