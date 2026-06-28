import { ReactNode } from 'react'

export const metadata = {
  title: 'Farmer Dashboard - CropChain OS',
  description: 'Manage your harvests and earnings',
}

export default function FarmerDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
