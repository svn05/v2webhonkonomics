"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  title: string
  description?: string
}

const SelectCard = React.forwardRef<HTMLDivElement, SelectCardProps>(
  ({ className, selected, disabled, icon, title, description, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200",
          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          selected
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border bg-card hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {icon && (
            <div className="text-5xl mb-2">
              {icon}
            </div>
          )}
          
          <h3 className="font-semibold text-lg text-foreground">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    )
  }
)
SelectCard.displayName = "SelectCard"

export { SelectCard }
