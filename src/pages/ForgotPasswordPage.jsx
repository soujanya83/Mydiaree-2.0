import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authService } from "@/services/auth/authService";
import longLogo from "@/assets/mydiaree_long_logo.png";
import heroImage from "@/assets/login-hero-childcare.jpg";

const RESEND_SECONDS = 60;

function toFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });
  return formData;
}

function extractApiErrors(error) {
  const data = error?.response?.data || error;
  const fieldErrors = {};

  if (data?.errors) {
    Object.entries(data.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
    });
  }

  return {
    message: data?.message || "Something went wrong. Please try again.",
    fieldErrors,
  };
}

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs font-medium text-destructive">{children}</p>;
}

function StepPill({ active, complete, label, number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          complete
            ? "border-primary bg-primary text-primary-foreground"
            : active
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground",
        ].join(" ")}
      >
        {complete ? <Check className="h-3.5 w-3.5" /> : number}
      </span>
      <span
        className={[
          "truncate text-xs font-semibold",
          active || complete ? "text-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!resendTimer) return undefined;

    const timer = window.setInterval(() => {
      setResendTimer((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const stepIndex = useMemo(() => {
    if (step === "verify") return 2;
    if (step === "password") return 3;
    return 1;
  }, [step]);

  const applyFailure = (error) => {
    const { message, fieldErrors } = extractApiErrors(error);
    setErrors(fieldErrors);
    setBanner(message);
    toast.error(message);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setBanner("");

    try {
      const data = await authService.sendForgotPasswordOtp(toFormData({ email }));
      const nextEmail = data.email || email;
      setEmail(nextEmail);
      setOtp("");
      setStep("verify");
      setResendTimer(RESEND_SECONDS);
      toast.success(data.message || "OTP sent to your email.");
    } catch (error) {
      applyFailure(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setBanner("");

    try {
      const data = await authService.verifyForgotPasswordOtp(toFormData({ email, otp }));
      setStep("password");
      toast.success(data.message || "OTP verified successfully.");
    } catch (error) {
      applyFailure(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setErrors({});
    setBanner("");

    try {
      const data = await authService.resendForgotPasswordOtp(toFormData({ email }));
      setEmail(data.email || email);
      setOtp("");
      setResendTimer(RESEND_SECONDS);
      toast.success(data.message || "A new OTP has been sent to your email.");
    } catch (error) {
      applyFailure(error);
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setBanner("");

    try {
      const data = await authService.resetPassword(
        toFormData({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      );
      toast.success(data.message || "Password updated successfully. Please login.");
      navigate("/login");
    } catch (error) {
      applyFailure(error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            placeholder="you@centre.com"
          />
        </div>
        <FieldError>{errors.email}</FieldError>
      </div>

      <Button type="submit" className="h-12 w-full shadow-lg shadow-primary/20" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            Send OTP
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );

  const renderVerifyStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Enter the OTP sent to <span className="font-semibold text-foreground">{email}</span>.
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Verification OTP</label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setErrors((current) => ({ ...current, otp: "" }));
          }}
          containerClassName="justify-between gap-2"
        >
          <InputOTPGroup className="w-full justify-between gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-11 rounded-lg border text-base font-semibold sm:w-12"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldError>{errors.otp}</FieldError>
        <FieldError>{errors.email}</FieldError>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={resending || resendTimer > 0}
          onClick={handleResendOtp}
        >
          {resending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </Button>
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => {
            setStep("email");
            setOtp("");
            setErrors({});
            setBanner("");
          }}
        >
          Change email
        </button>
      </div>

      <Button type="submit" className="h-12 w-full shadow-lg shadow-primary/20" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            Verify OTP
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        OTP verified for <span className="font-semibold text-foreground">{email}</span>.
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">New password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError>{errors.password}</FieldError>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Confirm password</label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={passwordConfirmation}
            onChange={(event) => {
              setPasswordConfirmation(event.target.value);
              setErrors((current) => ({ ...current, password_confirmation: "" }));
            }}
            className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            placeholder="Re-enter new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError>{errors.password_confirmation}</FieldError>
        <FieldError>{errors.email}</FieldError>
      </div>

      <Button type="submit" className="h-12 w-full shadow-lg shadow-primary/20" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          <>
            Update password
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 overflow-y-hidden bg-primary/5 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <img
            src={longLogo}
            alt="MyDiaree"
            className="h-14 w-auto max-w-[230px] rounded-full bg-white px-3 py-1"
          />
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Secure reset
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="overflow-hidden rounded-lg border border-white/18 bg-white/12 p-2 shadow-2xl backdrop-blur">
            <div className="relative aspect-[16/10] overflow-hidden rounded-md">
              <img
                src={heroImage}
                alt="Educator working with preschool children in a classroom"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/15 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-semibold uppercase text-white/70">Account recovery</p>
                <p className="mt-1 max-w-sm text-2xl font-bold">
                  Verify your email and set a new password.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="max-w-md text-3xl font-bold leading-tight">
              Get back into your centre workspace.
            </h2>
            <p className="max-w-md text-sm leading-6 text-primary-foreground/85">
              We will send a one-time password to your registered email before your password can be
              updated.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/70">
          2026 MyDiaree. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-lg border border-primary/10 bg-card px-5 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:px-8 sm:py-9">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <img src={longLogo} alt="MyDiaree" className="h-12 w-auto max-w-[210px]" />
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-7">
            <p className="mb-3 inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
              Password help
            </p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Reset password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step === "email" && "Enter your account email to receive an OTP."}
              {step === "verify" && "Verify the OTP we sent to your email."}
              {step === "password" && "Create a new password for your account."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2">
            <StepPill active={stepIndex === 1} complete={stepIndex > 1} label="Email" number="1" />
            <StepPill active={stepIndex === 2} complete={stepIndex > 2} label="OTP" number="2" />
            <StepPill active={stepIndex === 3} complete={false} label="Password" number="3" />
          </div>

          {banner ? (
            <div className="mb-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {banner}
            </div>
          ) : null}

          {step === "email" && renderEmailStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "password" && renderPasswordStep()}
        </div>
      </div>
    </div>
  );
}
