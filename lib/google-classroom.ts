import { google } from 'googleapis'

export function getGoogleAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  return oauth2Client
}

export function getClassroomClient(accessToken: string) {
  const oauth2Client = getGoogleAuthClient()
  oauth2Client.setCredentials({ access_token: accessToken })

  return google.classroom({ version: 'v1', auth: oauth2Client })
}

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]
