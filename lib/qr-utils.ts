import QRCode from 'qrcode'
import crypto from 'crypto'

export interface AttendanceQRData {
  courseId: string
  date: string
  token: string
  expiresAt: number
}

export async function generateAttendanceQR(courseId: string, date: Date): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + (15 * 60 * 1000) // 15 minutes validity
  
  const qrData: AttendanceQRData = {
    courseId,
    date: date.toISOString().split('T')[0],
    token,
    expiresAt,
  }

  const dataString = JSON.stringify(qrData)
  const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  return qrCodeDataUrl
}

export function validateQRToken(qrData: AttendanceQRData): boolean {
  return qrData.expiresAt > Date.now()
}

export function parseQRData(qrString: string): AttendanceQRData | null {
  try {
    const data = JSON.parse(qrString)
    if (data.courseId && data.date && data.token && data.expiresAt) {
      return data as AttendanceQRData
    }
    return null
  } catch {
    return null
  }
}
