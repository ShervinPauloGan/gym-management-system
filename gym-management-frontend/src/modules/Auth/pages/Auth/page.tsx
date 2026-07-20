import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/shared/stores/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { authService } from "../../services";
import toast from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.data.token, res.data.user);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-lg">GE</span>
          </div>
          <h1 className="text-metric-md text-[#111111]">Gym Engine</h1>
          <p className="text-sm text-muted mt-1">Sign in to your account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email" label="Email" type="email" placeholder="admin@gym.com"
              error={errors.email?.message}
              {...register("email", { required: "Email is required" })}
            />
            <div className="relative">
              <Input
                id="password" label="Password"
                type={showPassword ? "text" : "password"} placeholder="••••••••"
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-muted hover:text-[#111111] cursor-pointer">
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign in</Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted mt-6">Demo: admin@gym.com / admin123</p>
      </div>
    </div>
  );
}
