import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

const Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleCallback } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authorization was denied. Please try again.')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      if (!code) {
        setError('No authorization code received.')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        const success = await handleCallback(code)
        if (success) {
          navigate('/dashboard')
        } else {
          setError('Failed to complete authorization.')
          setTimeout(() => navigate('/'), 3000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred during authorization.')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    processCallback()
  }, [searchParams, handleCallback, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA]">
      <Card className="w-full max-w-sm text-center rounded-3xl border-0 shadow-sm bg-white">
        {error ? (
          <>
            <CardHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-3">
                <AlertCircle className="h-7 w-7" />
              </div>
              <CardTitle className="text-red-600 font-bold">Authorization Failed</CardTitle>
              <CardDescription className="text-[#6B7280]">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6B7280]">Redirecting to login...</p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="mx-auto mb-3">
                <div className="h-14 w-14 rounded-2xl bg-[#EDFD93] flex items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-black/70" />
                </div>
              </div>
              <CardTitle className="font-bold text-black">Completing Authorization</CardTitle>
              <CardDescription className="text-[#6B7280]">Please wait while we connect to your Strava account.</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  )
}

export default Callback
