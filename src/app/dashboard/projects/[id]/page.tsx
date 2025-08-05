import { ProjectDetail } from '@/components/project-detail';

interface Params {
    id: string;
}

interface Props {
    params: Promise<Params>;
}

export default async function Page(props: Props) {
    const { id } = await props.params;

    return (
        <div className="h-full">
            <ProjectDetail id={id} />
        </div>
    );
}
