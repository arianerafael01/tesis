"use server"

import { signOut } from "@/lib/auth"
import { headers } from "next/headers"

export async function logout() {
  const headersList = await headers()
  const locale = headersList.get('dashcode-locale') || 'es'
  await signOut({ redirectTo: `/${locale}` })
}
