import AdminCreateEditProject from '@/app/admin/components/create-edit-project';
import { use } from 'react';

interface Params {
    id: string;
}

interface Props {
    params: Promise<Params>;
}

export default function Page({ params }: Props) {
    const { id } = use(params);
    return (
        <div className="w-2/3 mx-auto py-10">
            <h1>Edit Project</h1>
            <AdminCreateEditProject projectId={id} />
        </div>
    );
}
