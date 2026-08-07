'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { saveAuth } from '@/lib/auth'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import { useAuth } from '@/lib/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { setCurrentUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email,
        password
      })

      saveAuth(data.token, data.user)
      setCurrentUser(data.user)
      router.push('/feed')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Login failed')
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mt-2 mb-6 text-center text-2xl font-bold text-brand-black">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Username or Email address"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <a href="#" className="font-medium text-brand-gold hover:text-yellow-600">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account? {' '}
        <Link href="/signup" className="font-medium text-brand-gold hover:text-yellow-600">
          Sign up
        </Link>
      </div>
    </div>
  )
}
