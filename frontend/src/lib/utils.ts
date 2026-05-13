import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeRole(role?: string | null) {
  if (!role) return null
  return role.trim().toLowerCase().replace(/[-\s]+/g, "_")
}
