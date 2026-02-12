import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export interface DetectedSchedule {
  day: string
  timeSlots: string[]
  establishment: string
  confidence: number
}

/**
 * Process image with OCR to extract text
 */
export async function processImageWithOCR(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageData, 'spa', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100))
        }
      },
    })

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Error al procesar la imagen con OCR')
  }
}

/**
 * Parse OCR text to extract schedule information from DDJJ format
 */
export function parseScheduleFromOCR(ocrText: string): DetectedSchedule[] {
  const schedules: DetectedSchedule[] = []
  const lines = ocrText.split('\n').filter(line => line.trim())

  console.log('Parsing OCR text, total lines:', lines.length)

  // Days mapping (Spanish) - column headers in DDJJ
  const dayMap: Record<string, string> = {
    'lunes': 'M',
    'martes': 'T',
    'miercoles': 'W',
    'miércoles': 'W',
    'mierc': 'W', // OCR might truncate
    'jueves': 'TH',
    'viernes': 'F',
    'sabado': 'F', // Treat Saturday as Friday for now
    'sábado': 'F',
  }

  let currentEstablishment = ''
  let headerLineIndex = -1
  let dayColumns: Array<{ day: string; startCol: number }> = []
  
  // First pass: find header row with day names
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    // Detect establishment names
    if (lowerLine.includes('cenma') || lowerLine.includes('d g e j') || 
        lowerLine.includes('escuela') || lowerLine.includes('colegio') || 
        lowerLine.includes('instituto') || lowerLine.includes('establecimiento')) {
      currentEstablishment = line.trim()
      console.log('Found establishment:', currentEstablishment)
      continue
    }

    // Check if this is the header row with day names
    const daysFound = Object.keys(dayMap).filter(day => lowerLine.includes(day))
    if (daysFound.length >= 3) {
      headerLineIndex = i
      console.log('Found header row at line', i, ':', line)
      
      // Try to determine column positions for each day
      for (const [dayName, dayCode] of Object.entries(dayMap)) {
        const index = lowerLine.indexOf(dayName)
        if (index !== -1) {
          dayColumns.push({ day: dayCode, startCol: index })
        }
      }
      dayColumns.sort((a, b) => a.startCol - b.startCol)
      console.log('Day columns detected:', dayColumns)
      break
    }
  }

  // Second pass: extract time ranges from data rows
  const startLine = headerLineIndex > 0 ? headerLineIndex + 1 : 0
  const allTimeRanges: Array<{ start: string; end: string }> = []
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip header and footer/notes
    if (line.toLowerCase().includes('indicar') || 
        line.toLowerCase().includes('consignar') ||
        line.toLowerCase().includes('nota:') ||
        line.toLowerCase().includes('lugar y fecha') ||
        line.toLowerCase().includes('repartición') ||
        line.toLowerCase().includes('horario de prestación')) {
      continue
    }

    // Detect all time ranges in this line
    const timeRanges = detectTimeRanges(line)
    
    if (timeRanges.length > 0) {
      console.log(`Line ${i}: Found ${timeRanges.length} time ranges:`, timeRanges)
      allTimeRanges.push(...timeRanges)
      
      // If we have day columns, try to associate
      if (dayColumns.length > 0) {
        for (const range of timeRanges) {
          const rangeText = `${range.start}-${range.end}`
          const rangePos = line.indexOf(rangeText) || line.indexOf(range.start)
          
          let assignedDay: string | null = null
          for (let j = 0; j < dayColumns.length; j++) {
            const currentCol = dayColumns[j]
            const nextCol = dayColumns[j + 1]
            
            if (nextCol) {
              if (rangePos >= currentCol.startCol && rangePos < nextCol.startCol) {
                assignedDay = currentCol.day
                break
              }
            } else {
              if (rangePos >= currentCol.startCol) {
                assignedDay = currentCol.day
                break
              }
            }
          }
          
          if (assignedDay) {
            console.log(`  Assigned ${rangeText} to day ${assignedDay}`)
            schedules.push({
              day: assignedDay,
              timeSlots: [range.start, range.end],
              establishment: currentEstablishment,
              confidence: 0.8,
            })
          }
        }
      }
    }
  }

  // If we couldn't determine days from columns, assign all ranges to all weekdays
  // This is a fallback when OCR doesn't detect the table structure properly
  if (schedules.length === 0 && allTimeRanges.length > 0) {
    console.log('No day columns detected, assigning all time ranges to all weekdays')
    const weekdays: Array<'M' | 'T' | 'W' | 'TH' | 'F'> = ['M', 'T', 'W', 'TH', 'F']
    
    for (const range of allTimeRanges) {
      for (const day of weekdays) {
        schedules.push({
          day,
          timeSlots: [range.start, range.end],
          establishment: currentEstablishment,
          confidence: 0.5, // Lower confidence since we're guessing
        })
      }
    }
    console.log(`Assigned ${allTimeRanges.length} time ranges to all ${weekdays.length} weekdays`)
  }

  console.log('Total schedules parsed:', schedules.length)
  return schedules
}

/**
 * Guess which day a time entry belongs to based on context
 */
function guessDayFromContext(line: string, allLines: string[], lineIndex: number): string | null {
  const lowerLine = line.toLowerCase()
  
  // Check if line contains day name
  if (lowerLine.includes('lunes')) return 'M'
  if (lowerLine.includes('martes')) return 'T'
  if (lowerLine.includes('mierc') || lowerLine.includes('miércoles')) return 'W'
  if (lowerLine.includes('jueves')) return 'TH'
  if (lowerLine.includes('viernes')) return 'F'
  
  // Look at previous lines for day headers
  for (let i = Math.max(0, lineIndex - 5); i < lineIndex; i++) {
    const prevLine = allLines[i].toLowerCase()
    if (prevLine.includes('lunes')) return 'M'
    if (prevLine.includes('martes')) return 'T'
    if (prevLine.includes('mierc') || prevLine.includes('miércoles')) return 'W'
    if (prevLine.includes('jueves')) return 'TH'
    if (prevLine.includes('viernes')) return 'F'
  }
  
  return null
}

/**
 * Map detected schedules to incompatibility time slots
 */
export function mapSchedulesToIncompatibilities(
  schedules: DetectedSchedule[]
): Array<{ day: string; timeRange: string }> {
  const incompatibilities: Array<{ day: string; timeRange: string }> = []

  for (const schedule of schedules) {
    // If we have exactly 2 time slots, treat as a range
    if (schedule.timeSlots.length === 2) {
      const [start, end] = schedule.timeSlots
      const modules = expandTimeRangeToModules(start, end)
      
      for (const module of modules) {
        incompatibilities.push({
          day: schedule.day,
          timeRange: module,
        })
      }
    } else {
      // Try to map individual times
      const timeSlotMap: Record<string, string> = {
        '7:30': 'Módulo 1 (7:30-8:10)',
        '8:10': 'Módulo 2 (8:10-8:50)',
        '9:00': 'Módulo 3 (9:00-9:40)',
        '9:40': 'Módulo 4 (9:40-10:20)',
        '10:30': 'Módulo 5 (10:30-11:10)',
        '11:10': 'Módulo 6 (11:10-11:50)',
        '12:00': 'Módulo 7 (12:00-12:40)',
        '12:40': 'Módulo 8 (12:40-13:20)',
        '13:20': 'Módulo 3 (13:20-14:10)',
        '14:10': 'Módulo 4 (14:10-14:50)',
        '15:00': 'Módulo 5 (15:00-15:40)',
        '15:40': 'Módulo 6 (15:40-16:20)',
        '16:30': 'Módulo 7 (16:30-17:10)',
        '17:10': 'Módulo 8 (17:10-17:50)',
        '18:00': 'Módulo 9 (18:00-18:40)',
        '18:40': 'Módulo 10 (18:40-19:20)',
        '19:30': 'Módulo 11 (19:30-20:10)',
      }

      for (const timeSlot of schedule.timeSlots) {
        const mappedSlot = timeSlotMap[timeSlot]
        if (mappedSlot) {
          incompatibilities.push({
            day: schedule.day,
            timeRange: mappedSlot,
          })
        }
      }
    }
  }

  // Remove duplicates
  const unique = incompatibilities.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.day === item.day && t.timeRange === item.timeRange)
  )

  return unique
}

/**
 * Detect time ranges from text (e.g., "18:15-19:15" or "08:00-09:00" or "1815-1915")
 */
export function detectTimeRanges(text: string): Array<{ start: string; end: string }> {
  const ranges: Array<{ start: string; end: string }> = []
  
  // Pattern variations found in DDJJ:
  // "18:15-19:15", "08:00-09:00", "18.15-19.15", "1815-1915" (no colon)
  const patterns = [
    /(\d{1,2})[:\.](\d{2})\s*[-–]\s*(\d{1,2})[:\.](\d{2})/g,  // HH:MM-HH:MM or HH.MM-HH.MM
    /(\d{1,2})[:\.](\d{2})\s+a\s+(\d{1,2})[:\.](\d{2})/g,     // HH:MM a HH:MM
    /(\d{2})(\d{2})\s*[-–]\s*(\d{2})(\d{2})/g,                // HHMM-HHMM (no colon)
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const start = `${match[1]}:${match[2]}`
      const end = `${match[3]}:${match[4]}`
      
      // Validate times (hours 0-23, minutes 0-59)
      const startHour = parseInt(match[1])
      const startMin = parseInt(match[2])
      const endHour = parseInt(match[3])
      const endMin = parseInt(match[4])
      
      if (startHour >= 0 && startHour <= 23 && startMin >= 0 && startMin <= 59 &&
          endHour >= 0 && endHour <= 23 && endMin >= 0 && endMin <= 59) {
        ranges.push({ start, end })
      }
    }
  }
  
  return ranges
}

/**
 * Expand time range to individual module slots
 * Example: "18:15-19:15" should include modules that overlap with this range
 */
export function expandTimeRangeToModules(
  start: string,
  end: string
): string[] {
  const modules: string[] = []
  
  const allModules = [
    'Módulo 1 (7:30-8:10)',
    'Módulo 2 (8:10-8:50)',
    'Módulo 3 (9:00-9:40)',
    'Módulo 4 (9:40-10:20)',
    'Módulo 5 (10:30-11:10)',
    'Módulo 6 (11:10-11:50)',
    'Módulo 7 (12:00-12:40)',
    'Módulo 8 (12:40-13:20)',
    'Módulo 3 (13:20-14:10)',
    'Módulo 4 (14:10-14:50)',
    'Módulo 5 (15:00-15:40)',
    'Módulo 6 (15:40-16:20)',
    'Módulo 7 (16:30-17:10)',
    'Módulo 8 (17:10-17:50)',
    'Módulo 9 (18:00-18:40)',
    'Módulo 10 (18:40-19:20)',
    'Módulo 11 (19:30-20:10)',
  ]
  
  const startTime = timeToMinutes(start)
  const endTime = timeToMinutes(end)
  
  for (const module of allModules) {
    const match = module.match(/\((\d{1,2}:\d{2})-(\d{1,2}:\d{2})\)/)
    if (match) {
      const moduleStart = timeToMinutes(match[1])
      const moduleEnd = timeToMinutes(match[2])
      
      // Check if module overlaps with the range (any overlap counts)
      // Module overlaps if: moduleStart < endTime AND moduleEnd > startTime
      if (moduleStart < endTime && moduleEnd > startTime) {
        modules.push(module)
      }
    }
  }
  
  return modules
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
