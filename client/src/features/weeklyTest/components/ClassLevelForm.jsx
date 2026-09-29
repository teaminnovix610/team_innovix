import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClassLevelForm({ onSubmit }) {
    const navigate = useNavigate();
    const [classLevel, setClassLevel] = useState("");

    const handleSubmit = () => {
        if (!classLevel) return;
        onSubmit(classLevel);
    };

    return (
        <div className="space-y-3">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Which class are you in?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label>Class</Label>
                        <Input
                            type="number"
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value)}
                            placeholder="e.g. 8"
                        />
                    </div>
                    <Button className="w-full" disabled={!classLevel} onClick={handleSubmit}>
                        See Available Tests
                    </Button>
                </CardContent>
            </Card>

            <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => navigate("/weekly-test/find-my-results")}
            >
                Already took a test? Find your result
            </Button>
        </div>
    );
}