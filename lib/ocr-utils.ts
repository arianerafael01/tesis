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

export interface TeacherDataFromDDJJ {
  dni: string | null
  fullName: string | null
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
  
  // First pass: find establishment and header row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    // Detect establishment names - improved patterns
    if (lowerLine.includes('repartición') || 
        lowerLine.includes('establecimiento') ||
        lowerLine.includes('instituto') ||
        lowerLine.includes('oficina')) {
      // Look for establishment name in next few lines or same line
      const establishmentPatterns = [
        /(?:cenma|d\s*g\s*e\s*j\s*y?\s*a|escuela|colegio|instituto)[^:]*(?:n°?\s*\d+)?[^:]*(?:anexo)?[^:]*/i,
        /establecimiento[,\s:]+([^,\n]+)/i,
      ]
      
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        for (const pattern of establishmentPatterns) {
          const match = lines[j].match(pattern)
          if (match) {
            currentEstablishment = match[0].trim()
            console.log('Found establishment:', currentEstablishment)
            break
          }
        }
        if (currentEstablishment) break
      }
    }

    // Check if this is the header row with day names
    // Look for "HORARIO DE PRESTACIÓN" header first
    if (lowerLine.includes('horario') && lowerLine.includes('prestación')) {
      console.log('Found schedule header at line', i)
      // Day names should be in next 1-2 lines
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const dayLine = lines[j].toLowerCase()
        const daysFound = Object.keys(dayMap).filter(day => dayLine.includes(day))
        
        if (daysFound.length >= 3) {
          headerLineIndex = j
          console.log('Found day names row at line', j, ':', lines[j])
          
          // Determine column positions for each day
          for (const [dayName, dayCode] of Object.entries(dayMap)) {
            const index = dayLine.indexOf(dayName)
            if (index !== -1) {
              dayColumns.push({ day: dayCode, startCol: index })
            }
          }
          dayColumns.sort((a, b) => a.startCol - b.startCol)
          console.log('Day columns detected:', dayColumns)
          break
        }
      }
      if (headerLineIndex !== -1) break
    }
    
    // Fallback: direct day name detection
    if (headerLineIndex === -1) {
      const daysFound = Object.keys(dayMap).filter(day => lowerLine.includes(day))
      if (daysFound.length >= 3) {
        headerLineIndex = i
        console.log('Found header row at line', i, ':', line)
        
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
  }

  // Second pass: extract time ranges from data rows
  const startLine = headerLineIndex > 0 ? headerLineIndex + 1 : 0
  const allTimeRanges: Array<{ start: string; end: string; position: number; line: string }> = []
  
  console.log('=== PARSING SCHEDULE TABLE ===')
  console.log('Starting from line:', startLine)
  console.log('Day columns:', dayColumns)
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()
    
    // Skip header and footer/notes
    if (lowerLine.includes('indicar') || 
        lowerLine.includes('consignar') ||
        lowerLine.includes('nota:') ||
        lowerLine.includes('lugar y fecha') ||
        lowerLine.includes('firma') ||
        lowerLine.includes('repartición') ||
        lowerLine.includes('nivel') ||
        lowerLine.includes('cargo') ||
        lowerLine.includes('carácter') ||
        lowerLine.includes('horario de prestación')) {
      continue
    }

    // Detect all time ranges in this line
    const timeRanges = detectTimeRanges(line)
    
    if (timeRanges.length > 0) {
      console.log(`\nLine ${i}:`, line.substring(0, 150))
      console.log(`  Found ${timeRanges.length} time ranges:`, timeRanges.map(r => `${r.start}-${r.end}`).join(', '))
      
      // Store ranges with their positions
      for (const range of timeRanges) {
        const rangePatterns = [
          `${range.start}-${range.end}`,
          `${range.start} - ${range.end}`,
          `${range.start}  ${range.end}`,
          range.start,
        ]
        
        let position = -1
        for (const pattern of rangePatterns) {
          position = line.indexOf(pattern)
          if (position !== -1) break
        }
        
        if (position !== -1) {
          allTimeRanges.push({ ...range, position, line })
        }
      }
      
      // If we have day columns, assign each range to the appropriate day
      if (dayColumns.length > 0) {
        // Group ranges by their position to handle multiple ranges in same column
        const rangesByPosition: Map<number, typeof timeRanges> = new Map()
        
        for (const range of timeRanges) {
          const rangePatterns = [
            `${range.start}-${range.end}`,
            `${range.start} - ${range.end}`,
            range.start,
          ]
          
          let rangePos = -1
          for (const pattern of rangePatterns) {
            rangePos = line.indexOf(pattern)
            if (rangePos !== -1) break
          }
          
          if (rangePos === -1) continue
          
          // Determine which day column this range belongs to
          let assignedDay: string | null = null
          
          // Method 1: Find closest column (within 50 chars)
          let minDistance = Infinity
          for (const col of dayColumns) {
            const distance = Math.abs(rangePos - col.startCol)
            if (distance < 50 && distance < minDistance) {
              minDistance = distance
              assignedDay = col.day
            }
          }
          
          // Method 2: Use column boundaries if no close match
          if (!assignedDay) {
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
          }
          
          if (assignedDay) {
            console.log(`    → ${range.start}-${range.end} assigned to ${assignedDay} (pos: ${rangePos}, col: ${dayColumns.find(c => c.day === assignedDay)?.startCol})`)
            schedules.push({
              day: assignedDay,
              timeSlots: [range.start, range.end],
              establishment: currentEstablishment,
              confidence: 0.8,
            })
          } else {
            console.log(`    ⚠️ ${range.start}-${range.end} could not be assigned to any day (pos: ${rangePos})`)
          }
        }
      }
    }
  }

  // If we couldn't determine days from columns, assign all ranges to all weekdays
  // This is a fallback when OCR doesn't detect the table structure properly
  if (schedules.length === 0 && allTimeRanges.length > 0) {
    console.log('⚠️ No day columns detected, assigning all time ranges to all weekdays')
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

  // Summary of detected schedules
  console.log('\n=== SCHEDULE DETECTION SUMMARY ===')
  console.log('Total schedules detected:', schedules.length)
  
  const schedulesByDay = schedules.reduce((acc, s) => {
    if (!acc[s.day]) acc[s.day] = []
    acc[s.day].push(`${s.timeSlots[0]}-${s.timeSlots[1]}`)
    return acc
  }, {} as Record<string, string[]>)
  
  const dayNames: Record<string, string> = {
    'M': 'Lunes',
    'T': 'Martes', 
    'W': 'Miércoles',
    'TH': 'Jueves',
    'F': 'Viernes'
  }
  
  for (const [day, ranges] of Object.entries(schedulesByDay)) {
    console.log(`${dayNames[day] || day}: ${ranges.length} horarios - ${ranges.join(', ')}`)
  }
  
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
      
      for (const timeModule of modules) {
        incompatibilities.push({
          day: schedule.day,
          timeRange: timeModule,
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
  // Also handle OCR errors: "18 15-19 15", "18-15-19-15"
  const patterns = [
    // Standard formats with colon or dot
    /(\d{1,2})[:\.](\d{2})\s*[-–—]\s*(\d{1,2})[:\.](\d{2})/g,
    // Format with spaces instead of colon (OCR error)
    /(\d{1,2})\s+(\d{2})\s*[-–—]\s*(\d{1,2})\s+(\d{2})/g,
    // Format with "a" or "al" between times
    /(\d{1,2})[:\.](\d{2})\s+a[l]?\s+(\d{1,2})[:\.](\d{2})/g,
    // Compact format without separator (HHMM-HHMM)
    /(\d{2})(\d{2})\s*[-–—]\s*(\d{2})(\d{2})/g,
    // Format with multiple dashes (OCR error: 18-15-19-15)
    /(\d{1,2})[-–](\d{2})[-–](\d{1,2})[-–](\d{2})/g,
  ]
  
  for (const pattern of patterns) {
    let match
    pattern.lastIndex = 0 // Reset regex state
    while ((match = pattern.exec(text)) !== null) {
      let startHour = parseInt(match[1])
      let startMin = parseInt(match[2])
      let endHour = parseInt(match[3])
      let endMin = parseInt(match[4])
      
      // Validate times (hours 0-23, minutes 0-59)
      if (startHour >= 0 && startHour <= 23 && startMin >= 0 && startMin <= 59 &&
          endHour >= 0 && endHour <= 23 && endMin >= 0 && endMin <= 59) {
        
        // Ensure end time is after start time
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin
        
        if (endMinutes > startMinutes) {
          const start = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
          const end = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
          
          // Avoid duplicates
          if (!ranges.some(r => r.start === start && r.end === end)) {
            ranges.push({ start, end })
            console.log('Detected time range:', start, '-', end)
          }
        }
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
  
  for (const timeModule of allModules) {
    const match = timeModule.match(/\((\d{1,2}:\d{2})-(\d{1,2}:\d{2})\)/)
    if (match) {
      const moduleStart = timeToMinutes(match[1])
      const moduleEnd = timeToMinutes(match[2])
      
      // Check if module overlaps with the range (any overlap counts)
      // Module overlaps if: moduleStart < endTime AND moduleEnd > startTime
      if (moduleStart < endTime && moduleEnd > startTime) {
        modules.push(timeModule)
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

/**
 * Extract teacher personal data (DNI and name) from DDJJ OCR text
 */
export function extractTeacherDataFromDDJJ(ocrText: string): TeacherDataFromDDJJ {
  const lines = ocrText.split('\n').filter(line => line.trim())
  
  let dni: string | null = null
  let fullName: string | null = null
  let confidence = 0
  
  // Join all lines to handle multi-line fields
  const fullText = lines.join(' ')
  
  console.log('=== OCR TEXT EXTRACTION DEBUG ===')
  console.log('Total lines:', lines.length)
  console.log('First 500 chars of full text:', fullText.substring(0, 500))
  
  // Extract DNI - multiple patterns to handle OCR variations
  const dniPatterns = [
    // Pattern 1: "D.N.I. (N° y Tipo) 24.992.613" - most specific
    /D\.?\s*N\.?\s*I\.?\s*\(\s*N°?\s*y\s*Tipo\s*\)\s*(\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3})/i,
    // Pattern 2: "DNI (N° y Tipo) 24.992.613"
    /DNI\s*\(\s*N°?\s*y\s*Tipo\s*\)\s*(\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3})/i,
    // Pattern 3: Just "(N° y Tipo) 24.992.613"
    /\(\s*N°?\s*y\s*Tipo\s*\)\s*(\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3})/i,
    // Pattern 4: "DNI: 24.992.613" or "DNI 24.992.613"
    /D\.?\s*N\.?\s*I\.?\s*[:\s]+(\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3})/i,
    // Pattern 5: Just the number after dots (fallback)
    /\.{3,}\s*(\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3})\s*\.{3,}/,
    // Pattern 6: Very permissive - any 7-8 digit number with dots
    /(\d{1,2}[\.\s]\d{3}[\.\s]\d{3})/,
  ]
  
  console.log('Trying to extract DNI with', dniPatterns.length, 'patterns...')
  
  for (let i = 0; i < dniPatterns.length; i++) {
    const pattern = dniPatterns[i]
    const match = fullText.match(pattern)
    console.log(`Pattern ${i + 1}:`, pattern.toString().substring(0, 80), '- Match:', match ? 'YES' : 'NO')
    
    if (match) {
      const rawDni = match[1].replace(/[\.\s]/g, '')
      console.log('  Raw DNI found:', match[1], '-> Cleaned:', rawDni, '-> Length:', rawDni.length)
      
      // Validate DNI length (should be 7-8 digits)
      if (rawDni.length >= 7 && rawDni.length <= 8) {
        dni = rawDni
        confidence += 0.5
        console.log('✅ DNI extracted successfully:', dni)
        break
      } else {
        console.log('  ❌ DNI rejected: invalid length')
      }
    }
  }
  
  if (!dni) {
    console.log('❌ No DNI found with any pattern')
    console.log('Searching for any 8-digit number in text...')
    const anyNumberMatch = fullText.match(/\d{7,8}/g)
    if (anyNumberMatch) {
      console.log('Found numbers:', anyNumberMatch)
    }
  }
  
  // Extract full name - multiple patterns for variations
  const namePatterns = [
    // Pattern 1: "APELLIDO Y NOMBRE: RUFEIL FIORI EDUARDO............"
    /APELLIDO\s+Y\s+NOMBRE:\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+?)(?:\.{3,}|D\.?\s*N\.?\s*I)/i,
    // Pattern 2: More flexible with spacing
    /APELLIDO\s+Y\s+NOMBRE:\s*([A-ZÁÉÍÓÚÑ\s]+?)(?=\s*\.{3,}|\s*D\.?\s*N\.?\s*I)/i,
    // Pattern 3: Just after "NOMBRE:"
    /NOMBRE:\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+?)(?:\.{3,}|D\.?\s*N\.?\s*I)/i,
    // Pattern 4: Very permissive - capture until dots or DNI
    /APELLIDO\s+Y\s+NOMBRE:\s*([A-ZÁÉÍÓÚÑ][^\.]+?)(?:\.{2,})/i,
  ]
  
  console.log('Trying to extract name with', namePatterns.length, 'patterns...')
  
  for (let i = 0; i < namePatterns.length; i++) {
    const pattern = namePatterns[i]
    const match = fullText.match(pattern)
    console.log(`Name Pattern ${i + 1}:`, pattern.toString().substring(0, 80), '- Match:', match ? 'YES' : 'NO')
    
    if (match) {
      // Clean up the name: remove extra dots, trim, normalize spaces
      const rawName = match[1]
      fullName = rawName
        .replace(/\.+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      console.log('  Raw name found:', rawName, '-> Cleaned:', fullName)
      
      // Only accept if it has at least 2 words (first name + last name)
      // and doesn't contain numbers or special chars
      const words = fullName.split(' ').filter(w => w.length > 0)
      const hasNoNumbers = !/\d/.test(fullName)
      
      console.log('  Words:', words.length, '- Has no numbers:', hasNoNumbers, '- Length:', fullName.length)
      
      if (words.length >= 2 && hasNoNumbers && fullName.length >= 5) {
        confidence += 0.5
        console.log('✅ Name extracted successfully:', fullName)
        break
      } else {
        console.log('  ❌ Name rejected: validation failed')
        fullName = null
      }
    }
  }
  
  if (!fullName) {
    console.log('❌ No name found with any pattern')
  }
  
  console.log('=== FINAL EXTRACTION RESULTS ===')
  console.log('DNI:', dni || 'NOT FOUND')
  console.log('Name:', fullName || 'NOT FOUND')
  console.log('Confidence:', confidence)
  
  return {
    dni,
    fullName,
    confidence
  }
}

/**
 * Validate if extracted teacher data matches system data
 */
export function validateTeacherData(
  extracted: TeacherDataFromDDJJ,
  systemTeacher: { dni: string; firstName: string; lastName: string }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate DNI
  if (extracted.dni) {
    const extractedDNI = extracted.dni.replace(/[\.\s]/g, '')
    const systemDNI = systemTeacher.dni.replace(/[\.\s]/g, '')
    
    if (extractedDNI !== systemDNI) {
      errors.push(`El DNI del documento (${extracted.dni}) no coincide con el DNI del sistema (${systemTeacher.dni})`)
    }
  } else {
    errors.push('No se pudo extraer el DNI del documento')
  }
  
  // Validate name (more flexible - check if system name is contained in extracted name)
  if (extracted.fullName) {
    const extractedNameUpper = extracted.fullName.toUpperCase()
    const systemLastNameUpper = systemTeacher.lastName.toUpperCase()
    const systemFirstNameUpper = systemTeacher.firstName.toUpperCase()
    
    // Check if both last name and first name appear in the extracted text
    const hasLastName = extractedNameUpper.includes(systemLastNameUpper)
    const hasFirstName = extractedNameUpper.includes(systemFirstNameUpper)
    
    if (!hasLastName || !hasFirstName) {
      errors.push(`El nombre del documento (${extracted.fullName}) no coincide con el nombre del sistema (${systemTeacher.lastName} ${systemTeacher.firstName})`)
    }
  } else {
    errors.push('No se pudo extraer el nombre del documento')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
