import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
  Settings as SettingsIcon,
  User,
  Palette,
  Database,
  LogOut,
  Trash2,
  ExternalLink,
  Check,
  Moon,
  Sun,
  Globe,
  Ruler,
  Clock,
  RefreshCw,
} from 'lucide-react'

const DEFAULT_SETTINGS = {
  units: 'metric', // metric or imperial
  dateFormat: 'MMM d, yyyy',
  theme: 'system', // light, dark, or system
  autoSync: true,
  cacheEnabled: true,
}

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('strava_settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })
  const [saved, setSaved] = useState(false)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('strava_settings', JSON.stringify(settings))
  }, [settings])

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearCache = () => {
    // Clear activity cache
    localStorage.removeItem('strava_activities_cache')
    localStorage.removeItem('strava_cache_timestamp')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearAllData = () => {
    // Clear all strava-related data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('strava_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    logout()
    navigate('/')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your preferences
              </p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your Strava account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.profile} alt={user?.firstname} />
                  <AvatarFallback className="text-lg">
                    {user?.firstname?.[0]}{user?.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {user?.firstname} {user?.lastname}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.city && user?.country
                      ? `${user.city}, ${user.country}`
                      : 'Location not set'}
                  </p>
                  {user?.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.strava.com/athletes/${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Strava
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize how data is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Units */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <Label>Units</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose between metric and imperial units
                  </p>
                </div>
                <Select
                  value={settings.units}
                  onValueChange={(value) => handleSettingChange('units', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (km, m)</SelectItem>
                    <SelectItem value="imperial">Imperial (mi, ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Date Format */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label>Date Format</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose how dates are displayed
                  </p>
                </div>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => handleSettingChange('dateFormat', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM d, yyyy">Jan 15, 2024</SelectItem>
                    <SelectItem value="d MMM yyyy">15 Jan 2024</SelectItem>
                    <SelectItem value="MM/dd/yyyy">01/15/2024</SelectItem>
                    <SelectItem value="dd/MM/yyyy">15/01/2024</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2024-01-15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {settings.theme === 'dark' ? (
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sun className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label>Theme</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data & Storage
              </CardTitle>
              <CardDescription>
                Manage cached data and sync preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Sync */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <Label>Auto Sync</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync new activities
                  </p>
                </div>
                <Switch
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                />
              </div>

              <Separator />

              {/* Cache */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label>Enable Caching</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cache activities locally for faster loading
                  </p>
                </div>
                <Switch
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                />
              </div>

              <Separator />

              {/* Clear Cache */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clear Cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove cached activity data
                  </p>
                </div>
                <Button variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <SettingsIcon className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>
                Manage your account and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <Label>Log Out</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>

              <Separator />

              {/* Clear All Data */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <Label className="text-destructive">Clear All Data</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remove all local data and disconnect your account
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Clear All Data</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all your local data including goals, settings, and cached
                        activities. You will be logged out and need to reconnect your Strava account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Strava Dashboard</strong> v1.0.0</p>
                <p>
                  Built with React, Vite, and shadcn/ui.
                  Data provided by the Strava API.
                </p>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://www.strava.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Strava.com
                  </a>
                  <a
                    href="https://developers.strava.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Strava API
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Settings
