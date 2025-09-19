import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Nur diese Email-Adresse darf sich einloggen
      const allowedEmails = [
        'dr.k@doctorktherapy.com',
      ]

      if (allowedEmails.includes(user.email || '')) {
        console.log(`✅ Admin login successful: ${user.email}`)
        return true
      }

      console.log(`❌ Admin login denied: ${user.email}`)
      return false
    },
    async session({ session, token }) {
      // Session erweitern falls nötig
      return session
    },
  },
  pages: {
    signIn: '/admin/signin', // Custom Sign-in page falls gewünscht
    error: '/admin/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }