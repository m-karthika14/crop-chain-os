import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { StatsSection } from '@/components/stats-section'
import { FeaturesSection } from '@/components/features-section'
import { LoginModal } from '@/components/login-modal'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main className="relative overflow-x-hidden" style={{ backgroundColor: '#0A0A0A' }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <div className="flex justify-center">
        <FeaturesSection />
      </div>
      <LoginModal />
      <Footer />
    </main>
  )
}
