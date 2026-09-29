import { Card } from "@/components/ui/card";

export default function BatchInfoCard({ batch }) {
    return (
        <Card className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold">
                {batch.name}
            </h2>

            <p className="text-sm sm:text-base">
                Class {batch.classLevel}
            </p>

            <p className="mt-2 text-sm sm:text-base">
                Students: {batch.students?.length || 0}
            </p>
        </Card>
    );
}