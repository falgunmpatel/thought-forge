import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            email: credentials.identifier,
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("User is not verified");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password || ""
          );
          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return user;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user && profile) {
        await dbConnect();
        let userDoc;
        try {
          const existingUser = await UserModel.findOne({
            email: profile.email,
          });

          if (!existingUser) {
            const newUser = await UserModel.create({
              email: profile.email,
              username: profile.name,
              isVerified: true,
              isAcceptingMessages: true,
              verifyCode: "12345",
              verifyCodeExpiry: new Date(),
              password: bcrypt.hashSync((Math.random() * 18).toString(), 10),
              messages: [],
            });

            if (!newUser) {
              throw new Error("Failed to create user");
            }
            userDoc = newUser;
          } else {
            userDoc = existingUser;
          }
        } catch (error: any) {
          console.log(error);
          throw new Error(error);
        }

        // IMPORTANT: Pass the user document to the JWT callback
        user._id = userDoc._id?.toString();
        user.isVerified = userDoc.isVerified;
        user.isAcceptingMessages = userDoc.isAcceptingMessage;
        user.username = userDoc.username;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id?.toString();
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username || token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
