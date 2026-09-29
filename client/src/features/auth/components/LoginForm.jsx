import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema } from "../validation/login.schema";
import * as authService from "../services/auth.service";
import useAuth from "../../../hooks/useAuth";

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

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const result = await authService.login(data);

      login(result.user);

      toast.success("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) =>
          toast.error(err.message)
        );
      } else {
        toast.error(
          error.response?.data?.message || "Login Failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-2 border-slate-400">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
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

          <div>
            <Label htmlFor="password">Password</Label>

            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-1 text-sm text-red-500">
              {errors.password?.message}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500">
            <a href="/forgot-password" className="underline">
              Forgot password?
            </a>
          </p>
      </CardContent>
    </Card>
  );
}