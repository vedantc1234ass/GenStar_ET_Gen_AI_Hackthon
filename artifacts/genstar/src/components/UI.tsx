import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className, glow = false }: { children: ReactNode, className?: string, glow?: boolean }) {
  return (
    <div className={cn(
      "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300",
      glow && "hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]",
      className
    )}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }: { children: ReactNode, variant?: 'default'|'success'|'warning'|'danger'|'outline', className?: string }) {
  const variants = {
    default: "bg-primary/20 text-primary border-primary/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-destructive/20 text-destructive border-destructive/30",
    outline: "bg-transparent text-muted-foreground border-white/20"
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  disabled,
  onClick 
}: { 
  children: ReactNode, 
  variant?: 'primary'|'secondary'|'danger'|'ghost', 
  className?: string,
  disabled?: boolean,
  onClick?: () => void
}) {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] border border-primary/50",
    secondary: "bg-secondary text-white hover:bg-secondary/80 border border-white/10",
    danger: "bg-destructive/80 text-white hover:bg-destructive shadow-[0_0_15px_rgba(255,0,0,0.2)] border border-destructive/50",
    ghost: "bg-transparent text-muted-foreground hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm",
        className
      )}
      {...props}
    />
  );
}
