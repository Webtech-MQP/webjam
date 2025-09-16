import AdminCreateEditProject from '@/app/admin/components/create-edit-project';

export default function Page() {
    return (
        <div className="w-2/3 mx-auto py-10">
            <h1>Create Project</h1>
            <AdminCreateEditProject projectId={undefined} />
        </div>
    );
}
