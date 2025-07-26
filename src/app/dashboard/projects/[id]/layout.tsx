import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>   
            <Toaster />
            {children}
        </div>
    );
}
