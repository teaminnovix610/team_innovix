import {
    CalendarDays,
    Clock3,
    Timer,
    Video,
    Play,
    Users,
    PenSquare,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";

import { formatDate, formatTime } from "@/utils/date";
import { getLiveClassState, getRemainingTime } from "@/utils/liveClass";

import useAuth from "@/hooks/useAuth";

export default function LiveClassCard({ liveClass }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const status = getLiveClassState(liveClass);
    const countdown = getRemainingTime(liveClass.scheduledAt);

    const openMeeting = (device = "main") => {
        navigate(`/live-class/${liveClass._id}/room?device=${device}`);
    };

    const isJoinDisabled = status === "SCHEDULED";
    const isTeacher = user?.role === "TEACHER";

    return (
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all">
            <div className="flex justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                        {liveClass.title}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
                        {liveClass.description}
                    </p>
                </div>

                <Badge
                    variant={
                        status === "LIVE"
                            ? "default"
                            : status === "COMPLETED"
                            ? "outline"
                            : "secondary"
                    }
                    className="shrink-0"
                >
                    {status}
                </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 min-w-0">
                    <CalendarDays size={18} className="shrink-0" />
                    <span className="truncate">{formatDate(liveClass.scheduledAt)}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                    <Clock3 size={18} className="shrink-0" />
                    <span className="truncate">{formatTime(liveClass.scheduledAt)}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                    <Timer size={18} className="shrink-0" />
                    <span className="truncate">{liveClass.duration} mins</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                    <Users size={18} className="shrink-0" />
                    <span className="truncate">{liveClass.batchId?.name ?? "Batch"}</span>
                </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    {status === "SCHEDULED" && countdown && (
                        <span className="text-sm text-blue-600">
                            Starts in {countdown}
                        </span>
                    )}

                    {status === "LIVE" && (
                        <span className="text-green-600 font-semibold">
                            ● LIVE NOW
                        </span>
                    )}

                    {status === "COMPLETED" && (
                        <span className="text-gray-500">Meeting Ended</span>
                    )}
                </div>

                {status !== "COMPLETED" && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                onClick={() => openMeeting("main")}
                                disabled={isJoinDisabled}
                                className="w-full sm:w-auto"
                            >
                                {isTeacher ? (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Class
                                    </>
                                ) : (
                                    <>
                                        <Video className="mr-2 h-4 w-4" />
                                        Join Class
                                    </>
                                )}
                            </Button>

                            {isTeacher && (
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => openMeeting("board")}
                                                disabled={isJoinDisabled}
                                                className="w-full sm:w-auto"
                                            >
                                                <PenSquare className="mr-2 h-4 w-4" />
                                                <span>Board Cam</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            className="max-w-[220px] text-center"
                                        >
                                            Join from a second device (phone/tablet)
                                            pointed at your blackboard or whiteboard
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {isTeacher && (
                            <p className="text-xs text-muted-foreground sm:text-right">
                                Board Cam: use a second device to stream your
                                blackboard/whiteboard alongside your main camera
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}