import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api } from "../lib/api"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  status: AuthStatus
  profile: unknown | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<unknown | null>(null)

  const fetchProfile = useCallback(async () => {
    setStatus("loading")

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
      refreshProfile: fetchProfile,
    }),
    [status, profile, fetchProfile],
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
