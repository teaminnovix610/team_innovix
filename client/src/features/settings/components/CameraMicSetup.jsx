import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";

/**
 * Camera + mic setup widget.
 * We don't render our own video/audio preview — the browser's native
 * permission prompt IS the preview (camera indicator light, etc). We just
 * need to know granted vs not, and on success show a simple confirmation
 * modal with a way to move on to the dashboard.
 */
export default function CameraMicSetup() {
  const navigate = useNavigate();

  // checking -> idle -> requesting -> success | denied | blocked | error
  const [status, setStatus] = useState("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // On mount: silently check existing permission state. Browsers that don't
  // support querying "camera"/"microphone" (e.g. Safari) will throw/reject —
  // in that case we just fall back to the normal idle "Enable" state.
  useEffect(() => {
    let cancelled = false;

    const checkPermissions = async () => {
      try {
        const [cam, mic] = await Promise.all([
          navigator.permissions.query({ name: "camera" }),
          navigator.permissions.query({ name: "microphone" }),
        ]);

        if (cancelled) return;

        if (cam.state === "granted" && mic.state === "granted") {
          setStatus("success");
          setShowSuccessModal(true);
        } else if (cam.state === "denied" || mic.state === "denied") {
          // Browser will never re-show the native prompt from here on —
          // the user has to flip it manually in site settings.
          setStatus("blocked");
        } else {
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("idle");
      }
    };

    checkPermissions();
    return () => {
      cancelled = true;
    };
  }, []);

  // This is the function that actually triggers the browser's permission popup.
  const requestAccess = async () => {
    setErrorMsg("");

    // If the browser already has this hard-blocked, calling getUserMedia
    // again will just silently reject with no prompt shown — so check
    // first and route straight to the "blocked" guidance instead.
    try {
      const [cam, mic] = await Promise.all([
        navigator.permissions.query({ name: "camera" }),
        navigator.permissions.query({ name: "microphone" }),
      ]);
      if (cam.state === "denied" || mic.state === "denied") {
        setStatus("blocked");
        return;
      }
    } catch {
      // Permissions API not supported for these names (e.g. Safari) —
      // fall through and just try getUserMedia directly.
    }

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // We only needed this to trigger/confirm the permission grant —
      // stop the tracks immediately since we're not rendering a preview.
      stream.getTracks().forEach((track) => track.stop());

      setStatus("success");
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);

      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setStatus("blocked");
      } else if (err?.name === "NotFoundError") {
        setStatus("error");
        setErrorMsg("No camera or microphone was found on this device.");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong while accessing your camera/microphone.");
      }
    }
  };

  return (
    <Card className="p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Camera & Microphone Setup</h3>
        <p className="text-sm text-slate-500">
          Test your devices before joining a live class.
        </p>
      </div>

      {/* Checking: brief pre-check, avoids a flash of the "Enable" button */}
      {status === "checking" && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 sm:py-10 px-4 text-center">
          <p className="text-sm text-slate-400">Checking device permissions...</p>
        </div>
      )}

      {/* Idle: nothing requested yet */}
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-10 px-4 border border-dashed rounded-lg text-center">
          <ShieldCheck size={28} className="text-slate-400 shrink-0" />
          <p className="text-sm text-slate-500 max-w-xs">
            Your browser will ask permission to use your camera and microphone.
          </p>
          <Button onClick={requestAccess} className="w-full sm:w-auto">
            Enable Camera & Microphone
          </Button>
          <p className="text-xs font-semibold text-slate-400 max-w-xs">
            Note: Please select "Allow" while using the site for a smooth, uninterrupted experience during live classes.
          </p>
        </div>
      )}

      {/* Requesting: waiting on the native browser popup */}
      {status === "requesting" && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-10 px-4 text-center">
          <p className="text-sm text-slate-500">
            Check for a permission prompt from your browser...
          </p>
          <Button disabled className="w-full sm:w-auto">
            <Loader2 size={16} className="mr-2 animate-spin" />
            Requesting access...
          </Button>
        </div>
      )}

      {/* Blocked: browser will not show the native prompt again — user must
          fix this manually in site settings, "Try Again" can't help here */}
      {status === "blocked" && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Camera/microphone access is blocked for this site. Your browser won't ask again automatically —
              click the lock/site-info icon next to the address bar, set Camera and Microphone to "Allow", then
              reload this page.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            I've Allowed It — Reload
          </Button>
        </div>
      )}

      {/* Error: something other than a permission block went wrong */}
      {status === "error" && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={requestAccess} className="w-full sm:w-auto">
            Try Again
          </Button>
        </div>
      )}

      {/* Success: quiet inline state behind the modal (visible if the modal is dismissed) */}
      {status === "success" && !showSuccessModal && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 sm:py-10 px-4 border border-dashed rounded-lg text-center">
          <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-600">
            Camera and microphone access is enabled
          </p>
          <Button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            Go to Dashboard
          </Button>
        </div>
      )}

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <DialogTitle className="text-center">You're all set</DialogTitle>
            <DialogDescription className="text-center">
              Camera and microphone access is enabled. You're ready to join live classes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}