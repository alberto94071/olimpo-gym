import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { systemUsers } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const [user] = await db
            .select()
            .from(systemUsers)
            .where(eq(systemUsers.email, credentials.email as string))
            .limit(1);

          if (!user || !user.active || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (isValid) {
            return { id: user.id, email: user.email, name: user.name };
          }
        } catch (error) {
          console.error("[AUTH] Credentials authorize error:", error);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const [existingUser] = await db
          .select({ id: systemUsers.id, active: systemUsers.active })
          .from(systemUsers)
          .where(eq(systemUsers.email, user.email))
          .limit(1);

        if (!existingUser || !existingUser.active) {
          return false;
        }
        return true;
      } catch (error) {
        console.error("[AUTH] signIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        try {
          const [dbUser] = await db
            .select({
              id: systemUsers.id,
              role: systemUsers.role,
              gymId: systemUsers.gymId,
            })
            .from(systemUsers)
            .where(eq(systemUsers.email, user.email))
            .limit(1);

          if (dbUser) {
            token.role = dbUser.role;
            token.gymId = dbUser.gymId;
            token.dbId = dbUser.id;
          }
        } catch (error) {
          console.error("[AUTH] jwt callback error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.gymId = token.gymId as string | null;
        session.user.dbId = token.dbId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
