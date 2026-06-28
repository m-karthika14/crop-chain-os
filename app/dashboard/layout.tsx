import type { Metadata } from 'next'
import { Sidebar } from './components/sidebar'
import { DashboardHeader } from './components/header'

export const metadata: Metadata = {
  title: 'Dashboard — CropChain OS',
  description: 'GreenHarvest FPO Manager Dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
