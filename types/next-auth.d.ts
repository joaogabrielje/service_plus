import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      orgId?: string | null
      role?: string | null
    }
  }
  
  interface JWT {
    id: string
    orgId?: string
    role?: string
    image?: string
  }
}
