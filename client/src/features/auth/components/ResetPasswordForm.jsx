import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPasswordSchema } from "../validation/resetPassword.schema";
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

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  if (!resetToken) {
    return null;
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await authService.resetPassword({
        resetToken,
        newPassword: data.newPassword,
      });

      toast.success("Password reset successful");

      navigate("/login");
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) =>
          toast.error(err.message)
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Reset token expired. Please start over."
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
          Reset Password
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="newPassword">New Password</Label>

            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              className="mt-1"
              {...register("newPassword")}
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.newPassword?.message}
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="mt-1"
              {...register("confirmPassword")}
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword?.message}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}