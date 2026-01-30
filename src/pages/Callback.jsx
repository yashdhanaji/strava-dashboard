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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        {error ? (
          <>
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
                <AlertCircle className="h-6 w-6" />
              </div>
              <CardTitle className="text-destructive">Authorization Failed</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="mx-auto mb-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle>Completing Authorization</CardTitle>
              <CardDescription>Please wait while we connect to your Strava account.</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  )
}

export default Callback
