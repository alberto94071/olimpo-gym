import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      gymId: string | null;
      dbId: string;
    } & DefaultSession["user"];
  }
}
