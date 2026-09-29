import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Check } from "lucide-react";

import { liveClassSchema } from "../validation/liveClass.schema";
import useCreateLiveClass from "../hooks/useCreateLiveClass";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ---------------- Scrollable time list ---------------- */

// 15-min increments, 12-hour format, e.g. "9:00 AM", "9:15 AM" ...
// 15-min increments, starting 9:00 AM through 11:45 PM (midnight-9AM excluded)
// 5-min increments, starting 9:00 AM through 11:55 PM (midnight-9AM excluded)
// 5-min increments, from 6:00 AM through 12:00 AM (midnight)
const START_HOUR = 6;
const END_HOUR = 24; // 24 = midnight, exclusive upper bound
const SLOTS_PER_HOUR = 12; // 60 / 5

const TIME_OPTIONS = Array.from(
    { length: (END_HOUR - START_HOUR) * SLOTS_PER_HOUR },
    (_, i) => {
        const totalMinutes = START_HOUR * 60 + i * 5;
        let hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        return {
            value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
            label: `${hour12}:${String(minutes).padStart(2, "0")} ${period}`,
        };
    }
);
function TimeList({ value, onSelect }) {
    const listRef = useRef(null);
    const selectedRef = useRef(null);

    // scroll to the selected item when the popover opens
    useEffect(() => {
        selectedRef.current?.scrollIntoView({
            block: "center",
            behavior: "auto",
        });
    }, []);

    return (
        <div
            ref={listRef}
            className="h-64 w-40 overflow-y-auto rounded-md border"
        >
            {TIME_OPTIONS.map((opt) => {
                const isSelected = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        ref={isSelected ? selectedRef : null}
                        onClick={() => onSelect(opt)} // selects + parent closes popover
                        className={cn(
                            "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                            isSelected
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        )}
                    >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                    </button>
                );
            })}
        </div>
    );
}

/* ---------------- Main form ---------------- */

export default function LiveClassForm({ batchId, closeDialog }) {
    const mutation = useCreateLiveClass();

    const [date, setDate] = useState(undefined);
    const [dateOpen, setDateOpen] = useState(false);

    const [timeOpen, setTimeOpen] = useState(false);
    const [time, setTime] = useState(null); // { value: "09:00", label: "9:00 AM" }

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(liveClassSchema),
        defaultValues: {
            duration: 60,
        },
    });

    const syncScheduledAt = (d, t) => {
        if (!d || !t) return;
        const [hours, minutes] = t.value.split(":").map(Number);
        const combined = new Date(d);
        combined.setHours(hours, minutes, 0, 0);
        setValue("scheduledAt", combined.toISOString(), {
            shouldValidate: true,
        });
    };

    const handleDateSelect = (selectedDate) => {
        setDate(selectedDate);
        setDateOpen(false); // auto-close on select
        syncScheduledAt(selectedDate, time);
    };

    const handleTimeSelect = (opt) => {
        setTime(opt);
        syncScheduledAt(date, opt);
        setTimeOpen(false); // auto-close on select
    };

    const onSubmit = async (values) => {
        await mutation.mutateAsync({
            ...values,
            batchId,
        });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
                <Input placeholder="Title" {...register("title")} />
                {errors.title && (
                    <p className="text-sm text-destructive">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <Textarea
                placeholder="Description"
                {...register("description")}
            />

            <div className="grid grid-cols-2 gap-3">
                {/* Date picker */}
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Date
                    </Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                disabled={(d) =>
                                    d < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Scrollable time list */}
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Time
                    </Label>
                    <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !time && "text-muted-foreground"
                                )}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                {time ? time.label : "Pick a time"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="start">
                            <TimeList
                                value={time?.value}
                                onSelect={handleTimeSelect}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {errors.scheduledAt && (
                <p className="text-sm text-destructive -mt-2">
                    {errors.scheduledAt.message}
                </p>
            )}

            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                    Duration (minutes)
                </Label>
                <Input
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? "Scheduling..." : "Schedule Live Class"}
            </Button>
        </form>
    );
}