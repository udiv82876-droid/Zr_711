import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminShell } from '@/components/admin-shell';
import { adminQuery } from '@/lib/admin-query';
export const Route=createFileRoute('/_authenticated')({ssr:false,beforeLoad:async()=>{const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw redirect({to:'/'});},loader:({context})=>context.queryClient.ensureQueryData(adminQuery),component:AdminShell});