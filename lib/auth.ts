import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Google,
    GitHub,
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Check if user exists in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // For now, only admin user with hardcoded password
          // TODO: Implement proper password hashing for all users
          if (credentials.email === "admin@instituto-etchegoyen.edu.ar" && 
              credentials.password === "institucion123") {
            console.log("Admin login successful");
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
              teacherId: user.teacherId,
            };
          }

          console.log("Invalid password for:", credentials.email);
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user data in token when user first logs in
        token.id = user.id;
        token.role = user.role;
        token.teacherId = user.teacherId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Pass data from token to session
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "TEACHER";
        session.user.teacherId = token.teacherId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/es/auth/login",
  },
});
