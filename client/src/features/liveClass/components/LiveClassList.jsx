import LiveClassCard from "./LiveClassCard";

export default function LiveClassList({ classes }) {

    if (!classes || classes.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No live classes scheduled yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {classes.map((liveClass) => (
                <LiveClassCard
                    key={liveClass._id}
                    liveClass={liveClass}
                />
            ))}
        </div>
    );
}