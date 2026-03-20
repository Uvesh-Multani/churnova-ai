import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className = "" }: FeatureCardProps) => {
    return (
        <div className={`card group cursor-default transition-all duration-300 ${className}`}>
            <div className="icon-glow mb-5">
                <Icon size={22} className="text-[var(--accent-primary)]" />
            </div>
            <h3 className="font-dm-sans font-semibold text-[17px] text-[var(--text-primary)] mb-2 tracking-[-0.01em]">
                {title}
            </h3>
            <p className="font-dm-sans text-[14px] text-[var(--text-muted)] leading-[1.7]">
                {description}
            </p>
        </div>
    );
};

export default FeatureCard;
