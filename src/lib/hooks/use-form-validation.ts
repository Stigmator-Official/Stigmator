"use client"

import { useState, useCallback, useEffect } from "react"

export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: string) => boolean | string
}

export type FieldValidation = {
  [key: string]: ValidationRule
}

export type FieldErrors = {
  [key: string]: string | null
}

export type FieldTouched = {
  [key: string]: boolean
}

export type FieldValidity = {
  [key: string]: boolean
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  validationRules: FieldValidation,
  validateOnChange: boolean = true,
  validateOnBlur: boolean = true
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<FieldTouched>({})
  const [validity, setValidity] = useState<FieldValidity>({})
  const [isShaking, setIsShaking] = useState<string | null>(null)

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const rules = validationRules[name]
      if (!rules) return null

      if (rules.required && !value.trim()) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        switch (name) {
          case "email":
            return "Please enter a valid email address"
          case "password":
            return "Password contains invalid characters"
          default:
            return "Invalid format"
        }
      }

      if (rules.validate) {
        const result = rules.validate(value)
        if (typeof result === "string") return result
        if (!result) return "Invalid value"
      }

      return null
    },
    [validationRules]
  )

  const validateAll = useCallback((): boolean => {
    const newErrors: FieldErrors = {}
    const newTouched: FieldTouched = {}
    const newValidity: FieldValidity = {}
    let isValid = true

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, values[field] || "")
      newErrors[field] = error
      newTouched[field] = true
      newValidity[field] = !error && !!(values[field] || validationRules[field]?.required === false)
      if (error) isValid = false
    })

    setErrors(newErrors)
    setTouched(newTouched)
    setValidity(newValidity)
    return isValid
  }, [values, validationRules, validateField])

  const triggerShake = useCallback((fieldName: string) => {
    setIsShaking(fieldName)
    setTimeout(() => setIsShaking(null), 500)
  }, [])

  const setValue = useCallback(
    (name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }))

      if (validateOnChange && touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
        setValidity((prev) => ({ ...prev, [name]: !error && value.length > 0 }))
      }
    },
    [validateOnChange, touched, validateField]
  )

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }))

      if (validateOnBlur) {
        const error = validateField(name, values[name] || "")
        setErrors((prev) => ({ ...prev, [name]: error }))
        setValidity((prev) => ({ ...prev, [name]: !error && !!(values[name] || validationRules[name]?.required === false) }))
      }
    },
    [validateOnBlur, values, validateField, validationRules]
  )

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
    setValidity((prev) => ({ ...prev, [name]: !error && values[name]?.length > 0 }))
    if (error) triggerShake(name)
  }, [values, triggerShake])

  const clearFieldError = useCallback((name: string) => {
    setErrors((prev) => ({ ...prev, [name]: null }))
    setValidity((prev) => ({ ...prev, [name]: values[name]?.length > 0 }))
  }, [values])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setValidity({})
    setIsShaking(null)
  }, [initialValues])

  const isFormValid = Object.keys(validationRules).every(
    (field) => !errors[field] && (values[field]?.length > 0 || !validationRules[field]?.required)
  )

  return {
    values,
    errors,
    touched,
    validity,
    isShaking,
    isFormValid,
    setValue,
    handleBlur,
    validateAll,
    triggerShake,
    setFieldError,
    clearFieldError,
    resetForm,
    setValues,
  }
}

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { score, label: "Weak", color: "#dc2626" }
  if (score <= 4) return { score, label: "Fair", color: "#fbbf24" }
  if (score <= 5) return { score, label: "Good", color: "#4ade80" }
  return { score, label: "Strong", color: "#22c55e" }
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  name: /^[a-zA-Z\s'-]+$/,
}
