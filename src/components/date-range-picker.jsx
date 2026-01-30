import * as React from "react"
import { format, subDays, subMonths, subYears, startOfYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const presets = [
  {
    label: "Last 7 days",
    getValue: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
    }),
  },
  {
    label: "Last 3 months",
    getValue: () => ({
      start: subMonths(new Date(), 3),
      end: new Date(),
    }),
  },
  {
    label: "Last 6 months",
    getValue: () => ({
      start: subMonths(new Date(), 6),
      end: new Date(),
    }),
  },
  {
    label: "This year",
    getValue: () => ({
      start: startOfYear(new Date()),
      end: new Date(),
    }),
  },
  {
    label: "Last year",
    getValue: () => ({
      start: subYears(new Date(), 1),
      end: new Date(),
    }),
  },
  {
    label: "All time",
    getValue: () => ({
      start: new Date(2000, 0, 1), // Far back enough to get all activities
      end: new Date(),
    }),
  },
]

export function DateRangePicker({ dateRange, onDateRangeChange, className }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState("Last 30 days")

  const handlePresetChange = (presetLabel) => {
    const preset = presets.find((p) => p.label === presetLabel)
    if (preset) {
      setSelectedPreset(presetLabel)
      onDateRangeChange(preset.getValue())
    }
  }

  const handleCalendarSelect = (range) => {
    if (range?.from) {
      onDateRangeChange({
        start: range.from,
        end: range.to || range.from,
      })
      setSelectedPreset("Custom")
    }
  }

  const displayValue = React.useMemo(() => {
    if (!dateRange?.start) return "Select date range"

    const startStr = format(dateRange.start, "MMM d, yyyy")
    const endStr = dateRange.end ? format(dateRange.end, "MMM d, yyyy") : startStr

    return `${startStr} - ${endStr}`
  }, [dateRange])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Preset Select */}
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
          {selectedPreset === "Custom" && (
            <SelectItem value="Custom">Custom</SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Calendar Popover for Custom Range */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal min-w-[240px]",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.start}
            selected={{
              from: dateRange?.start,
              to: dateRange?.end,
            }}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
          />
          <div className="border-t p-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
