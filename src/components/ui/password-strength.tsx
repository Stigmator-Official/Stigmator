"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { calculatePasswordStrength } from "@/lib/hooks/use-form-validation"

interface PasswordStrengthProps {
  password: string
  showLabel?: boolean
  className?: string
  barClassName?: string
}

const PasswordStrength = React.forwardRef<HTMLDivElement, PasswordStrengthProps>(
  ({ password, showLabel = true, className, barClassName }, ref) => {
    const strength = React.useMemo(
      () => calculatePasswordStrength(password),
      [password]
    )

    if (!password) {
      return (
        <div ref={ref} className={cn("space-y-2", className)}>
          <div className="flex gap-1 h-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 bg-white/10 transition-all duration-300",
                  barClassName
                )}
              />
            ))}
          </div>
          {showLabel && (
            <p className="text-[10px] font-mono text-muted-foreground">
              Password strength
            </p>
          )}
        </div>
      )
    }

    const getStrengthWidth = () => {
      if (strength.score <= 1) return "25%"
      if (strength.score <= 2) return "50%"
      if (strength.score <= 4) return "75%"
      return "100%"
    }

    const getStrengthColor = () => {
      return strength.color
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {/* Strength bars */}
        <div className="flex gap-1 h-1">
          {[...Array(4)].map((_, i) => {
            const isActive = i < Math.ceil(strength.score / 1.5)
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-20 bg-white",
                  barClassName
                )}
                style={{
                  backgroundColor: isActive ? getStrengthColor() : undefined,
                }}
              />
            )
          })}
        </div>

        {/* Progress bar style alternative */}
        <div className="h-1 bg-white/10 w-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: getStrengthWidth(),
              backgroundColor: getStrengthColor(),
            }}
          />
        </div>

        {/* Label */}
        {showLabel && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-muted-foreground">
              Password strength
            </p>
            <span
              className="text-[10px] font-mono font-bold transition-colors duration-200"
              style={{ color: getStrengthColor() }}
            >
              {strength.label}
            </span>
          </div>
        )}

        {/* Requirements checklist */}
        <div className="grid grid-cols-2 gap-1 pt-1">
          <RequirementItem met={password.length >= 8} text="8+ characters" />
          <RequirementItem met={/[a-z]/.test(password)} text="Lowercase" />
          <RequirementItem met={/[A-Z]/.test(password)} text="Uppercase" />
          <RequirementItem met={/[0-9]/.test(password)} text="Number" />
          <RequirementItem
            met={/[^a-zA-Z0-9]/.test(password)}
            text="Special char"
          />
        </div>
      </div>
    )
  }
)

PasswordStrength.displayName = "PasswordStrength"

interface RequirementItemProps {
  met: boolean
  text: string
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-200",
          met ? "bg-success scale-100" : "bg-white/20 scale-75"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-mono transition-colors duration-200",
          met ? "text-success" : "text-muted-foreground"
        )}
      >
        {text}
      </span>
    </div>
  )
}

export { PasswordStrength }
