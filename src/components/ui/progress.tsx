// src/components/ui/progress.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("w-full h-2 bg-gray-200 rounded-full", className)}
      {...props}
    >
      <div
        className="h-full bg-blue-600 rounded-full transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";
export { Progress };
