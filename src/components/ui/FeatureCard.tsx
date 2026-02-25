import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className = "" }: FeatureCardProps) => {
    return (
        <div className={`card group hover:border-l-[3px] hover:border-l-[var(--accent-primary)] transition-all duration-300 ${className}`}>
            <div className="mb-4 text-[var(--accent-primary)]">
                <Icon size={28} />
            </div>
            <h3 className="font-dm-sans font-semibold text-[18px] text-[var(--text-primary)] mb-2">
                {title}
            </h3>
            <p className="font-dm-sans text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default FeatureCard;
