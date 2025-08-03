import { LoaderCircle } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex items-center justify-center max-h-screen max-w-full animate-spin">
            <LoaderCircle />
        </div>
    );
}
