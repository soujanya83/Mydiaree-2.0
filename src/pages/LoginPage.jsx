import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import longLogo from "@/assets/mydiaree_long_logo.png";
import heroImage from "@/assets/login-hero-childcare.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await login({ email, password });
    if (data.status === "success") {
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    } else {
      toast.error(data.message || "Sign in failed. Please try again.");
    }
    setLoading(false);
  };

  const features = [
    "Daily journals & sleep checks",
    "Observations & program plans",
    "QIP & compliance tracking",
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 bg-primary/5 lg:grid-cols-2 overflow-y-hidden">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="relative z-10 flex items-center justify-between gap-4 mb-1">
          <img
            src={longLogo}
            alt="MyDiaree"
            className="h-14 w-auto max-w-[230px] rounded-full px-3 py-1 bg-white"
          />
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Secure login
          </div>
        </div>

        <div className="relative z-10 space-y-1">
          <div className="overflow-hidden rounded-lg border border-white/18 bg-white/12 p-2 shadow-2xl backdrop-blur">
            <div className="relative aspect-[16/10] overflow-hidden rounded-md">
              <img
                src={heroImage}
                alt="Educator working with preschool children in a classroom"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/70">Today</p>
                  <p className="mt-1 text-2xl font-bold">96% complete</p>
                </div>
                <div className="rounded-md border border-white/25 bg-white/18 px-3 py-2 text-right backdrop-blur">
                  <p className="text-lg font-bold">29</p>
                  <p className="text-[11px] font-medium text-white/75">updates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur">
              <ClipboardCheck className="h-4 w-4" />
              Premium childcare workspace
            </div>
            <h2 className="max-w-md text-3xl font-bold leading-tight">
              Run your centre with calm and clarity.
            </h2>
            <p className="max-w-md text-sm leading-6 text-primary-foreground/85">
              Daily journals, observations, programs, compliance and more in one childcare-friendly
              workspace.
            </p>
            <ul className="grid gap-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/70">
          © 2026 MyDiaree. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-lg border border-primary/10 bg-card px-5 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:px-8 sm:py-9">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>

          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <img src={longLogo} alt="MyDiaree" className="h-12 w-auto max-w-[210px]" />
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-7">
            <p className="mb-3 inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
              Centre workspace
            </p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to your MyDiaree workspace.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="you@centre.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
              />
              Keep me signed in for 30 days
            </label>

            <Button
              type="submit"
              className="h-12 w-full shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Trouble signing in? Contact your centre administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
