import {createFileRoute,Link} from '@tanstack/react-router';
import {appHead} from '@/lib/app-meta';
import {FileTable} from '@/components/file-table';
import {Button} from '@/components/ui/button';
import {Upload} from 'lucide-react';
export const Route=createFileRoute('/_authenticated/files')({head:()=>appHead('الملفات والروابط','إدارة الملفات الأصلية وروابط المشاركة'),component:FilesPage});
function FilesPage(){return <><div className="page-heading"><div><p className="eyebrow">مساحة العمل</p><h1>الملفات والروابط</h1></div><Button asChild><Link to="/upload"><Upload/>رفع ملفات</Link></Button></div><div className="mt-8"><FileTable/></div></>;}