import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  "relative overflow-hidden rounded-xl border backdrop-blur-lg transition-all duration-300 group",
  {
    variants: {
      variant: {
        default: 
          "glass-card border-border/20",
        cosmic: 
          "bg-gradient-to-br from-glass-backdrop to-cosmic-void/20 border-cosmic-stellar/20 shadow-[0_8px_32px_hsl(var(--cosmic-void)/0.3)]",
        nebula: 
          "bg-gradient-to-br from-cosmic-nebula/10 to-cosmic-plasma/10 border-cosmic-nebula/30 shadow-[0_8px_32px_hsl(var(--cosmic-nebula)/0.2)]",
        stellar: 
          "bg-gradient-to-br from-cosmic-stellar/10 to-cosmic-temporal/10 border-cosmic-stellar/30 shadow-[0_8px_32px_hsl(var(--cosmic-stellar)/0.2)]",
        void: 
          "bg-gradient-to-br from-cosmic-void/40 to-cosmic-shadow/30 border-cosmic-void/40 shadow-[0_8px_32px_hsl(var(--cosmic-void)/0.4)]",
        quantum: 
          "bg-gradient-to-br from-cosmic-quantum/10 to-cosmic-plasma/10 border-cosmic-quantum/30 shadow-[0_8px_32px_hsl(var(--cosmic-quantum)/0.2)]"
      },
      depth: {
        flat: "",
        shallow: "cosmic-depth shadow-md",
        medium: "cosmic-depth shadow-lg transform-gpu",
        deep: "cosmic-depth shadow-xl transform-gpu perspective-1000"
      },
      glow: {
        none: "",
        subtle: "hover:shadow-[0_0_16px_hsl(var(--glow-primary)/0.2)]",
        medium: "hover:shadow-[0_0_24px_hsl(var(--glow-primary)/0.3)]",
        intense: "hover:shadow-[0_0_32px_hsl(var(--glow-primary)/0.4)]"
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] hover:-translate-y-1",
        press: "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
      }
    },
    defaultVariants: {
      variant: "default",
      depth: "medium",
      glow: "subtle",
      interactive: "hover"
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  particle?: boolean
  shimmer?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, depth, glow, interactive, particle = false, shimmer = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, depth, glow, interactive, className }))}
        {...props}
      >
        {particle && (
          <div className="absolute inset-0 particle-field opacity-40 pointer-events-none" />
        )}
        {shimmer && (
          <div className="absolute inset-0 bg-glass-reflection opacity-20 pointer-events-none rounded-xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-50 pointer-events-none rounded-xl" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
GlassCardHeader.displayName = "GlassCardHeader"

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
GlassCardTitle.displayName = "GlassCardTitle"

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GlassCardDescription.displayName = "GlassCardDescription"

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
GlassCardContent.displayName = "GlassCardContent"

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
GlassCardFooter.displayName = "GlassCardFooter"

export { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardFooter, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent,
  glassCardVariants 
}