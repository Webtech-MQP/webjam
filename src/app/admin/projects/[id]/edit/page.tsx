import AdminCreateEditProject, { type InitialValuesType } from '@/app/admin/components/create-edit-project';
import { api } from '@/trpc/server';

function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

interface Params {
    id: string;
}

interface Props {
    params: Promise<Params>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;
    const initialValues = await api.projects.adminGetOne({ id });
    const transformedInitialValues: InitialValuesType = {
        title: initialValues?.title || '',
        subtitle: initialValues?.subtitle || '',
        description: initialValues?.description || '',
        instructions: initialValues?.instructions || '',
        requirements: initialValues?.requirements.split('\n') || [],
        startDateTime: initialValues?.startDateTime ? formatDateForInput(initialValues.startDateTime) : '',
        endDateTime: initialValues?.endDateTime ? formatDateForInput(initialValues.endDateTime) : '',
        imageUrl: initialValues?.imageUrl || '',
        tags: initialValues?.projectsToTags?.map((pt) => pt.tag.name) || [],
        judgingCriteria:
            initialValues?.judgingCriteria?.map((c) => ({
                criterion: c.criterion,
                weight: c.weight,
            })) || [],
        events: initialValues?.events || [],
    };
    return (
        <div className="w-2/3 mx-auto py-10">
            <h1>Edit Project</h1>
            <AdminCreateEditProject
                initialData={transformedInitialValues}
                projectId={id}
            />
        </div>
    );
}
