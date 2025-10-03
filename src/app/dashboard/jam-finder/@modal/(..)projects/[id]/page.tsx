'use client';

import { ProjectModal } from '@/components/project-modal';
import { use } from 'react';

interface Props {
    params: Promise<{ id: string }>;
}

export default function Page(props: Props) {
    const { id } = use(props.params);

    return <ProjectModal id={id} />;
}
