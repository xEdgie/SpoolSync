"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        // Check if onboarding is complete (only in browser/electron context)
        if (typeof window !== 'undefined') {
          const path = localStorage.getItem("orcaSlicerPath")
          if (!path && pathname !== "/onboarding") {
            router.push("/onboarding")
          } else if (pathname === "/login" || pathname === "/onboarding") {
             if (path) router.push("/dashboard")
          }
        }
      } else if (pathname !== "/login") {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
