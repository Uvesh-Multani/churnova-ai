interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ children, className = "" }: BadgeProps) => {
  return (
    <span className={`badge ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
