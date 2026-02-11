import { NextRequest, NextResponse } from 'next/server'
import { generateAttendanceQR } from '@/lib/qr-utils'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers and administrators can generate QR codes.' },
        { status: 401 }
      )
    }

    const { courseId, date } = await request.json()

    if (!courseId || !date) {
      return NextResponse.json(
        { error: 'courseId and date are required' },
        { status: 400 }
      )
    }

    const qrCodeDataUrl = await generateAttendanceQR(courseId, new Date(date))

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
    })
  } catch (error: any) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: error.message },
      { status: 500 }
    )
  }
}
