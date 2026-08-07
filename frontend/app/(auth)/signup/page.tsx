'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { saveAuth } from '@/lib/auth'
import api from '@/lib/api'
import { AuthResponse, UserRole } from '@/types'
import { useAuth } from '@/lib/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { setCurrentUser } = useAuth()
  const [role, setRole] = useState<UserRole>('athlete')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Common fields
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [sport, setSport] = useState('')

  // Athlete specific
  const [position, setPosition] = useState('')
  const [age, setAge] = useState('')
  const [availableForTrials, setAvailableForTrials] = useState(true)

  // Coach specific
  const [experience, setExperience] = useState('')
  const [openToOpportunities, setOpenToOpportunities] = useState(true)

  // Academy specific
  const [academyType, setAcademyType] = useState('')
  const [establishedYear, setEstablishedYear] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Step 1: Register the user
      const { data: authData } = await api.post<AuthResponse>('/auth/register', {
        name,
        username,
        email,
        password,
        role
      })

      // Save auth so the profile update request has the JWT token
      saveAuth(authData.token, authData.user)

      // Step 2: Update profile with additional fields
      const profilePayload: Record<string, unknown> = {
        city: city || null,
        sport: sport || null
      }

      if (role === 'athlete') {
        profilePayload.position = position || null
        profilePayload.age = age ? parseInt(age, 10) : null
        profilePayload.available_for_trials = availableForTrials
      }

      if (role === 'coach') {
        profilePayload.experience_years = experience ? parseInt(experience, 10) : null
        profilePayload.open_to_opportunities = openToOpportunities
      }

      if (role === 'academy') {
        profilePayload.academy_type = academyType || null
        profilePayload.established_year = establishedYear ? parseInt(establishedYear, 10) : null
      }

      await api.put('/profiles/me', profilePayload)
      setCurrentUser(authData.user)

      router.push('/feed')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Signup failed')
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const roleCards = [
    { id: 'athlete', label: 'Athlete', icon: '🏃‍♂️', color: 'border-role-athlete', bg: 'bg-blue-50 text-blue-700' },
    { id: 'coach', label: 'Coach', icon: '📋', color: 'border-role-coach', bg: 'bg-green-50 text-green-700' },
    { id: 'academy', label: 'Academy', icon: '🏢', color: 'border-brand-gold', bg: 'bg-yellow-50 text-yellow-700' },
  ]

  return (
    <div>
      <h2 className="mt-2 mb-6 text-center text-2xl font-bold text-brand-black">
        Create your account
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-brand-black mb-3 text-center">
          I am joining as a...
        </label>
        <div className="grid grid-cols-3 gap-3">
          {roleCards.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id as UserRole)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                ${role === r.id ? `${r.color} ${r.bg} shadow-sm` : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'}
              `}
            >
              <span className="text-2xl mb-1">{r.icon}</span>
              <span className={`text-xs font-bold ${role === r.id ? '' : 'text-gray-600'}`}>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Common Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label={role === 'academy' ? 'Academy Name' : 'Full Name'} required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Primary Sport" required value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Cricket, Football" />
        </div>

        {/* Athlete Fields */}
        {role === 'athlete' && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Position / Role" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Fast Bowler, Striker" />
            <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            <div className="sm:col-span-2 flex items-center mt-2">
              <input
                id="trials"
                type="checkbox"
                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                checked={availableForTrials}
                onChange={(e) => setAvailableForTrials(e.target.checked)}
              />
              <label htmlFor="trials" className="ml-2 block text-sm text-gray-900">
                I am actively looking for trials and opportunities
              </label>
            </div>
          </div>
        )}

        {/* Coach Fields */}
        {role === 'coach' && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Years of Experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
            <div className="sm:col-span-2 flex items-center mt-2">
              <input
                id="opps"
                type="checkbox"
                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                checked={openToOpportunities}
                onChange={(e) => setOpenToOpportunities(e.target.checked)}
              />
              <label htmlFor="opps" className="ml-2 block text-sm text-gray-900">
                I am open to new coaching opportunities
              </label>
            </div>
          </div>
        )}

        {/* Academy Fields */}
        {role === 'academy' && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Academy Type" value={academyType} onChange={(e) => setAcademyType(e.target.value)} placeholder="e.g. Private, Club, School" />
            <Input label="Established Year" type="number" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} />
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-gold hover:text-yellow-600">
          Sign in
        </Link>
      </div>
    </div>
  )
}
