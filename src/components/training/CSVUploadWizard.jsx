import { useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarIcon,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { parseCSV, validateCSV, VALID_WORKOUT_TYPES } from '@/utils/csvParser'
import { convertToTrainingPlan } from '@/utils/csvToTrainingPlan'
import { RACE_TYPES, WORKOUT_TYPES } from '@/utils/trainingPlanGenerator'
import CSVTemplateDownload from './CSVTemplateDownload'

const STEPS = [
  { id: 1, title: 'Upload', description: 'Upload your CSV file' },
  { id: 2, title: 'Race Details', description: 'Enter race information' },
  { id: 3, title: 'Preview', description: 'Review your workouts' },
  { id: 4, title: 'Confirm', description: 'Import your plan' },
]

const CSVUploadWizard = ({ onPlanGenerated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)

  // File upload state
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Parsed data state
  const [validationResult, setValidationResult] = useState(null)

  // Race details form state
  const [raceDetails, setRaceDetails] = useState({
    raceName: '',
    raceType: '',
    raceDate: null,
  })

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setError(null)

    try {
      const text = await selectedFile.text()
      const { rows, errors: parseErrors } = parseCSV(text)

      if (parseErrors.length > 0) {
        setError(parseErrors.join('. '))
        return
      }

      const validation = validateCSV(rows)
      setValidationResult(validation)

      // Auto-detect race date from last workout if a race workout exists
      const raceWorkout = validation.validRows.find((r) => r.type === 'race')
      if (raceWorkout) {
        setRaceDetails((prev) => ({
          ...prev,
          raceDate: new Date(raceWorkout.date),
        }))
      }
    } catch (err) {
      setError('Failed to parse CSV file: ' + err.message)
    }
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelect(droppedFile)
    },
    [handleFileSelect]
  )

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files[0])
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setFile(null)
    setValidationResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Form handlers
  const updateRaceDetails = (field, value) => {
    setRaceDetails((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return file && validationResult && validationResult.validRows.length > 0
      case 2:
        return raceDetails.raceName && raceDetails.raceType && raceDetails.raceDate
      case 3:
        return validationResult && validationResult.valid
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Import handler
  const handleImport = async () => {
    setImporting(true)
    setError(null)

    try {
      const plan = convertToTrainingPlan(validationResult.validRows, {
        raceName: raceDetails.raceName,
        raceType: raceDetails.raceType,
        raceDate: raceDetails.raceDate,
      })

      // Simulate brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      onPlanGenerated(plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  const progressValue = (currentStep / STEPS.length) * 100

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Import Training Plan from CSV</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressValue)}% complete
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                file && 'border-green-500 bg-green-500/5'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button variant="outline" onClick={handleBrowseClick}>
                    Browse Files
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-sm">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download our CSV template to get started
                </p>
              </div>
              <CSVTemplateDownload />
            </div>

            {/* Validation summary */}
            {validationResult && (
              <div
                className={cn(
                  'rounded-lg p-4',
                  validationResult.valid
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                )}
              >
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {validationResult.valid
                        ? `${validationResult.validRows.length} workouts ready to import`
                        : `${validationResult.validRows.length} valid, ${validationResult.invalidRows.length} with errors`}
                    </p>
                    {validationResult.errorSummary.length > 0 && (
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        {validationResult.errorSummary.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CSV format help */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Required columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code className="text-xs bg-muted px-1 rounded">date</code> - YYYY-MM-DD
                  or MM/DD/YYYY
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 rounded">type</code> -{' '}
                  {VALID_WORKOUT_TYPES.join(', ')}
                </li>
              </ul>
              <p className="font-medium mt-3 mb-2">Optional columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code className="text-xs bg-muted px-1 rounded">title</code>,{' '}
                  <code className="text-xs bg-muted px-1 rounded">description</code>,{' '}
                  <code className="text-xs bg-muted px-1 rounded">distance</code> (km),{' '}
                  <code className="text-xs bg-muted px-1 rounded">duration</code> (min),{' '}
                  <code className="text-xs bg-muted px-1 rounded">pace</code> (e.g.,
                  5:30/km)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Race Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                Tell us about your target race. This helps organize your training plan
                into phases.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raceName">Race Name *</Label>
              <Input
                id="raceName"
                placeholder="e.g., Boston Marathon 2026"
                value={raceDetails.raceName}
                onChange={(e) => updateRaceDetails('raceName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raceType">Race Type *</Label>
              <Select
                value={raceDetails.raceType}
                onValueChange={(value) => updateRaceDetails('raceType', value)}
              >
                <SelectTrigger id="raceType" className="w-full">
                  <SelectValue placeholder="Select race distance" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RACE_TYPES).map(([key, race]) => (
                    <SelectItem key={key} value={key}>
                      {race.name} ({race.distance} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Race Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !raceDetails.raceDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {raceDetails.raceDate ? (
                      format(raceDetails.raceDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={raceDetails.raceDate}
                    onSelect={(date) => updateRaceDetails('raceDate', date)}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && validationResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {validationResult.validRows.length} workouts to import
              </p>
              {validationResult.invalidRows.length > 0 && (
                <Badge variant="outline\" className="text-yellow-600 border-yellow-600">
                  {validationResult.invalidRows.length} errors
                </Badge>
              )}
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[80px]">Distance</TableHead>
                    <TableHead className="w-[80px]">Duration</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Show valid rows */}
                  {validationResult.validRows.map((row, index) => {
                    const workoutType = WORKOUT_TYPES[row.type]
                    return (
                      <TableRow key={`valid-${index}`}>
                        <TableCell className="font-mono text-sm">
                          {row.date}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn('h-2 w-2 rounded-full', workoutType?.color)}
                            />
                            <span className="capitalize text-sm">{row.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.title || workoutType?.name || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.distance ? `${row.distance} km` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.duration ? `${row.duration} min` : '-'}
                        </TableCell>
                        <TableCell>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Show invalid rows */}
                  {validationResult.invalidRows.map((row, index) => (
                    <TableRow
                      key={`invalid-${index}`}
                      className="bg-red-500/5"
                    >
                      <TableCell className="font-mono text-sm">
                        {row.date || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm text-red-500">
                          {row.type || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{row.title || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {row.distance ? `${row.distance} km` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.duration ? `${row.duration} min` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-500">
                            Row {row._rowNumber}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {validationResult.invalidRows.length > 0 && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm font-medium text-red-600 mb-2">
                  Please fix the following errors in your CSV:
                </p>
                <ul className="text-sm text-red-600/80 space-y-1">
                  {validationResult.invalidRows.slice(0, 5).map((row, i) => (
                    <li key={i}>
                      Row {row._rowNumber}: {row._errors?.join('; ')}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Go back to Step 1 to upload a corrected file.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Import Summary</h3>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race</span>
                  <span className="font-medium">{raceDetails.raceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race Type</span>
                  <span className="font-medium">
                    {RACE_TYPES[raceDetails.raceType]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race Date</span>
                  <span className="font-medium">
                    {raceDetails.raceDate ? format(raceDetails.raceDate, 'PPP') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Workouts</span>
                  <span className="font-medium">
                    {validationResult?.validRows.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source File</span>
                  <span className="font-medium">{file?.name}</span>
                </div>
              </div>
            </div>

            {/* Workout type breakdown */}
            {validationResult && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium text-sm mb-3">Workout Breakdown</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    validationResult.validRows.reduce((acc, row) => {
                      acc[row.type] = (acc[row.type] || 0) + 1
                      return acc
                    }, {})
                  ).map(([type, count]) => {
                    const workoutType = WORKOUT_TYPES[type]
                    return (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className={cn('h-2 w-2 rounded-full', workoutType?.color)}
                        />
                        <span className="capitalize">{type}</span>
                        <span className="text-muted-foreground">({count})</span>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Error display */}
        {error && currentStep === 1 && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={importing}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onCancel} disabled={importing}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleImport}
                disabled={importing || !canProceed()}
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Plan'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CSVUploadWizard
