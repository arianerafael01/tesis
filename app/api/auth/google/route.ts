import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthClient, GOOGLE_SCOPES } from '@/lib/google-classroom'

export async function GET(request: NextRequest) {
  const oauth2Client = getGoogleAuthClient()

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    prompt: 'consent',
  })

  return NextResponse.redirect(authUrl)
}
