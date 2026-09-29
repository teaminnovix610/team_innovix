import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function LeaderboardTable({ entries }) {
    if (!entries || entries.length === 0) {
        return <p className="text-sm text-muted-foreground">No results yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry) => (
                    <TableRow key={entry.rank}>
                        <TableCell className="font-medium">{entry.rank}</TableCell>
                        <TableCell>{entry.student?.name ?? "Anonymous"}</TableCell>
                        <TableCell className="text-right">{entry.score}</TableCell>
                        <TableCell className="text-right">{entry.percentage}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}