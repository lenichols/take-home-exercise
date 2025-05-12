import type { JWT } from 'next-auth/jwt';
import { getUserFromDb } from '@/actions/user.actions';
import { db } from '@/lib/db';
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
} from '@/lib/schema';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    accountsTable,
    usersTable,
    sessionsTable,
    verificationTokensTable,
  } as any),

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await getUserFromDb(credentials?.email as string, credentials?.password as string);

        if (user.success && user.data) {
          return {
            id: user.data.id,
            name: user.data.name,
            fname: user.data.fname,
            lname: user.data.lname,
            email: user.data.email,
            role: user.data.role,
            company: user.data.company,
            companyName: user.data.companyName,
            image: user.data.image,
          };
        }
        return null;
      },
    }),
  ],
  debug: true,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
        token.companyName = user.companyName;
        token.fname = user.fname;
        token.lname = user.lname;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.company = token.company;
        session.user.fname = token.fname;
        session.user.lname = token.lname;
        session.user.companyName = token.companyName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
});
