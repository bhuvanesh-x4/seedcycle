import { useState } from "react";

/**
 * Verified Company Badge - Blue tick checkmark
 * Shows next to company names that have been GST verified
 */
export default function VerifiedBadge({ size = "md", showTooltip = true, className = "" }) {
    const [showTip, setShowTip] = useState(false);

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
        >
            {/* Animated blue tick badge */}
            <div className={`${sizes[size]} relative`}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-sm animate-pulse" />

                {/* Badge circle */}
                <svg
                    className={`${sizes[size]} relative z-10`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Circle background */}
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="url(#blueGradient)"
                        className="drop-shadow-lg"
                    />

                    {/* Checkmark */}
                    <path
                        d="M8 12.5L10.5 15L16 9.5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-[draw_0.5s_ease-out]"
                    />

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#1D4ED8" />
                            <stop offset="100%" stopColor="#1E40AF" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Tooltip */}
            {showTooltip && showTip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-blue-900/95 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg border border-blue-500/30 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Company
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div className="border-4 border-transparent border-t-blue-900/95" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
