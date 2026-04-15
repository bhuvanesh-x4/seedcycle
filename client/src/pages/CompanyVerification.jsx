import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import VineLoader from "../components/ui/VineLoader.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { api } from "../app/api.js";
import { useAuthStore } from "../app/store/authStore.js";

const STEPS = ["Enter GST", "Review Details", "Verify OTP", "Success"];

export default function CompanyVerification() {
    const user = useAuthStore((s) => s.user);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const nav = useNavigate();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form data
    const [gstNumber, setGstNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [gstDetails, setGstDetails] = useState(null);
    const [otp, setOtp] = useState("");
    const [expiresAt, setExpiresAt] = useState(null);

    // Check if already verified
    useEffect(() => {
        if (user?.isVerifiedCompany) {
            setStep(3); // Jump to success
        }
    }, [user]);

    // Step 1: Submit GST for verification
    const handleInitiate = async (e) => {
        e.preventDefault();
        if (!gstNumber || !companyName) return;

        try {
            setLoading(true);
            setError(null);
            const { data } = await api.post("/company/initiate-verification", {
                gstNumber: gstNumber.toUpperCase(),
                companyName
            });
            setGstDetails(data.gstDetails);
            setExpiresAt(data.expiresAt);
            setStep(1); // Move to review
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to initiate verification");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Confirm and proceed to OTP
    const handleProceedToOtp = () => {
        setStep(2);
    };

    // Step 3: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) return;

        try {
            setLoading(true);
            setError(null);
            await api.post("/company/verify-otp", { otp });
            await fetchMe(); // Refresh user data
            setStep(3); // Success!
        } catch (err) {
            setError(err?.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.post("/company/resend-otp");
            setExpiresAt(data.expiresAt);
            setOtp("");
            setError(null);
            alert("New OTP sent! Check server console.");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <PageShell>
                <GlassCard className="text-center">
                    <p className="text-white/70">Please login to verify your company.</p>
                    <MagneticButton onClick={() => nav("/auth")} className="mt-4">
                        Login
                    </MagneticButton>
                </GlassCard>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl text-neonTeal flex items-center justify-center gap-3">
                        Company Verification
                        <VerifiedBadge size="lg" showTooltip={false} />
                    </h1>
                    <p className="mt-2 text-white/70">
                        Verify your business with GST to get a verified badge
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8 relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-neonTeal to-neonPink transition-all duration-500"
                            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STEPS.map((label, i) => (
                        <div key={label} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i <= step
                                        ? "bg-gradient-to-br from-neonTeal to-neonPink text-midnight"
                                        : "bg-white/10 text-white/50"
                                    }`}
                            >
                                {i < step ? "✓" : i + 1}
                            </div>
                            <span className={`mt-2 text-xs ${i <= step ? "text-neonTeal" : "text-white/40"}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <GlassCard>
                    {loading && <VineLoader label="Processing..." />}

                    {!loading && step === 0 && (
                        <form onSubmit={handleInitiate} className="space-y-4">
                            <h2 className="font-display text-2xl text-neonTeal">Enter GST Details</h2>
                            <p className="text-white/60 text-sm">
                                Enter your 15-character GST Identification Number to start verification.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-white/70 text-sm block mb-1">GST Number *</label>
                                    <input
                                        type="text"
                                        value={gstNumber}
                                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                        placeholder="e.g., 27AAACC1206D1ZM"
                                        maxLength={15}
                                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60 uppercase tracking-wider font-mono"
                                        required
                                    />
                                    <p className="text-white/40 text-xs mt-1">
                                        Format: 2 digits (state) + 10 chars (PAN) + 3 chars
                                    </p>
                                </div>

                                <div>
                                    <label className="text-white/70 text-sm block mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Your registered company name"
                                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className="text-neonPink text-sm">{error}</div>}

                            <MagneticButton type="submit" className="w-full justify-center">
                                Verify GST Number
                            </MagneticButton>
                        </form>
                    )}

                    {!loading && step === 1 && gstDetails && (
                        <div className="space-y-4">
                            <h2 className="font-display text-2xl text-neonTeal">Review GST Details</h2>
                            <p className="text-white/60 text-sm">
                                Please verify the details below match your business registration.
                            </p>

                            <div className="bg-black/20 rounded-xl border border-white/10 p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-white/60">GST Number</span>
                                    <span className="text-neonTeal font-mono">{gstDetails.gstNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Legal Name</span>
                                    <span className="text-white">{gstDetails.legalName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Trade Name</span>
                                    <span className="text-white">{gstDetails.tradeName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">State</span>
                                    <span className="text-white">{gstDetails.state}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Status</span>
                                    <span className="text-green-400">{gstDetails.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Business Type</span>
                                    <span className="text-white">{gstDetails.businessType}</span>
                                </div>
                            </div>

                            <div className="bg-blue-900/20 rounded-xl border border-blue-500/30 p-3 text-sm text-blue-300">
                                📧 An OTP has been sent to verify ownership. Check the server console for the OTP (production would send via SMS/email).
                            </div>

                            {error && <div className="text-neonPink text-sm">{error}</div>}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(0)}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 hover:bg-white/10 transition"
                                >
                                    Back
                                </button>
                                <MagneticButton onClick={handleProceedToOtp} className="flex-1 justify-center">
                                    Proceed to OTP
                                </MagneticButton>
                            </div>
                        </div>
                    )}

                    {!loading && step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <h2 className="font-display text-2xl text-neonTeal">Enter OTP</h2>
                            <p className="text-white/60 text-sm">
                                Enter the 6-digit OTP to complete verification.
                            </p>

                            <div>
                                <label className="text-white/70 text-sm block mb-1">One-Time Password</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-4 outline-none focus:border-neonTeal/60 text-center text-2xl tracking-[0.5em] font-mono"
                                    required
                                />
                                {expiresAt && (
                                    <p className="text-white/40 text-xs mt-1 text-center">
                                        OTP expires at {new Date(expiresAt).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>

                            {error && <div className="text-neonPink text-sm text-center">{error}</div>}

                            <MagneticButton
                                type="submit"
                                className="w-full justify-center"
                                disabled={otp.length !== 6}
                            >
                                Verify OTP
                            </MagneticButton>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="w-full text-center text-sm text-neonTeal/70 hover:text-neonTeal transition"
                            >
                                Didn't receive OTP? Resend
                            </button>
                        </form>
                    )}

                    {!loading && step === 3 && (
                        <div className="text-center space-y-6 py-4">
                            {/* Success animation */}
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse scale-150" />
                                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <h2 className="font-display text-3xl text-neonTeal flex items-center justify-center gap-2">
                                    Verified!
                                    <VerifiedBadge size="lg" />
                                </h2>
                                <p className="mt-2 text-white/70">
                                    Congratulations! Your company is now verified.
                                </p>
                            </div>

                            {user?.companyDetails && (
                                <div className="bg-black/20 rounded-xl border border-blue-500/30 p-4 text-left space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Company</span>
                                        <span className="text-white font-semibold">{user.companyDetails.companyName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">GST</span>
                                        <span className="text-neonTeal font-mono">{user.companyDetails.gstNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Verified On</span>
                                        <span className="text-white">
                                            {new Date(user.companyDetails.verifiedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <MagneticButton onClick={() => nav("/profile")} className="flex-1 justify-center">
                                    View Profile
                                </MagneticButton>
                                <MagneticButton onClick={() => nav("/market")} className="flex-1 justify-center">
                                    Browse Market
                                </MagneticButton>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </PageShell>
    );
}
