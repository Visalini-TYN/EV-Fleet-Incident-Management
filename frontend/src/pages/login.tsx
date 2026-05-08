// Login.tsx

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { api } from "../lib/api";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { Eye, EyeOff, Car } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [email, password]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const payload = response.data?.data || response.data || {};
      const accessToken = payload.accessToken;
      const refreshToken = payload.refreshToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      console.log("Login successful:", response.data);
      setSubmitSuccess("Login successful.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Login failed. Please try again.",
        );
      } else {
        setSubmitError("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-300/30 rounded-full blur-[100px]" />

        <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-yellow-300/20 rounded-full blur-[80px]" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">

        <Card className="w-full max-w-[440px] shadow-xl border border-slate-200">

          <CardContent className="p-0">

            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">

              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white">
                <Car size={32} />
              </div>

              <h1 className="text-3xl font-bold text-blue-700 mb-1">
                VoltTrack Fleet
              </h1>

              <p className="text-sm text-muted-foreground">
                EV Fleet Incident Management System
              </p>
            </div>

            {/* Form */}
            <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your corporate email"
                  className="h-12"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">

                <div className="flex justify-between items-center">
                  <Label htmlFor="password">
                    Password
                  </Label>

                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pr-12"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(value) => setRememberMe(value === true)}
                />

                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging In..." : "Log In"}
              </Button>

              {submitError && (
                <p className="text-sm text-red-600 text-center">
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <p className="text-sm text-green-600 text-center">
                  {submitSuccess}
                </p>
              )}

              {/* Footer */}
              <div className="pt-6 text-center border-t">

                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                
                <Link to="/signup">
                  <button
                    type="button"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="font-semibold text-blue-700">
            VoltTrack Fleet
          </div>

          <div className="text-sm text-muted-foreground text-center">
            © 2024 VoltTrack Enterprise Systems.
            All rights reserved.
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">

            <button className="hover:text-blue-600">
              Privacy Policy
            </button>

            <button className="hover:text-blue-600">
              Terms of Service
            </button>

            <button className="hover:text-blue-600">
              Fleet Safety Standards
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Login;