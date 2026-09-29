import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { verifyOtpSchema } from "../validation/verifyOtp.schema";
import * as authService from "../services/auth.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
  });

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const result = await authService.verifyOtp({
        email,
        otp: data.otp,
      });

      toast.success("OTP verified");

      navigate("/reset-password", {
        state: { resetToken: result.resetToken },
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) =>
          toast.error(err.message)
        );
      } else {
        toast.error(
          error.response?.data?.message || "Invalid or expired OTP"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);

      await authService.forgotPassword({ email });

      toast.success("OTP resent to your email");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Verify OTP</CardTitle>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium">{email}</span>
        </p>

        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Didn't receive it?</span> Please
            check your{" "}
            <span className="font-medium">spam or junk folder</span> — the
            email may take a minute to arrive.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="otp">OTP</Label>

            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="mt-1"
              {...register("otp")}
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.otp?.message}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mt-4 w-full text-center text-sm text-slate-500 underline"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </CardContent>
    </Card>
  );
}