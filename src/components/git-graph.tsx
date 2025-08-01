'use client';

import { AvatarImage } from '@radix-ui/react-avatar';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Avatar } from './ui/avatar';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';

interface CommitResponse {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: string;
            payload: string;
            verified_at: string;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    };
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    };
    parents: [
        {
            sha: string;
            url: string;
            html_url: string;
        },
    ];
}
interface ChartDataType {
    __date__: number;
    [committer: string]: number;
}

interface GitGraphProps {
    owner: string;
    repoName: string;
    startDate?: Date;
    endDate?: Date;
}
export const GitGraph = (props: GitGraphProps) => {
    const [chartData, setChartData] = useState<ChartDataType[]>([]);
    const [chartConfig, setChartConfig] = useState<ChartConfig>({});

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const data: CommitResponse[] = [];
                let page = 1;
                const perPage = 100;
                for (; ; page++) {
                    const GitCommitURI = `https://api.github.com/repos/${props.owner}/${props.repoName}/commits?per_page=${perPage}&page=${page}&since=${props.startDate?.toISOString() ?? '2020-01-01T00:00:00Z'}&until=${props.endDate?.toISOString() ?? new Date().toISOString()}`;
                    const response = await fetch(GitCommitURI);
                    if (!response.ok) {
                        throw new Error(`Error fetching commits: ${response.statusText}`);
                    }
                    const pageData = (await response.json()) as CommitResponse[];
                    data.push(...pageData);
                    if (pageData.length < perPage) {
                        break;
                    }
                }

                // get the timespan of the commits
                // get every user who has committed
                const committers: Record<string, { name: string; avatar: string; login: string }> = {};
                for (const commit of data) {
                    committers[commit.author.login] = {
                        name: commit.commit.author.name,
                        avatar: commit.author.avatar_url,
                        login: commit.author.login,
                    };
                }

                const commitsCountByDate: Record<number, Record<string, number>> = {};
                for (const commit of data) {
                    const date = new Date(commit.commit.author.date ?? '');
                    // this should be just the day, in epoch time
                    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                    const authorLogin: string = commit.author.login || 'Unknown';
                    if (!commitsCountByDate[day]) {
                        commitsCountByDate[day] = {};
                    }
                    commitsCountByDate[day][authorLogin] = (commitsCountByDate[day][authorLogin] || 0) + 1;
                }

                const chartDataArray: ChartDataType[] = [];
                for (const [date, commitCounts] of Object.entries(commitsCountByDate)) {
                    const dataPoint: ChartDataType = { __date__: Number(date) };
                    for (const committer of Object.values(committers)) {
                        dataPoint[committer.login] = commitCounts[committer.login] || 0;
                    }
                    chartDataArray.push(dataPoint);
                }
                chartDataArray.sort((a, b) => a.__date__ - b.__date__);
                setChartData(chartDataArray);

                const config: ChartConfig = {};
                for (const committer of Object.values(committers)) {
                    config[committer.login] = {
                        label: (
                            <div className="flex items-center gap-2 flex-nowrap">
                                <Avatar className="mr-2 h-5 w-5">
                                    <AvatarImage src={committer.avatar} />
                                </Avatar>
                                {committer.name}
                            </div>
                        ),
                        color: 'hsl(' + Math.floor(Math.random() * 360) + ', 70%, 50%)',
                    };
                }
                setChartConfig(config);
            } catch (error) {
                console.error('Failed to fetch commits:', error);
            }
        };
        void fetchCommits();
    }, [props.owner, props.repoName, props.startDate, props.endDate]);

    return (
        <ChartContainer config={chartConfig}>
            <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="__date__"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value: number) => new Date(value).toLocaleDateString()}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent title="Commits" />}
                    labelFormatter={(value, payload) => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        const date: number = payload[0]?.payload.__date__;
                        return 'Commits on ' + new Date(date).toLocaleDateString();
                    }}
                />
                {Object.entries(chartConfig).map(([key, value]) => {
                    return (
                        <Line
                            key={key}
                            dataKey={key}
                            type="monotone"
                            stroke={value.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    );
                })}
            </LineChart>
        </ChartContainer>
    );
};
