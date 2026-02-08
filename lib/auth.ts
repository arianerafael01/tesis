import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, type User } from "./data";



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
                if (!credentials?.email || !credentials?.password) return null;

                const user = getUserByEmail(credentials.email as string);
                if (!user) return null;

                const isMatch = user.password === credentials.password;
                if (!isMatch) return null;

                return user;
            },
        }),
   
  ],
});
