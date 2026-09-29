import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validation/register.schema";
import * as authService from "../services/auth.service";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

import { GraduationCap, User as UserIcon, ShieldCheck, Eye, EyeOff, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "TRAINEE",
      organization: "Ministry of Earth Sciences (MoES)",
    },
  });

  const role = watch("role");
  const { login } = useAuth();

  const selectRole = (value) => {
    setValue("role", value, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (role === "TRAINER" || role === "TEACHER") {
        data.experience = data.experience ?? 0;
        data.specialization = data.specialization
          ? data.specialization.split(",").map((s) => s.trim())
          : [];
      }

      const response = await authService.register(data);

      login(response.user);

      toast.success("Account Created Successfully");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((error) => toast.error(error.message));
      } else {
        toast.error(err.response?.data?.message || "Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl border border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="px-6 pt-6 pb-2 border-b border-slate-100">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Create Account — CAPACITY CONNECT
        </CardTitle>
        <p className="text-xs text-slate-500">
          Digital Capacity Building & LMS Portal (MoES / MIC)
        </p>
      </CardHeader>

      <CardContent className="px-6 py-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-medium">
          {/* Role selection cards */}
          <div>
            <label className="block mb-2 font-bold text-slate-700">Select User Role</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => selectRole("TRAINEE")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                  role === "TRAINEE"
                    ? "border-cyan-600 bg-cyan-50/80 text-cyan-800 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <GraduationCap size={22} className={role === "TRAINEE" ? "text-cyan-700" : "text-slate-500"} />
                <span className="font-bold text-xs">Trainee</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole("TRAINER")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                  role === "TRAINER"
                    ? "border-cyan-600 bg-cyan-50/80 text-cyan-800 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <UserIcon size={22} className={role === "TRAINER" ? "text-cyan-700" : "text-slate-500"} />
                <span className="font-bold text-xs">Trainer</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole("ADMIN")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-all ${
                  role === "ADMIN"
                    ? "border-cyan-600 bg-cyan-50/80 text-cyan-800 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <ShieldCheck size={22} className={role === "ADMIN" ? "text-cyan-700" : "text-slate-500"} />
                <span className="font-bold text-xs">Admin</span>
              </button>
            </div>
            <input type="hidden" {...register("role")} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Input placeholder="First Name" {...register("firstName")} />
              <p className="text-red-500 text-xs mt-0.5">{errors.firstName?.message}</p>
            </div>

            <div>
              <Input placeholder="Last Name" {...register("lastName")} />
              <p className="text-red-500 text-xs mt-0.5">{errors.lastName?.message}</p>
            </div>
          </div>

          <div>
            <Input placeholder="Email Address" {...register("email")} />
            <p className="text-red-500 text-xs mt-0.5">{errors.email?.message}</p>
          </div>

          <div>
            <Input placeholder="Mobile Phone Number" {...register("phone")} />
            <p className="text-red-500 text-xs mt-0.5">{errors.phone?.message}</p>
          </div>

          <div>
            <Input placeholder="Organization / Institute Name" {...register("organization")} />
          </div>

          <div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-red-500 text-xs mt-0.5">{errors.password?.message}</p>
          </div>

          {(role === "TRAINER" || role === "TEACHER") && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <Input placeholder="Highest Qualification (e.g., Ph.D. Oceanography)" {...register("qualification")} />
              <Input type="number" min="0" placeholder="Years of Experience" {...register("experience")} />
              <Input placeholder="Specialization Keywords (comma separated)" {...register("specialization")} />
              <Input placeholder="Short Bio / Experience Overview" {...register("bio")} />
            </div>
          )}

          <Button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2.5 rounded-xl text-xs mt-2" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}