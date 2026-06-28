import { FPODashboard } from '@/app/components/fpo-dashboard'

export default function FPOSettingsPage() {
  return (
    <div className="px-6 py-8 space-y-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white">FPO Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your FPO and share codes with farmers</p>
      </div>

      <FPODashboard />
    </div>
  )
}
