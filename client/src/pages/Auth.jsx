import { useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import { useAuthStore } from "../app/store/authStore.js";
import { useNavigate } from "react-router-dom";
import { api } from "../app/api.js";

export default function Auth() {
  const [mode, setMode] = useState("login"); // login, register, forgot, verify-otp, reset-password
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);

  const nav = useNavigate();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setLocalError("");
    setSuccessMessage("");
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (mode === "register") {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      if (phone && !/^[0-9]{10,15}$/.test(phone.replace(/[^0-9]/g, ""))) {
        setLocalError("Please enter a valid phone number (10-15 digits)");
        return;
      }
    }

    const ok = mode === "login"
      ? await login(email, password)
      : await register(name, email, password, phone);

    if (ok) nav("/dashboard");
  };

  // Forgot Password - Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setLocalError("");
      await api.post("/password/request-reset", { email });
      setSuccessMessage("If an account with this email exists, we've sent an OTP to your email and WhatsApp.");
      setMode("verify-otp");
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    try {
      setIsLoading(true);
      setLocalError("");
      await api.post("/password/verify-otp", { email, otp });
      setSuccessMessage("OTP verified! Now set your new password.");
      setMode("reset-password");
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setLocalError("");
      await api.post("/password/reset", { email, otp, newPassword });
      setSuccessMessage("Password reset successful! You can now login with your new password.");
      setTimeout(() => switchMode("login"), 2000);
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9+\- ]/g, "");
    setPhone(value);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-xl">
        <GlassCard>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-neonTeal">
              {mode === "login" && "Login"}
              {mode === "register" && "Create account"}
              {mode === "forgot" && "Forgot Password"}
              {mode === "verify-otp" && "Verify OTP"}
              {mode === "reset-password" && "Reset Password"}
            </h2>
            {(mode === "login" || mode === "register") && (
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="text-sm text-neonPink hover:underline"
              >
                {mode === "login" ? "Switch to Register" : "Switch to Login"}
              </button>
            )}
            {(mode === "forgot" || mode === "verify-otp" || mode === "reset-password") && (
              <button
                onClick={() => switchMode("login")}
                className="text-sm text-white/60 hover:text-white"
              >
                ← Back to Login
              </button>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={onSubmit} className="mt-6 grid gap-3">
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />

              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm text-neonTeal/70 hover:text-neonTeal text-left"
              >
                Forgot password?
              </button>

              {(error || localError) && (
                <div className="text-sm text-neonPink bg-neonPink/10 border border-neonPink/30 rounded-lg px-3 py-2">
                  {localError || error}
                </div>
              )}

              <button
                disabled={loading}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={onSubmit} className="mt-6 grid gap-3">
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="relative">
                <input
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 pl-12 outline-none focus:border-neonTeal/60"
                  placeholder="Phone Number (WhatsApp)"
                  value={phone}
                  onChange={handlePhoneChange}
                  type="tel"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">📱</span>
              </div>
              <p className="text-white/40 text-xs -mt-1 ml-1">
                Used for WhatsApp notifications & OTP (e.g., 919876543210)
              </p>

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={6}
              />

              <input
                className={`rounded-xl bg-black/20 border px-4 py-3 outline-none focus:border-neonTeal/60 ${confirmPassword && password !== confirmPassword ? "border-red-500/60" : "border-white/10"
                  }`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                minLength={6}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs -mt-1 ml-1">Passwords do not match</p>
              )}

              {(error || localError) && (
                <div className="text-sm text-neonPink bg-neonPink/10 border border-neonPink/30 rounded-lg px-3 py-2">
                  {localError || error}
                </div>
              )}

              <button
                disabled={loading || password !== confirmPassword}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Register"}
              </button>
            </form>
          )}

          {/* Forgot Password - Enter Email */}
          {mode === "forgot" && (
            <form onSubmit={handleRequestOtp} className="mt-6 grid gap-3">
              <p className="text-white/60 text-sm">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />

              {localError && (
                <div className="text-sm text-neonPink bg-neonPink/10 border border-neonPink/30 rounded-lg px-3 py-2">
                  {localError}
                </div>
              )}

              <button
                disabled={isLoading}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Verify OTP */}
          {mode === "verify-otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-6 grid gap-3">
              <p className="text-white/60 text-sm">
                Enter the 6-digit OTP sent to your email and WhatsApp.
              </p>

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-4 outline-none focus:border-neonTeal/60 text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />

              {localError && (
                <div className="text-sm text-neonPink bg-neonPink/10 border border-neonPink/30 rounded-lg px-3 py-2">
                  {localError}
                </div>
              )}

              <button
                disabled={isLoading || otp.length !== 6}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm text-neonTeal/70 hover:text-neonTeal text-center"
              >
                Didn't receive OTP? Resend
              </button>
            </form>
          )}

          {/* Reset Password */}
          {mode === "reset-password" && (
            <form onSubmit={handleResetPassword} className="mt-6 grid gap-3">
              <p className="text-white/60 text-sm">
                Set your new password.
              </p>

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                required
                minLength={6}
              />

              <input
                className={`rounded-xl bg-black/20 border px-4 py-3 outline-none focus:border-neonTeal/60 ${confirmNewPassword && newPassword !== confirmNewPassword ? "border-red-500/60" : "border-white/10"
                  }`}
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                type="password"
                required
                minLength={6}
              />
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-red-400 text-xs -mt-1 ml-1">Passwords do not match</p>
              )}

              {localError && (
                <div className="text-sm text-neonPink bg-neonPink/10 border border-neonPink/30 rounded-lg px-3 py-2">
                  {localError}
                </div>
              )}

              <button
                disabled={isLoading || newPassword !== confirmNewPassword || newPassword.length < 6}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </PageShell>
  );
}
