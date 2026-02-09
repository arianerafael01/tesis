import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "TEACHER"
      teacherId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "ADMIN" | "TEACHER"
    teacherId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "TEACHER"
    teacherId: string | null
  }
}
