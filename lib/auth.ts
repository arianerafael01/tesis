import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import * as bcrypt from "bcryptjs";

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

          // Check if user has a password set
          if (!user.password) {
            console.log("User has no password set:", credentials.email);
            return null;
          }

          // Validate password using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            console.log("Invalid password for:", credentials.email);
            return null;
          }

          console.log("Login successful for:", credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            teacherId: user.teacherId,
          };
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
