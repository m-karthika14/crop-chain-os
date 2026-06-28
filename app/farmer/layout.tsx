import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Farmer Portal — CropChain OS',
  description: 'Your crops, sales and payments — all in one place.',
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0A0F0A' }}
    >
      {children}
    </div>
  )
}
