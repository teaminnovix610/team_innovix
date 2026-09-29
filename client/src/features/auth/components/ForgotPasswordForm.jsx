import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema } from "../validation/forgotPassword.schema";
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

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await authService.forgotPassword(data);

      toast.success("OTP sent to your email");

      navigate("/verify-otp", { state: { email: data.email } });
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) =>
          toast.error(err.message)
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to send OTP"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">
          Forgot Password
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              {...register("email")}
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.email?.message}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}