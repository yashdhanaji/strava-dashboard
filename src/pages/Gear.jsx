import { useState, useEffect } from 'react'
import stravaApi from '@/services/stravaApi'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Bike, Footprints, MapPin, ExternalLink, AlertCircle, Lightbulb, Wrench } from 'lucide-react'

const Gear = () => {
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAthleteData()
  }, [])

  const loadAthleteData = async () => {
    try {
      const data = await stravaApi.getAthleteProfile()
      setAthlete(data)
    } catch (error) {
      console.error('Failed to load athlete data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDistance = (meters) => {
    if (!meters) return '0 km'
    return `${(meters / 1000).toFixed(1)} km`
  }

  const shoes = athlete?.shoes || []
  const bikes = athlete?.bikes || []
  const allGear = [...shoes, ...bikes]
  const totalDistance = allGear.reduce((sum, g) => sum + (g.distance || 0), 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppSidebar />
      <main className="ml-[88px]">
        <TopNavBar
          title="Gear & Equipment"
          subtitle="Track your equipment usage and mileage"
          showFilters={false}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid gap-5 md:grid-cols-3">
                <Card className="rounded-3xl border-0 shadow-sm bg-[#EDFD93]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-black/60">
                      Shoes
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                      <Footprints className="h-5 w-5 text-black/70" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {shoes.length}
                    </div>
                    <p className="text-sm text-black/50 mt-1 font-medium">
                      {shoes.filter(s => !s.retired).length} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#93D6D6]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-[#6B7280]">
                      Bikes
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-[#93D6D6]/30 flex items-center justify-center">
                      <Bike className="h-5 w-5 text-[#2D8A8A]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {bikes.length}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1 font-medium">
                      {bikes.filter(b => !b.retired).length} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8CEE1]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-[#6B7280]">
                      Total Distance
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-[#C8CEE1]/40 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#5B6494]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {formatDistance(totalDistance)}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1 font-medium">
                      across all gear
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Shoes Section */}
              {shoes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDFD93] flex items-center justify-center">
                      <Footprints className="h-5 w-5 text-black/70" />
                    </div>
                    <h2 className="text-lg font-bold text-black">Shoes</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {shoes.map((shoe) => (
                      <GearCard
                        key={shoe.id}
                        item={shoe}
                        type="shoe"
                        formatDistance={formatDistance}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bikes Section */}
              {bikes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#93D6D6] flex items-center justify-center">
                      <Bike className="h-5 w-5 text-[#2D8A8A]" />
                    </div>
                    <h2 className="text-lg font-bold text-black">Bikes</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bikes.map((bike) => (
                      <GearCard
                        key={bike.id}
                        item={bike}
                        type="bike"
                        formatDistance={formatDistance}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {allGear.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 rounded-3xl border-0 shadow-sm bg-white">
                  <div className="w-16 h-16 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8 text-[#6B7280]" />
                  </div>
                  <CardTitle className="mb-2 text-black">No gear found</CardTitle>
                  <CardDescription className="text-[#6B7280] text-center max-w-md mb-6">
                    Add your shoes and bikes in Strava to track their usage here.
                  </CardDescription>
                  <Button asChild className="rounded-2xl bg-black text-white hover:bg-black/90">
                    <a
                      href="https://www.strava.com/settings/gear"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Add Gear on Strava
                    </a>
                  </Button>
                </Card>
              )}

              {/* Tips Section */}
              <Card className="rounded-3xl border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-black">
                    <div className="w-10 h-10 rounded-xl bg-[#CBE1D6] flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-[#3D7A5C]" />
                    </div>
                    Gear Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <TipCard
                      icon={<Footprints className="h-5 w-5" />}
                      title="Running Shoes"
                      description="Replace running shoes every 500-800 km to prevent injuries and maintain performance."
                      color="bg-[#EDFD93]"
                      iconColor="text-black/70"
                    />
                    <TipCard
                      icon={<Bike className="h-5 w-5" />}
                      title="Bike Maintenance"
                      description="Service your bike chain every 300-500 km and replace it every 3,000-5,000 km."
                      color="bg-[#93D6D6]"
                      iconColor="text-[#2D8A8A]"
                    />
                    <TipCard
                      icon={<AlertCircle className="h-5 w-5" />}
                      title="Track Everything"
                      description="Log all your gear on Strava to monitor wear and plan replacements ahead of time."
                      color="bg-[#C8CEE1]"
                      iconColor="text-[#5B6494]"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const GearCard = ({ item, type, formatDistance }) => {
  const isShoe = type === 'shoe'
  const maxDistance = isShoe ? 800000 : null // 800km for shoes
  const percentage = maxDistance ? Math.min((item.distance / maxDistance) * 100, 100) : 0

  return (
    <Card className="rounded-3xl border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isShoe ? 'bg-[#EDFD93]/30 text-[#6B8E23]' : 'bg-[#93D6D6]/30 text-[#2D8A8A]'
            }`}>
              {isShoe ? <Footprints className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base text-black">{item.name}</CardTitle>
              <Badge
                variant="outline"
                className={item.retired
                  ? 'bg-[#F1F3F5] text-[#6B7280] border-[#E5E7EB]'
                  : 'bg-[#CBE1D6]/30 text-[#3D7A5C] border-[#CBE1D6]'
                }
              >
                {item.retired ? 'Retired' : 'Active'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280] font-medium">Distance</span>
            <span className="text-lg font-bold text-black">{formatDistance(item.distance)}</span>
          </div>
          {isShoe && (
            <div className="space-y-2">
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-[#6B7280]">
                {Math.round(percentage)}% of 800km lifespan
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const TipCard = ({ icon, title, description, color, iconColor }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F8F9FA]">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 ${iconColor}`}>
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-semibold text-black mb-1">{title}</h4>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-5 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-20 mb-2 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-32 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

export default Gear
