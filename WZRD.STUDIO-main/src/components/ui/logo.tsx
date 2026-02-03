
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  className?: string;
  showVersion?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, showVersion = true, size = "md" }: LogoProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-24",
    xl: "h-72",
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/wzrdtechlogo.png" 
        alt="WZRD.TECH Logo" 
        className={cn("object-contain cursor-pointer", sizeClasses[size])}
        onClick={() => navigate('/home')}
      />
      {showVersion && (
        <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
      )}
    </div>
  );
}
