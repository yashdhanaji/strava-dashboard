import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, BarChart3, Target, Trophy, CheckCircle2 } from 'lucide-react'

const Login = () => {
  const { login } = useAuth()

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive statistics and visualizations beyond the standard Strava interface',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Goal Tracking',
      description: 'Set custom goals and track your progress in real-time',
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Trend Analysis',
      description: 'Visualize your performance trends over time with beautiful charts',
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Personal Records',
      description: 'Track and celebrate your achievements and best efforts',
    },
  ]

  const securityFeatures = [
    'Secure OAuth authentication',
    'Read-only access to your activities',
    'No data stored on our servers',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold">
              <span className="text-primary">Strava</span> Stats
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Unlock deeper insights into your athletic performance
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Connect your Strava account to view your stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={login}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect with Strava
            </Button>

            <div className="space-y-2">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              We'll never post to Strava or share your data without permission
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
