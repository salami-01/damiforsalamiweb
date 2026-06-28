import { Suspense } from 'react'
import { AuthPanels } from '@/components/auth-panels'

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPanels initialMode="create" />
    </Suspense>
  )
}