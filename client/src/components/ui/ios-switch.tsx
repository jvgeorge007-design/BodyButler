import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IOSSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'large';
}

const IOSSwitch = forwardRef<HTMLInputElement, IOSSwitchProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeStyles = {
      default: "w-12 h-7",
      large: "w-14 h-8"
    };

    const thumbSizeStyles = {
      default: "w-5 h-5",
      large: "w-6 h-6"
    };

    return (
      <label className="relative inline-flex items-center cursor-pointer ios-haptic-light ios-spring-fast">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div className={cn(
          "relative rounded-full peer transition-all duration-200",
          "peer-checked:bg-green-500 bg-gray-300 dark:bg-gray-700",
          "peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800",
          sizeStyles[size],
          className
        )}>
          <div className={cn(
            "absolute top-1 left-1 bg-white rounded-full transition-all duration-200 shadow-lg",
            "peer-checked:translate-x-full peer-checked:border-white",
            thumbSizeStyles[size]
          )} />
        </div>
      </label>
    );
  }
);

IOSSwitch.displayName = "IOSSwitch";

export { IOSSwitch };