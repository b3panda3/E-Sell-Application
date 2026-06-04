import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          esellCode: user.esellCode,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          const newUser = await db.user.create({
            data: {
              email: user.email!,
              name: user.name || "User",
              role: "CUSTOMER",
              image: user.image,
              emailVerified: true,
            },
          });

          await db.trustProfile.create({
            data: {
              userId: newUser.id,
            },
          });

          user.id = newUser.id;
          (user as unknown as Record<string, unknown>).role = newUser.role;
          (user as unknown as Record<string, unknown>).esellCode = newUser.esellCode;
        } else {
          user.id = existingUser.id;
          (user as unknown as Record<string, unknown>).role = existingUser.role;
          (user as unknown as Record<string, unknown>).esellCode = existingUser.esellCode;

          if (account) {
            const existingAccount = await db.account.findFirst({
              where: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            });

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | null,
                },
              });
            }
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.role = (user as unknown as Record<string, unknown>).role as string;
        token.esellCode = (user as unknown as Record<string, unknown>).esellCode as string | null;
        token.image = user.image || (user as unknown as Record<string, unknown>).image as string | null;
      }
      // Handle session update - DON'T store large base64 image in JWT
      // as it can exceed JWT size limits and cause CLIENT_FETCH_ERROR.
      // Only update the name; the image will be fetched from DB on
      // the next session callback invocation.
      if (trigger === 'update' && updateData) {
        if (updateData.name !== undefined) token.name = updateData.name as string;
        // Mark that image was updated so session callback knows to refetch
        if (updateData.imageUpdated) token.imageUpdated = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).esellCode = token.esellCode;
        // If image was updated (profile save), or we have a stored image,
        // fetch fresh from DB to avoid storing large base64 in JWT
        if (token.imageUpdated || !token.image) {
          try {
            const dbUser = await db.user.findUnique({
              where: { id: token.sub! },
              select: { image: true },
            });
            if (dbUser?.image) session.user.image = dbUser.image;
            // Clear the flag so we don't re-fetch every time
            token.imageUpdated = false;
          } catch {
            // Fall back to token image if DB fetch fails
            if (token.image) session.user.image = token.image as string;
          }
        } else if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
