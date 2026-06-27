import { Suspense } from 'react'
import { AuthPanels } from '@/components/auth-panels'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPanels />
    </Suspense>
  )
}