import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateAssessment } from "../hooks/useCreateAssessment";

const SUBJECTS = [
  "Oceanography",
  "Meteorology",
  "Seismology",
  "Climate Science",
  "Hydrology",
  "Geology",
  "Atmospheric Science",
  "Environmental Science",
  "Remote Sensing",
  "Data Analysis",
  "Other",
];

const initialFormData = {
  title: "",
  type: "subject",
  subject: "",
  customSubject: "",
  deadline: "",
  duration: "",
  attemptsAllowed: 1,
  negativeMarkingEnabled: false,
  negativeMarksPerWrong: 0,
};

export default function CreateAssessmentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const { mutate: createAssessment, isPending: isCreating } =
    useCreateAssessment();

  const updateForm = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!formData.subject) errs.subject = "Subject is required";
    if (formData.subject === "Other" && !formData.customSubject.trim())
      errs.customSubject = "Please specify the subject";
    return errs;
  };

  const handleSubmit = () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const subject =
      formData.subject === "Other" ? formData.customSubject : formData.subject;

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      subject,
      audience: "ALL",
      attemptsAllowed: Number(formData.attemptsAllowed) || 1,
      negativeMarking: {
        enabled: formData.negativeMarkingEnabled,
        marksPerWrong: Number(formData.negativeMarksPerWrong) || 0,
      },
    };

    if (formData.duration) payload.duration = Number(formData.duration);
    if (formData.deadline) payload.deadline = new Date(formData.deadline).toISOString();

    createAssessment(payload, {
      onSuccess: (assessment) => {
        navigate(`/assessments/${assessment._id}/questions`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-lg font-medium">Create Assessment / Questionnaire</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="e.g. Ocean Sciences — Unit 1 Test"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Subject */}
          <div className="grid gap-1.5">
            <Label>Subject *</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => updateForm({ subject: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject}</p>
            )}
          </div>

          {/* Custom subject */}
          {formData.subject === "Other" && (
            <div className="grid gap-1.5">
              <Label>Specify Subject *</Label>
              <Input
                value={formData.customSubject}
                onChange={(e) => updateForm({ customSubject: e.target.value })}
                placeholder="Enter subject name"
              />
              {errors.customSubject && (
                <p className="text-xs text-destructive">{errors.customSubject}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div className="grid gap-1.5">
              <Label>Assessment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateForm({ type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["subject", "chapter", "unit", "mock", "practice", "monthly"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="grid gap-1.5">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => updateForm({ duration: e.target.value })}
                placeholder="e.g. 60"
                min={1}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="grid gap-1.5">
            <Label>Submission Deadline (optional)</Label>
            <Input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => updateForm({ deadline: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Trainees must submit before this date/time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Attempts */}
            <div className="grid gap-1.5">
              <Label>Attempts Allowed</Label>
              <Input
                type="number"
                value={formData.attemptsAllowed}
                onChange={(e) => updateForm({ attemptsAllowed: e.target.value })}
                min={1}
              />
            </div>

            {/* Negative marking */}
            <div className="grid gap-1.5">
              <Label>Negative Marking</Label>
              <label className="flex h-10 items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.negativeMarkingEnabled}
                  onCheckedChange={(checked) =>
                    updateForm({ negativeMarkingEnabled: checked })
                  }
                />
                Enable negative marking
              </label>
            </div>
          </div>

          {formData.negativeMarkingEnabled && (
            <div className="grid gap-1.5">
              <Label>Marks Deducted Per Wrong Answer</Label>
              <Input
                type="number"
                step="0.25"
                value={formData.negativeMarksPerWrong}
                onChange={(e) =>
                  updateForm({ negativeMarksPerWrong: e.target.value })
                }
              />
            </div>
          )}

          <Button
            className="w-full"
            disabled={isCreating}
            onClick={handleSubmit}
          >
            {isCreating ? "Creating..." : "Next: Add Questions →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}