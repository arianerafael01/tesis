import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthClient } from '@/lib/google-classroom'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/institutional/teachers?error=${error}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/institutional/teachers?error=no_code', request.url)
    )
  }

  try {
    const oauth2Client = getGoogleAuthClient()
    const { tokens } = await oauth2Client.getToken(code)

    const cookieStore = await cookies()
    cookieStore.set('google_access_token', tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    })

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    return NextResponse.redirect(
      new URL('/institutional/teachers?google_connected=true', request.url)
    )
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.redirect(
      new URL('/institutional/teachers?error=auth_failed', request.url)
    )
  }
}
