'use client'

import { motion } from 'framer-motion'
import { RoleSelection } from './role-selection'

export function LoginModal() {
  return (
    <section id="login-modal" className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-20 scroll-mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-md"
      >
        <RoleSelection />
      </motion.div>
    </section>
  )
}
