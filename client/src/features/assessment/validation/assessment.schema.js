import { z } from "zod";

const emptyToUndefined = (val) => (val === "" ? undefined : val);

const addMinutesToTime = (time, minutes) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + Number(minutes);
    const wrapped = ((total % 1440) + 1440) % 1440;
    const newH = Math.floor(wrapped / 60);
    const newM = wrapped % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
};

export const createAssessmentSchema = z
    .object({
        title: z.string().trim().min(1, "Title is required").max(150),

        type: z.enum([
            "weekly", "chapter", "unit", "monthly", "mock", "practice", "homework", "scholarship",
        ]),

        audience: z.enum(["BATCH", "PUBLIC"], { message: "Please select an audience" }),

        subject: z.string().trim().min(1, "Subject is required"),

        classLevel: z.preprocess(emptyToUndefined, z.string().trim().optional()),
        batchId: z.preprocess(emptyToUndefined, z.string().optional()),
        publicClassLevel: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),

        duration: z.coerce.number().int().positive("Duration must be positive"),
        startDate: z.string().min(1, "Start date is required"),
        startTime: z.string().min(1, "Start time is required"),

        attemptsAllowed: z.coerce.number().int().positive().default(1),

        negativeMarkingEnabled: z.boolean().default(false),
        negativeMarksPerWrong: z.coerce.number().nonnegative().default(0),
    })
    .superRefine((data, ctx) => {
        if (data.audience === "BATCH") {
            if (!data.batchId) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Batch is required", path: ["batchId"] });
            }
            if (!data.classLevel) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a batch to set the class", path: ["classLevel"] });
            }
        }

        if (data.audience === "PUBLIC") {
            if (!data.publicClassLevel) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Class is required", path: ["publicClassLevel"] });
            }
        }
    });

export const toAssessmentPayload = (formData) => ({
    title: formData.title,
    type: formData.type,
    audience: formData.audience,
    subject: formData.subject,
    ...(formData.audience === "BATCH"
        ? { batchId: formData.batchId, classLevel: formData.classLevel }
        : { classRange: { min: formData.publicClassLevel, max: formData.publicClassLevel } }),
    duration: formData.duration,
    startDate: formData.startDate,
    startTime: formData.startTime,
    endTime: addMinutesToTime(formData.startTime, formData.duration),
    attemptsAllowed: formData.attemptsAllowed,
    negativeMarking: {
        enabled: formData.negativeMarkingEnabled,
        marksPerWrong: formData.negativeMarksPerWrong,
    },
});