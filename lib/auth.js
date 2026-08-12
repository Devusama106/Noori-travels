import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "./db";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        const user = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(email);
        if (!user) return null;
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return null;

        if (user.status === "PENDING") {
          throw new Error("Your registration is still awaiting admin approval. You'll be able to sign in once it's approved.");
        }
        if (user.status === "REJECTED") {
          throw new Error("Your registration request was not approved. Please contact the admin for details.");
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
          bookingLimit: user.bookingLimit,
          accountLocked: !!user.accountLocked,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.walletBalance = user.walletBalance;
        token.bookingLimit = user.bookingLimit;
        token.accountLocked = user.accountLocked;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.walletBalance = token.walletBalance;
        session.user.bookingLimit = token.bookingLimit;
        session.user.accountLocked = token.accountLocked;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "noori-travels-dev-secret-change-me",
};
