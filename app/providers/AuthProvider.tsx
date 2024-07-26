import { type KindeUser } from "@kinde-oss/kinde-remix-sdk/types"
import { createContext } from "react"

type AuthContextProps = {
  user: (KindeUser & { isAdmin: boolean }) | null
}

export const AuthContext = createContext<AuthContextProps>({ user: null })

type AuthProviderProps = {
  children: React.ReactNode
  user: AuthContextProps["user"]
}

export const AuthProvider = ({ children, user }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
