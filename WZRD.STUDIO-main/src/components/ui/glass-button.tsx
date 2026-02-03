import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: 
          "glass-button text-primary-foreground shadow-lg hover:shadow-glow-primary-md border border-primary/20",
        secondary: 
          "bg-gradient-to-br from-secondary/80 to-glass-secondary backdrop-blur-lg border border-secondary/30 text-secondary-foreground hover:from-secondary hover:to-glass-accent shadow-md hover:shadow-glow-secondary-md",
        cosmic: 
          "bg-gradient-to-br from-cosmic-nebula/20 to-cosmic-plasma/20 backdrop-blur-xl border border-cosmic-stellar/30 text-foreground hover:from-cosmic-nebula/30 hover:to-cosmic-plasma/30 shadow-xl hover:shadow-[0_0_20px_hsl(var(--cosmic-stellar)/0.4)]",
        stellar: 
          "bg-gradient-to-br from-cosmic-stellar/20 to-cosmic-temporal/20 backdrop-blur-lg border border-cosmic-stellar/40 text-cosmic-void hover:from-cosmic-stellar/30 hover:to-cosmic-temporal/30 shadow-lg hover:shadow-[0_0_16px_hsl(var(--cosmic-stellar)/0.5)]",
        void: 
          "bg-gradient-to-br from-cosmic-void/60 to-cosmic-shadow/40 backdrop-blur-md border border-cosmic-void/50 text-foreground hover:from-cosmic-void/80 hover:to-cosmic-shadow/60 shadow-lg hover:shadow-[0_0_12px_hsl(var(--cosmic-void)/0.6)]",
        ghost: 
          "backdrop-blur-sm border border-border/50 hover:bg-glass-backdrop hover:border-border text-foreground shadow-sm hover:shadow-md",
        outline: 
          "border border-primary/50 backdrop-blur-sm hover:bg-glass-primary hover:border-primary text-primary shadow-sm hover:shadow-glow-primary-sm"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9"
      },
      glow: {
        none: "",
        subtle: "hover:shadow-[0_0_8px_hsl(var(--glow-primary)/0.3)]",
        medium: "hover:shadow-[0_0_16px_hsl(var(--glow-primary)/0.4)]",
        intense: "hover:shadow-[0_0_24px_hsl(var(--glow-primary)/0.6)]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: "subtle"
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
  particle?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, glow, asChild = false, particle = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      >
        {particle && (
          <div className="absolute inset-0 particle-field opacity-50 pointer-events-none" />
        )}
        <div className="absolute inset-0 bg-glass-reflection opacity-30 pointer-events-none rounded-lg" />
        <div className="relative z-10 flex items-center gap-2">
          {children}
        </div>
      </Comp>
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }