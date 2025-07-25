import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '../../components/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Toaster expand={true} />
            <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
        </div>
    );
}
