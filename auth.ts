import NextAuth from "next-auth"
import Cognito from "next-auth/providers/cognito";

export const {auth, handlers, signIn, signOut} = NextAuth({
  providers: [
    Cognito({
        id: "cognito",
        checks: ['state', 'nonce'],
        authorization: {
          params: {
            scope: "openid email profile",
          }
        },
      },
    ),
    Cognito({
      id: "google",
      checks: ['state', 'nonce'],
      authorization: {
        params: {
          identity_provider: "Google",
          scope: "openid email profile",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {

      if (account) {
        token.id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      
      if (typeof token.id === "string") { 
        session.user.id = token.id;
      }
      return session;
    },
  },
})
