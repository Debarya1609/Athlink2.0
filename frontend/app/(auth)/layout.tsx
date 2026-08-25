import React from 'react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <img src="/Athlink-logo (0001).jpg" alt="Athlink Logo" className="h-12 w-auto object-contain mx-auto" />
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-white)] py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-[var(--color-gray-15)]">
          {children}
        </div>
      </div>
    </div>
  )
}
