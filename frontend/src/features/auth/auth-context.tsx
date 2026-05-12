import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { jwtDecode } from "jwt-decode"

import { api } from "@/lib/api/auth-client"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  status: AuthStatus
  profile: unknown | null
  role: string | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ACCESS_TOKEN_KEY = "accessToken"

type DecodedToken = {
  sub?: string
  role?: string
}

const getRoleFromToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    console.log("JWT decoded:", decoded)
    return decoded?.sub || decoded?.role || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<unknown | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setStatus("loading")
    const nextRole = getRoleFromToken()
    console.log("Auth role (from token):", nextRole)
    setRole(nextRole)

    try {
      const response = await api.get("/api/profile/me")
      const payload = response.data?.data || response.data || null

      setProfile(payload)
      setStatus("authenticated")
    } catch (error) {
      setProfile(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      role,
      refreshProfile: fetchProfile,
    }),
    [status, profile, role, fetchProfile],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.")
  }

  return context
}
