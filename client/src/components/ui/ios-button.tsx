import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain';
  size?: 'default' | 'large' | 'small';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const IOSButton = forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    fullWidth = false,
    icon,
    iconPosition = 'left',
    children, 
    ...props 
  }, ref) => {
    const baseStyles = "ios-haptic-light ios-spring-fast ios-touch-target flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "text-white shadow-lg hover:shadow-xl",
      secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
      destructive: "ios-bg-red text-white shadow-lg hover:shadow-xl",
      plain: "text-white hover:bg-white/10"
    };

    const sizes = {
      default: "px-4 py-2 text-body",
      large: "px-6 py-3 text-headline",
      small: "px-3 py-1.5 text-callout"
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          widthClass,
          className
        )}
        style={{
          backgroundColor: variant === 'primary' ? 'rgb(59, 130, 246)' : undefined,
          ...props.style
        }}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

IOSButton.displayName = "IOSButton";

export { IOSButton };