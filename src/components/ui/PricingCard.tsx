import { Check } from "lucide-react";

interface PricingCardProps {
    tier: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    ctaText: string;
    ctaHref: string;
    isPopular?: boolean;
    className?: string;
    onClick?: () => void;
}

const PricingCard = ({
    tier,
    price,
    period = "/mo",
    description,
    features,
    ctaText,
    ctaHref,
    isPopular = false,
    className = "",
    onClick,
}: PricingCardProps) => {
    return (
        <div
            className={`relative flex flex-col gap-8 rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-2 ${
                isPopular
                    ? "bg-gradient-to-b from-white to-indigo-50/30 border-indigo-200 shadow-[0_8px_40px_-8px_rgba(99,102,241,0.15)]"
                    : "bg-[var(--bg-warm)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-card-hover)]"
            } ${className}`}
        >
            {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-white px-4 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg">
                    Most Popular
                </span>
            )}

            <div>
                <h3 className="font-syne font-bold text-[20px] text-[var(--text-primary)] mb-1.5">{tier}</h3>
                <p className="font-dm-sans text-[13px] text-[var(--text-muted)] leading-relaxed">{description}</p>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="font-syne font-extrabold text-[44px] tracking-tight text-[var(--text-primary)]">{price}</span>
                <span className="font-dm-sans text-[16px] text-[var(--text-muted)]">{period}</span>
            </div>

            <div className="flex flex-col gap-3.5 flex-grow">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-[var(--bg-elevated)] text-[var(--accent-primary)]"
                        }`}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="font-dm-sans text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onClick}
                className={`w-full py-3 text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                    isPopular
                        ? "btn-primary gradient-bg shadow-[0_4px_20px_-6px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(99,102,241,0.5)]"
                        : "btn-secondary hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                }`}
            >
                {ctaText}
            </button>
        </div>
    );
};

export default PricingCard;
