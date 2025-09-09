import { DashboardCard } from '@/components/dashboard-card';

interface Props {
    rankings: {
        projectInstance: {
            teamName: string;
            id: string;
        };
        rank: number;
    }[];
}

export function ProjectRankings({ rankings }: Props) {
    const sorted = rankings.sort((a, b) => a.rank - b.rank);

    return (
        <DashboardCard>
            <h1>Rankings</h1>
            <ol>
                {sorted.map((ranking) => (
                    <li key={ranking.projectInstance.id}>
                        <span className="text-primary font-mono font-bold">{ranking.rank}</span> <span>{ranking.projectInstance.teamName}</span>
                    </li>
                ))}
            </ol>
        </DashboardCard>
    );
}
