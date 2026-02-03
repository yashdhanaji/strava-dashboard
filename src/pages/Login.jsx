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
      color: 'bg-[#EDFD93]',
      iconColor: 'text-black/70',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Goal Tracking',
      description: 'Set custom goals and track your progress in real-time',
      color: 'bg-[#93D6D6]',
      iconColor: 'text-[#2D8A8A]',
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Trend Analysis',
      description: 'Visualize your performance trends over time with beautiful charts',
      color: 'bg-[#CBE1D6]',
      iconColor: 'text-[#3D7A5C]',
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Personal Records',
      description: 'Track and celebrate your achievements and best efforts',
      color: 'bg-[#C8CEE1]',
      iconColor: 'text-[#5B6494]',
    },
  ]

  const securityFeatures = [
    'Secure OAuth authentication',
    'Read-only access to your activities',
    'No data stored on our servers',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
              <Activity className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-black">
              Strava <span className="text-[#6B7280]">Stats</span>
            </h1>
          </div>
          <p className="text-lg text-[#6B7280]">
            Unlock deeper insights into your athletic performance
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {features.map((feature, index) => (
            <Card key={index} className="text-center rounded-3xl border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} ${feature.iconColor} mb-3`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-base font-bold text-black">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-[#6B7280]">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto rounded-3xl border-0 shadow-sm bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-black">Get Started</CardTitle>
            <CardDescription className="text-[#6B7280]">Connect your Strava account to view your stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              size="lg"
              className="w-full gap-2 rounded-2xl bg-black text-white hover:bg-black/90 h-12 font-semibold"
              onClick={login}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect with Strava
            </Button>

            <div className="space-y-3 p-4 rounded-2xl bg-[#F8F9FA]">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EDFD93]">
                    <CheckCircle2 className="h-4 w-4 text-black/70" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-[#6B7280]">
              We'll never post to Strava or share your data without permission
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
