import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import AttemptScreen from "../components/AttemptScreen";
import QuestionPalette from "../components/QuestionPalette";
import TestTimer from "../components/TestTimer";
import SubmitConfirmDialog from "../components/SubmitConfirmDialog";

import { useSaveAnswer } from "../hooks/useSaveAnswer";
import { useSubmitAttempt } from "../hooks/useSubmitAttempt";
import { useAttemptQuery } from "../hooks/useAttemptQuery";
import { useAssessmentDetail } from "../../assessment/hooks/useAssessmentDetail";
import { usePublicAssessmentDetail } from "../../weeklyTest/hooks/usePublicAssessmentDetail";

const AUTO_SAVE_DELAY = 1500; // ms

export default function AttemptPage({ mode }) {
    const { assessmentId, attemptId } = useParams();
    const navigate = useNavigate();

    // Guests must use the public (unauthenticated) assessment endpoint —
    // the authenticated one 401s for them since they have no session.
    const studentQuery = useAssessmentDetail(mode === "student" ? assessmentId : null);
    const guestQuery = usePublicAssessmentDetail(mode === "guest" ? assessmentId : null);

    const assessmentData = mode === "guest" ? guestQuery.data : studentQuery.data;
    const isLoadingAssessment = mode === "guest" ? guestQuery.isLoading : studentQuery.isLoading;

    const { data: fetchedAttempt, isLoading: isLoadingAttempt } = useAttemptQuery(attemptId, mode);

    const [attempt, setAttempt] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const saveTimeoutRef = useRef(null);
    const pendingRemainingTime = useRef(null);

    const { mutate: saveAnswer } = useSaveAnswer(attemptId, mode);
    const { mutate: submitAttempt, isPending: isSubmitting } = useSubmitAttempt(attemptId, mode);

    // Sync fetched attempt into local editable state
    useEffect(() => {
        if (fetchedAttempt) {
            setAttempt(fetchedAttempt);
        }
    }, [fetchedAttempt]);
    // Safety net: if the assessment's real end time has already passed but this
// attempt is still IN_PROGRESS (e.g. the client-side timer never fired because
// the tab was backgrounded/throttled), submit immediately on load instead of
// leaving it stuck open forever.
useEffect(() => {
    if (!attempt || !assessmentData || attempt.status !== "IN_PROGRESS") return;

    const { startDate, endTime } = assessmentData.assessment;
    const endDateTime = new Date(startDate);
    const [hours, minutes] = endTime.split(":").map(Number);
    endDateTime.setHours(hours, minutes, 0, 0);

    if (new Date() > endDateTime) {
        submitAttempt();
    }
}, [attempt, assessmentData, submitAttempt]);

    // Guard: if this attempt is already finished (submitted/auto-submitted),
    // redirect to the read-only result page instead of showing editable questions.
    // Covers the browser back-button case, bookmarks, and re-navigating to a stale URL.
    useEffect(() => {
        if (attempt && attempt.status !== "IN_PROGRESS") {
            const resultPath =
                mode === "guest"
                    ? `/weekly-test/${assessmentId}/result?attemptId=${attemptId}`
                    : `/results/${attemptId}`;
            navigate(resultPath, { replace: true });
        }
    }, [attempt, mode, assessmentId, attemptId, navigate]);

    const questions = assessmentData?.questions ?? [];

    const handleSelectOption = useCallback(
        (questionId, selectedOption) => {
            setAttempt((prev) => {
                if (!prev) return prev;
                const nextAnswers = prev.answers.map((a) =>
                    a.questionId === questionId
                        ? { ...a, selectedOption, status: "ANSWERED" }
                        : a
                );
                return { ...prev, answers: nextAnswers };
            });

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            saveTimeoutRef.current = setTimeout(() => {
                saveAnswer({
                    questionId,
                    selectedOption,
                    remainingTime: pendingRemainingTime.current,
                });
            }, AUTO_SAVE_DELAY);
        },
        [saveAnswer]
    );

    const handleTick = useCallback((secondsLeft) => {
        pendingRemainingTime.current = secondsLeft;
    }, []);

    const handleSubmit = useCallback(() => {
        submitAttempt(undefined, {
            onSuccess: () => {
                const resultPath =
                    mode === "guest"
                        ? `/weekly-test/${assessmentId}/result?attemptId=${attemptId}`
                        : `/results/${attemptId}`;
                // replace, not push — so the back button skips the now-finished
                // attempt URL entirely instead of landing back on it.
                navigate(resultPath, { replace: true });
            },
        });
    }, [submitAttempt, mode, assessmentId, attemptId, navigate]);

    const handleExpire = useCallback(() => {
        setConfirmOpen(false);
        handleSubmit();
    }, [handleSubmit]);

    const summary = useMemo(() => {
        const answered = attempt?.answers.filter((a) => a.status === "ANSWERED").length ?? 0;
        const total = attempt?.answers.length ?? 0;
        return { answered, skipped: total - answered, total };
    }, [attempt]);

    const isLoading =
        isLoadingAssessment ||
        isLoadingAttempt ||
        !attempt ||
        !assessmentData ||
        attempt.status !== "IN_PROGRESS";

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-medium">{assessmentData.assessment.title}</h1>
                <TestTimer
                    remainingTime={attempt.remainingTime}
                    onTick={handleTick}
                    onExpire={handleExpire}
                />
            </div>

            <AttemptScreen
                questions={questions}
                currentIndex={currentIndex}
                answers={attempt.answers}
                onSelectOption={handleSelectOption}
                onNext={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
                onPrevious={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            />

            <QuestionPalette
                questions={questions}
                answers={attempt.answers}
                currentIndex={currentIndex}
                onNavigate={setCurrentIndex}
            />

            <Button className="w-full" onClick={() => setConfirmOpen(true)}>
                Submit Test
            </Button>

            <SubmitConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                summary={summary}
                onConfirm={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}