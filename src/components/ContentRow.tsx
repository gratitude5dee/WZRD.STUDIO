import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface ContentRowProps {
  title: string;
  children: ReactNode;
  onSeeAll?: () => void;
  variant?: "default" | "previews" | "top10";
}

export function ContentRow({ title, children, onSeeAll, variant = "default" }: ContentRowProps) {
  const getGap = () => {
    switch (variant) {
      case "previews":
        return "gap-4";
      case "top10":
        return "gap-0"; // Top 10 cards handle their own spacing
      default:
        return "gap-3";
    }
  };

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base md:text-lg font-bold text-foreground group cursor-pointer flex items-center gap-1 hover:text-primary transition-colors">
          {title}
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See All
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className={`flex ${getGap()} px-4 overflow-x-auto pb-2 scrollbar-hide`}>
        {children}
      </div>
    </section>
  );
}
