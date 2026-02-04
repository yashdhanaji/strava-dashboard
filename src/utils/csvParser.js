/**
 * CSV Parser and Validator for Training Plan Import
 */

// Valid workout types that match the existing system
export const VALID_WORKOUT_TYPES = [
  'easy',
  'long',
  'tempo',
  'intervals',
  'threshold',
  'strides',
  'hills',
  'recovery',
  'rest',
  'race',
]

// Required columns
const REQUIRED_COLUMNS = ['date', 'type']

// Optional columns
const OPTIONAL_COLUMNS = ['title', 'description', 'distance', 'duration', 'pace']

/**
 * Parse CSV text into rows of objects
 * @param {string} text - Raw CSV text
 * @returns {{ headers: string[], rows: object[], errors: string[] }}
 */
export const parseCSV = (text) => {
  const errors = []
  const lines = text.trim().split(/\r?\n/)

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one data row')
    return { headers: [], rows: [], errors }
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())

  // Validate required columns
  for (const required of REQUIRED_COLUMNS) {
    if (!headers.includes(required)) {
      errors.push(`Missing required column: "${required}"`)
    }
  }

  if (errors.length > 0) {
    return { headers, rows: [], errors }
  }

  // Parse data rows
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const values = parseCSVLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ''
    })

    row._rowNumber = i + 1 // 1-indexed for user display
    rows.push(row)
  }

  return { headers, rows, errors }
}

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - Single CSV line
 * @returns {string[]}
 */
const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quotes
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

/**
 * Validate a single workout row
 * @param {object} row - Parsed row object
 * @returns {{ valid: boolean, errors: string[], normalizedRow: object }}
 */
export const validateWorkoutRow = (row) => {
  const errors = []
  const normalizedRow = { ...row }

  // Validate date
  const dateResult = parseDate(row.date)
  if (!dateResult.valid) {
    errors.push(`Invalid date format: "${row.date}". Use YYYY-MM-DD or MM/DD/YYYY`)
  } else {
    normalizedRow.date = dateResult.date
  }

  // Validate workout type
  const type = row.type?.toLowerCase()?.trim()
  if (!type) {
    errors.push('Missing workout type')
  } else if (!VALID_WORKOUT_TYPES.includes(type)) {
    errors.push(`Invalid workout type: "${row.type}". Valid types: ${VALID_WORKOUT_TYPES.join(', ')}`)
  } else {
    normalizedRow.type = type
  }

  // Validate distance (optional but must be number if provided)
  if (row.distance && row.distance !== '') {
    const distance = parseFloat(row.distance)
    if (isNaN(distance) || distance < 0) {
      errors.push(`Invalid distance: "${row.distance}". Must be a positive number (km)`)
    } else {
      normalizedRow.distance = distance
    }
  } else {
    normalizedRow.distance = 0
  }

  // Validate duration (optional but must be number if provided)
  if (row.duration && row.duration !== '') {
    const duration = parseFloat(row.duration)
    if (isNaN(duration) || duration < 0) {
      errors.push(`Invalid duration: "${row.duration}". Must be a positive number (minutes)`)
    } else {
      normalizedRow.duration = duration
    }
  } else {
    normalizedRow.duration = 0
  }

  // Validate pace format (optional, format: mm:ss/km)
  if (row.pace && row.pace !== '') {
    const paceRegex = /^\d{1,2}:\d{2}\/km$/
    if (!paceRegex.test(row.pace.trim())) {
      // Allow it anyway but warn - pace format is flexible
      normalizedRow.pace = row.pace.trim()
    } else {
      normalizedRow.pace = row.pace.trim()
    }
  } else {
    normalizedRow.pace = ''
  }

  // Normalize title and description
  normalizedRow.title = row.title || ''
  normalizedRow.description = row.description || ''

  return {
    valid: errors.length === 0,
    errors,
    normalizedRow,
  }
}

/**
 * Parse date from various formats
 * @param {string} dateStr - Date string
 * @returns {{ valid: boolean, date: string }}
 */
const parseDate = (dateStr) => {
  if (!dateStr) {
    return { valid: false, date: '' }
  }

  const trimmed = dateStr.trim()

  // Try YYYY-MM-DD format
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return { valid: true, date: trimmed }
    }
  }

  // Try MM/DD/YYYY format
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const [, month, day, year] = usMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      return { valid: true, date: isoDate }
    }
  }

  return { valid: false, date: '' }
}

/**
 * Validate entire CSV dataset
 * @param {object[]} rows - Array of parsed rows
 * @returns {{ valid: boolean, validRows: object[], invalidRows: object[], errorSummary: string[] }}
 */
export const validateCSV = (rows) => {
  const validRows = []
  const invalidRows = []
  const errorSummary = []
  const dateSet = new Set()

  for (const row of rows) {
    const result = validateWorkoutRow(row)

    if (result.valid) {
      // Check for duplicate dates
      if (dateSet.has(result.normalizedRow.date)) {
        result.errors.push(`Duplicate date: ${result.normalizedRow.date}`)
        invalidRows.push({
          ...result.normalizedRow,
          _errors: result.errors,
          _rowNumber: row._rowNumber,
        })
      } else {
        dateSet.add(result.normalizedRow.date)
        validRows.push(result.normalizedRow)
      }
    } else {
      invalidRows.push({
        ...result.normalizedRow,
        _errors: result.errors,
        _rowNumber: row._rowNumber,
      })
    }
  }

  // Generate error summary
  if (invalidRows.length > 0) {
    errorSummary.push(`${invalidRows.length} row(s) have validation errors`)
    for (const row of invalidRows.slice(0, 5)) {
      errorSummary.push(`Row ${row._rowNumber}: ${row._errors.join('; ')}`)
    }
    if (invalidRows.length > 5) {
      errorSummary.push(`... and ${invalidRows.length - 5} more errors`)
    }
  }

  return {
    valid: invalidRows.length === 0,
    validRows,
    invalidRows,
    errorSummary,
  }
}

/**
 * Generate a CSV template string
 * @returns {string}
 */
export const generateCSVTemplate = () => {
  const headers = ['date', 'type', 'title', 'description', 'distance', 'duration', 'pace']
  const sampleRows = [
    ['2026-02-10', 'easy', 'Easy Run', 'Conversational pace', '8', '52', '6:30/km'],
    ['2026-02-11', 'rest', 'Rest Day', '', '0', '0', ''],
    ['2026-02-12', 'tempo', 'Tempo Run', '20min at threshold', '10', '50', '5:00/km'],
    ['2026-02-13', 'long', 'Long Run', 'Progressive effort', '18', '120', '6:00/km'],
    ['2026-02-14', 'rest', 'Rest Day', '', '0', '0', ''],
    ['2026-02-15', 'intervals', 'Speed Work', '6x800m repeats', '8', '45', '4:30/km'],
    ['2026-02-16', 'recovery', 'Recovery Run', 'Very easy jog', '5', '35', '7:00/km'],
  ]

  return [
    headers.join(','),
    ...sampleRows.map((row) => row.map(escapeCSVValue).join(',')),
  ].join('\n')
}

/**
 * Escape a value for CSV output
 * @param {string} value
 * @returns {string}
 */
const escapeCSVValue = (value) => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
