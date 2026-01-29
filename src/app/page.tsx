'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Get session from cookie and redirect based on role
    const session = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))
      ?.split('=')[1]

    if (!session) {
      router.push('/login')
      return
    }

    // Default redirect to kanban for authenticated users
    router.push('/kanban')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  )
}
