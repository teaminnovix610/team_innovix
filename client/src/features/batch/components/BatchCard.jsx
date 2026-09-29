import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Users } from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function BatchCard({ batch }) {
    const navigate = useNavigate();

    return (
        <Card
            onClick={() => navigate(`/batches/${batch._id}`)}
            className="p-4 sm:p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                        {batch.name}
                    </h2>

                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        Class {batch.classLevel}
                    </p>
                </div>

                <Badge
                    variant={batch.isActive ? "default" : "secondary"}
                    className="shrink-0"
                >
                    {batch.isActive ? "Active" : "Inactive"}
                </Badge>
            </div>

            <div className="mt-4 sm:mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Users size={18} />

                    <span>
                        {batch.students?.length || 0} Students
                    </span>
                </div>

                <span className="text-sm text-blue-600 font-medium">
                    View →
                </span>
            </div>
        </Card>
    );
}