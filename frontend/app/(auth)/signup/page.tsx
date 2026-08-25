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
  
  // Step Management
  const [step, setStep] = useState<1 | 2>(1)
  
  const [role, setRole] = useState<UserRole>('athlete')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Common fields
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Step 2 Fields
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !username || !email || !password) {
      setError('Please fill out all required fields to continue.')
      return
    }
    setError('')
    setStep(2)
  }

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
    { id: 'athlete', label: 'Athlete', icon: '🏃‍♂️', bg: 'bg-[var(--color-ink)] text-white border-transparent' },
    { id: 'coach', label: 'Coach', icon: '📋', bg: 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]' },
    { id: 'academy', label: 'Academy', icon: '🏢', bg: 'bg-[image:var(--image-gold-shine)] text-[var(--color-ink)] border-transparent' },
  ]

  return (
    <div>
      <h2 className="mt-2 mb-2 text-center text-3xl font-display font-bold text-[var(--color-ink)] tracking-wide uppercase">
        {step === 1 ? 'Create Account' : 'Profile Setup'}
      </h2>
      <p className="text-center font-mono text-[12px] text-[var(--color-gray-60)] mb-6 uppercase">
        Step {step} of 2
      </p>

      {error && (
        <div className="mb-4 rounded-none bg-[var(--color-paper)] border-l-4 border-red-500 p-3 text-sm text-[var(--color-ink)] font-mono">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-5">
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-3 text-center">
              I am joining as a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roleCards.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`
                    flex flex-col items-center justify-center p-3 border transition-all
                    ${role === r.id ? `${r.bg} shadow-md scale-105` : 'border-[var(--color-gray-15)] bg-[var(--color-white)] hover:bg-[var(--color-paper)] text-[var(--color-gray-60)]'}
                  `}
                >
                  <span className="text-2xl mb-1">{r.icon}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${role === r.id ? '' : 'text-[var(--color-gray-60)]'}`}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Input label={role === 'academy' ? 'Academy Name' : 'Full Name'} required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-[var(--color-ink)] text-white font-bold uppercase tracking-widest text-sm py-3 hover:bg-[var(--color-gray-60)] transition-colors">
              Continue to Step 2
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm font-mono text-[var(--color-gray-60)]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[var(--color-ink)] hover:underline uppercase">
              Sign in
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-4">
            <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Primary Sport" required value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Track, Football" />
            
            {/* Athlete Fields */}
            {role === 'athlete' && (
              <>
                <Input label="Position / Speciality" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. 100m Sprint, Striker" />
                <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                <div className="flex items-center mt-2 p-3 border border-[var(--color-gray-15)] bg-[var(--color-paper)]">
                  <input
                    id="trials"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-ink)]"
                    checked={availableForTrials}
                    onChange={(e) => setAvailableForTrials(e.target.checked)}
                  />
                  <label htmlFor="trials" className="ml-3 block text-[13px] font-bold text-[var(--color-ink)] uppercase tracking-wide">
                    Available for Trials
                  </label>
                </div>
              </>
            )}

            {/* Coach Fields */}
            {role === 'coach' && (
              <>
                <Input label="Years of Experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
                <div className="flex items-center mt-2 p-3 border border-[var(--color-gray-15)] bg-[var(--color-paper)]">
                  <input
                    id="opps"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-ink)]"
                    checked={openToOpportunities}
                    onChange={(e) => setOpenToOpportunities(e.target.checked)}
                  />
                  <label htmlFor="opps" className="ml-3 block text-[13px] font-bold text-[var(--color-ink)] uppercase tracking-wide">
                    Open to Opportunities
                  </label>
                </div>
              </>
            )}

            {/* Academy Fields */}
            {role === 'academy' && (
              <>
                <Input label="Academy Type" value={academyType} onChange={(e) => setAcademyType(e.target.value)} placeholder="e.g. Private, Club, School" />
                <Input label="Established Year" type="number" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} />
              </>
            )}
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-1/3 bg-[var(--color-paper)] text-[var(--color-ink)] font-bold uppercase tracking-widest text-[12px] py-3 hover:bg-[var(--color-gray-15)] transition-colors border border-[var(--color-gray-15)]"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-2/3 bg-[image:var(--image-gold-shine)] text-[var(--color-ink)] font-extrabold uppercase tracking-widest text-[12px] py-3 hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Creating...' : 'Complete Signup'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
