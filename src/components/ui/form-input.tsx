"use client"

import * as React from "react"
import { Eye, EyeOff, X, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string | null
  isValid?: boolean
  isShaking?: boolean
  showClear?: boolean
  showPasswordToggle?: boolean
  helperText?: string
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClear?: () => void
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      label,
      error,
      isValid = false,
      isShaking = false,
      showClear = true,
      showPasswordToggle = false,
      helperText,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      leftIcon,
      rightIcon,
      onClear,
      type = "text",
      disabled,
      value,
      onChange,
      id,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    React.useImperativeHandle(ref, () => inputRef.current!)

    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      onChange?.(e)
    }

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = ""
        setHasValue(false)
        onClear?.()
        const event = new Event("input", { bubbles: true })
        inputRef.current.dispatchEvent(event)
        inputRef.current.focus()
      }
    }

    const getBorderColor = () => {
      if (error) return "border-error shadow-focus-error"
      if (isValid && hasValue) return "border-success"
      if (isFocused) return "border-success shadow-focus-green"
      return "border-white/10 hover:border-white/20"
    }

    const getBgColor = () => {
      if (disabled) return "bg-white/5"
      return "bg-white/5"
    }

    // Build aria-describedby
    const describedBy = [
      ariaDescribedby,
      error ? errorId : null,
      helperText && !error ? helperId : null,
    ].filter(Boolean).join(" ") || undefined

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block font-mono text-xs tracking-wider transition-all duration-200 motion-reduce:transition-none",
              isFocused || hasValue
                ? "text-success translate-y-0"
                : "text-muted-foreground",
              error && "text-error",
              disabled && "opacity-50",
              labelClassName
            )}
          >
            <span className="flex items-center gap-2">
              {label}
              {props.required && <span className="text-error" aria-hidden="true">*</span>}
              {isValid && hasValue && !error && (
                <Check className="h-3 w-3 text-success animate-scale-in motion-reduce:animate-none" aria-hidden="true" />
              )}
            </span>
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            id={inputId}
            type={inputType}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            className={cn(
              "flex w-full rounded-none h-11 px-3 py-2 text-sm font-mono",
              "placeholder:text-muted-foreground/50",
              "focus-visible:outline-none transition-all duration-200 motion-reduce:transition-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              getBorderColor(),
              getBgColor(),
              leftIcon && "pl-10",
              (showClear || showPasswordToggle || rightIcon || error || (isValid && hasValue)) && "pr-10",
              isShaking && "animate-shake motion-reduce:animate-none",
              inputClassName
            )}
            {...props}
          />

          {/* Right side icons container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Clear button */}
            {showClear && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                tabIndex={-1}
                aria-label="Clear input"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            {/* Password toggle */}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] rounded p-0.5"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Error icon */}
            {error && (
              <AlertCircle className="h-4 w-4 text-error animate-fade-in motion-reduce:animate-none" aria-hidden="true" />
            )}

            {/* Success icon */}
            {!error && isValid && hasValue && (
              <Check className="h-4 w-4 text-success animate-scale-in motion-reduce:animate-none" aria-hidden="true" />
            )}

            {/* Custom right icon */}
            {rightIcon && !error && !(isValid && hasValue) && (
              <span className="text-muted-foreground" aria-hidden="true">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p 
            id={helperId}
            className="text-[10px] font-mono text-muted-foreground animate-fade-in motion-reduce:animate-none"
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              "text-xs font-mono text-error animate-fade-slide motion-reduce:animate-none flex items-center gap-1.5",
              errorClassName
            )}
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = "FormInput"

export { FormInput }
