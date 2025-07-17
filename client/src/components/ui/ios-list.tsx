import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface IOSListProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  grouped?: boolean;
}

interface IOSListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  accessory?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

const IOSList = forwardRef<HTMLDivElement, IOSListProps>(
  ({ className, inset = false, grouped = false, children, ...props }, ref) => {
    const baseStyles = "ios-corner-radius-large overflow-hidden";
    const spacingStyles = inset ? "ios-margin" : "";
    const groupedStyles = grouped ? "bg-white/5 backdrop-blur-lg" : "";

    return (
      <div
        className={cn(baseStyles, spacingStyles, groupedStyles, className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const IOSListItem = forwardRef<HTMLDivElement, IOSListItemProps>(
  ({ 
    className, 
    icon, 
    title, 
    subtitle, 
    accessory, 
    showChevron = false,
    onPress,
    destructive = false,
    ...props 
  }, ref) => {
    const baseStyles = "flex items-center ios-padding border-b border-white/10 last:border-b-0 ios-haptic-light ios-spring-fast";
    const interactiveStyles = onPress ? "cursor-pointer hover:bg-white/10" : "";
    const destructiveStyles = destructive ? "text-red-500" : "text-white";

    const content = (
      <>
        {icon && (
          <div className="mr-3 flex items-center justify-center">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={cn("text-body font-medium", destructiveStyles)}>
            {title}
          </div>
          {subtitle && (
            <div className="text-footnote ios-gray mt-1">
              {subtitle}
            </div>
          )}
        </div>
        
        {accessory && (
          <div className="ml-3 flex items-center">
            {accessory}
          </div>
        )}
        
        {showChevron && (
          <ChevronRight className="w-4 h-4 ios-gray ml-2" />
        )}
      </>
    );

    if (onPress) {
      return (
        <button
          className={cn(baseStyles, interactiveStyles, "w-full text-left", className)}
          onClick={onPress}
          ref={ref}
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        className={cn(baseStyles, className)}
        ref={ref}
        {...props}
      >
        {content}
      </div>
    );
  }
);

IOSList.displayName = "IOSList";
IOSListItem.displayName = "IOSListItem";

export { IOSList, IOSListItem };