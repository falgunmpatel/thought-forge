import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
  CredentialsProvider({
    credentials: {
      email: { label: "Email", type: "email", placeholder: "your email" },
      password: {
        label: "Password",
        type: "password",
        placeholder: "your password",
      },
    },
    authorize: async (credentials: any): Promise<any> => {
      await dbConnect();
      try {
        const { identifier, password } = credentials;
        const user = await UserModel.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
          throw new Error("No user found with this email or username!!");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first!!");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);

        if (!isPasswordValid) {
          throw new Error("Invalid password!!");
        }

        return user;
      } catch (error: any) {
        throw new Error("Invalid credentials");
      }
    },
  }),
];
export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { signIn, signOut, handlers, auth } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          const { id, email } = user;
          const existingUser = await UserModel.findOne({ email });
          let userData;

          if (existingUser) {
            const updatedUser = await UserModel.findOneAndUpdate(
              { email },
              { $set: { googleId: id } },
              { new: true }
            );
            userData = updatedUser;
          }

          if (!profile?.email_verified && !existingUser) {
            return false;
          }

          if (profile?.email_verified && !existingUser) {
            const newUser = await UserModel.create({
              username: email?.split("@")[0],
              email,
              isVerified: true,
              verifyCode: "",
              verifyCodeExpiry: new Date(0),
              isAcceptingMessages: true,
              messages: [],
              googleId: id,
            });

            if (!newUser) {
              throw new Error("Failed to create user!!");
            }

            userData = newUser;
          }

          //updating user
          user._id = userData?._id?.toString();
          user.isVerified = userData?.isVerified;
          user.isAcceptingMessages = userData?.isAcceptingMessage;
          user.username = userData?.username;

          return true;
        } catch (error) {
          console.error("Error signing in with Google: ", error);
          throw new Error("Error signing in with Google!!");
        }
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
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
});
