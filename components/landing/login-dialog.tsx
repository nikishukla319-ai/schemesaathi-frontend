"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ShieldCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Role = "citizen" | "partner" | "admin"

const roles: {
  key: Role
  label: string
  icon: typeof User
  href: string
}[] = [
  { key: "citizen", label: "Citizen", icon: User, href: "/dashboard" },
  { key: "partner", label: "Partner", icon: Building2, href: "/partner" },
  { key: "admin", label: "Admin", icon: ShieldCheck, href: "/admin" },
]

export function LoginDialog({
  open,
  onOpenChange,
  mode = "login",
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode?: "login" | "signup"
}) {
  const router = useRouter()

  const [role, setRole] = useState<Role>("citizen")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const API_URL =
  "https://schemesaathi-backend-s2l1.onrender.com"

const endpoint =
  mode === "signup"
    ? `${API_URL}/api/auth/signup`
    : `${API_URL}/api/auth/login`
      const body =
        mode === "signup"
          ? {
              name,
              email,
              password,
            }
          : {
              email,
              password,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      // Login response contains JWT token
      if (mode === "login" && data.token) {
        localStorage.setItem("token", data.token)
      }

      // Save logged-in user information
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      // For signup, user needs to login after account creation
      if (mode === "signup") {
        alert("Account created successfully! Please login.")
        onOpenChange(false)
        return
      }

      // Check role from backend
      const backendRole = data.user?.role || role

      const destination =
        roles.find((r) => r.key === backendRole)?.href || "/dashboard"

      onOpenChange(false)
      router.push(destination)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
          
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signup"
              ? "Create your account"
              : "Welcome back"}
          </DialogTitle>

          <DialogDescription>
            {mode === "signup"
              ? "Create your SchemeSaathi account."
              : "Login to continue to SchemeSaathi."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">

          {/* Role */}
          <div className="space-y-2">
            <Label>Continue as</Label>

            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => {
                const Icon = r.icon
                const activeRole = role === r.key

                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-sm font-medium transition-colors",
                      activeRole
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="size-5" />
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name - Signup only */}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>

              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create account"
              : "Login"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}