"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

interface Props {
  onClose: () => void
}

export function LoginModal({ onClose }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      router.push("/notes")
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&#10005;</button>
        <p className="brand">AI Notes</p>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input placeholder="Name" value={name}
              onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder={mode === "signup" ? "Password (min 6 chars)" : "Password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={mode === "signup" ? 6 : 1} />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="auth-link">
          {mode === "login" ? (
            <>Don&apos;t have an account? <button className="link" onClick={() => { setMode("signup"); setError("") }}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="link" onClick={() => { setMode("login"); setError("") }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
