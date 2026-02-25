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
            className={`card relative flex flex-col gap-8 ${isPopular ? "border-[var(--accent-primary)]" : "border-[var(--border-subtle)]"
                } ${className}`}
        >
            {isPopular && (
                <span className="absolute -top-3 right-5 badge bg-[var(--accent-primary)] text-[var(--bg-base)] px-3 py-1 text-[11px] font-bold">
                    Most Popular
                </span>
            )}

            <div>
                <h3 className="font-syne font-bold text-[22px] text-[var(--text-primary)] mb-2">{tier}</h3>
                <p className="font-dm-sans text-[14px] text-[var(--text-secondary)]">{description}</p>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="font-syne font-bold text-[48px] text-[var(--text-primary)]">{price}</span>
                <span className="font-dm-sans text-[18px] text-[var(--text-muted)]">{period}</span>
            </div>

            <div className="flex flex-col gap-4 flex-grow">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <Check size={18} className="text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
                        <span className="font-dm-sans text-[14px] text-[var(--text-secondary)]">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onClick}
                className={`w-full ${isPopular ? "btn-primary" : "btn-secondary"
                    } py-3 text-[14px] font-semibold`}
            >
                {ctaText}
            </button>
        </div>
    );
};

export default PricingCard;
