'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Button 
        onClick={() => router.push('/auth/login')}
        className="w-32"
      >
        Login
      </Button>
    </main>
  )
}
