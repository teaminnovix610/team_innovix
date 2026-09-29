import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useStartAttempt } from "../../attempt/hooks/useStartAttempt";
import { guestDetailsSchema } from "../validation/guestDetails.schema";

export default function GuestDetailsForm({ assessmentId, classLevel }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", phone: "", classLevel });
    const [errors, setErrors] = useState({});

    const { mutate: start, isPending } = useStartAttempt(assessmentId, "guest", formData);

    const updateForm = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

    const handleSubmit = () => {
        const result = guestDetailsSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        start(undefined, {
            onSuccess: (data) => {
                navigate(`/weekly-test/${assessmentId}/attempt/${data.attempt._id}`);
            },
        });
    };

    return (
        <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-md p-6 sm:p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <UserPlus size={30} className="text-blue-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-5">
                Enter Your Details
            </h2>

            <div className="space-y-4">
                <div className="grid gap-1.5">
                    <Label>Name</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                        placeholder="Your full name"
                        className="border-2 border-slate-400 focus-visible:border-blue-500"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="grid gap-1.5">
                    <Label>Phone Number</Label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => updateForm({ phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="border-2 border-slate-400 focus-visible:border-blue-500"
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="grid gap-1.5">
                    <Label>Class</Label>
                    <Input value={formData.classLevel} disabled className="border-2 border-slate-400" />
                </div>

                <Button
                    className="w-full rounded-full py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                    disabled={isPending}
                    onClick={handleSubmit}
                >
                    {isPending ? "Starting..." : "Begin Test"}
                </Button>
            </div>
        </div>
    );
}