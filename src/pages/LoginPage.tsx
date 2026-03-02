import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import { useLoginMutation } from "@/hooks/use-auth";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLoginMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const response = await loginMutation.mutateAsync(data);
      login(response.token, response.user, response.stationId);
      navigate("/panel");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string; }; };
      };
      setErrorMessage(
        axiosError.response?.data?.message ||
        "Error al iniciar sesión. Intentá de nuevo."
      );
    }
  };

  return (
    <div className="dark relative min-h-screen w-full bg-black text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.jpg')", // Cambiá por tu imagen
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border border-app-border bg-app-card/80 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-app-muted">
              Manage your radio station and broadcast streams.
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@superradio.com"
                    className="pl-9 bg-app-input border-app-border focus-visible:ring-app-accent"
                    {...register("email", {
                      required: "El email es obligatorio",
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-app-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10 bg-app-input border-app-border focus-visible:ring-app-accent"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              {/* <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-400 font-normal"
                >
                  Keep me signed in for 30 days
                </Label>
              </div> */}

              {/* Error */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                className="w-full bg-app-accent hover:bg-app-accent-hover text-white font-medium"
              >
                {isSubmitting || loginMutation.isPending
                  ? "Signing in..."
                  : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Separator className="bg-app-border" />
            <p className="text-xs text-slate-500 text-center">
              Secure access only • 256-bit SSL • Encrypted
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}