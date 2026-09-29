import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LockedFeatureCard({ title, description }) {
    const navigate = useNavigate();

    return (
        <Card className="border-2 border-slate-400">
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <LockIcon className="size-6 text-slate-500" />
                <div>
                    <p className="text-sm font-medium text-slate-800">{title}</p>
                    {description && (
                        <p className="mt-1 text-xs text-slate-600">{description}</p>
                    )}
                </div>
                <Button size="sm" onClick={() => navigate("/register")}>
                    Register to Unlock
                </Button>
            </CardContent>
        </Card>
    );
}