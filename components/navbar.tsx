'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Wheat, LogIn } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#market-opportunity', label: 'Market' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-emerald-500/10 shadow-lg shadow-emerald-500/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('#home') }}
            className="flex items-center gap-2 group"
          >
            <Wheat className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight text-white">
              Crop<span className="text-emerald-400">Chain</span>
              <span className="text-emerald-500/70 text-sm ml-1 font-normal">OS</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="relative px-4 py-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200 rounded-lg hover:bg-emerald-500/5 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-emerald-400 group-hover:w-4/5 transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* Login button */}
          <button
            onClick={() => document.getElementById('login-modal')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:flex items-center gap-2 text-emerald-400 font-semibold text-sm px-5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-emerald-500/10 md:hidden"
          >
            <ul className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-all duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-emerald-500/10">
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    document.getElementById('login-modal')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all duration-200 font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
