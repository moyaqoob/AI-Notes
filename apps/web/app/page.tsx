"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { LoginModal } from "../components/LoginModal"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="landing">
      <header className={`landing-header ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-header-inner">
          <span className="landing-logo">AI Notes</span>
          <nav>
            <a href="#features">Features</a>
            {user ? (
              <Link href="/notes" className="landing-btn primary">Go to App</Link>
            ) : (
              <>
                <button className="landing-btn ghost" onClick={() => setShowLogin(true)}>Log in</button>
                <button className="landing-btn primary" onClick={() => setShowLogin(true)}>Get started</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>One place for everything on your mind</h1>
          <p>Dump your ideas, notes, and research into AI Notes — and let AI organize, summarize, and extract key insights for you.</p>
          {user ? (
            <Link href="/notes" className="landing-btn primary large">Go to App</Link>
          ) : (
            <button className="landing-btn primary large" onClick={() => setShowLogin(true)}>Start for free</button>
          )}
        </div>
      </section>

      <section id="features" className="features">
        <h2>Remembering is so yesterday</h2>
        <p className="features-sub">Stop chasing scattered notes. AI Notes learns how you think and keeps everything organized.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">&#9889;</div>
            <h3>AI Summarizer</h3>
            <p>Dump rough notes and get clear, structured key points. AI extracts actionable items from messy content.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128203;</div>
            <h3>Smart Organization</h3>
            <p>Tag, categorize, and archive notes effortlessly. Search and filter to find exactly what you need.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128279;</div>
            <h3>Share & Collaborate</h3>
            <p>Generate public share links for any note. Share your work without requiring recipients to have an account.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#128202;</div>
            <h3>Insights Dashboard</h3>
            <p>Track your writing activity, most-used tags, AI usage, and weekly trends — all in one place.</p>
          </div>
        </div>
      </section>

      <section className="testimonial">
        <div className="testimonial-card">
          <p className="testimonial-text">I no longer worry about how I organize notes across different apps — I dump it in AI Notes and AI handles the rest. Game changer.</p>
          <p className="testimonial-author">— Happy User</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="landing-logo">AI Notes</span>
            <p>Smart note-taking with AI.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              {user ? <Link href="/notes">Dashboard</Link> : <button onClick={() => setShowLogin(true)}>Get started</button>}
            </div>
            <div className="footer-col">
              <h4>Compare</h4>
              <Link href="/notes">Notion</Link>
              <Link href="/notes">Obsidian</Link>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="mailto:support@ainotes.app">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 AI Notes. All rights reserved.</p>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
