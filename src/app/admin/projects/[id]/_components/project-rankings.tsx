import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card>
            <CardHeader>
                <CardTitle>Rankings</CardTitle>
            </CardHeader>
            <CardContent>
                <ol>
                    {sorted.map((ranking) => (
                        <li key={ranking.projectInstance.id}>
                            <span className="text-primary font-mono font-bold">{ranking.rank}</span> <span>{ranking.projectInstance.teamName}</span>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
}
