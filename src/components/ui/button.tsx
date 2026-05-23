import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Check, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-black hover:bg-success/90",
        error:
          "bg-error text-white hover:bg-error/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  shakeOnError?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      isSuccess = false,
      isError = false,
      loadingText,
      successText,
      errorText,
      shakeOnError = true,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [isShaking, setIsShaking] = React.useState(false)

    React.useEffect(() => {
      if (isError && shakeOnError) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (!prefersReducedMotion) {
          setIsShaking(true)
          const timer = setTimeout(() => setIsShaking(false), 500)
          return () => clearTimeout(timer)
        }
      }
    }, [isError, shakeOnError])

    const Comp = asChild ? Slot : "button"

    const getContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {loadingText || children}
          </>
        )
      }

      if (isSuccess) {
        return (
          <>
            <Check className="mr-2 h-4 w-4 animate-scale-in motion-reduce:animate-none" aria-hidden="true" />
            {successText || children}
          </>
        )
      }

      if (isError) {
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            {errorText || children}
          </>
        )
      }

      return children
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isShaking && "animate-shake motion-reduce:animate-none",
          isLoading && "cursor-wait",
          isSuccess && "bg-success hover:bg-success",
          isError && "bg-error hover:bg-error"
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-live={isSuccess || isError ? "polite" : undefined}
        {...props}
      >
        {getContent()}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
