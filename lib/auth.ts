import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

console.log('Configuração NextAuth carregada');

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  console.log('Entrou na função authorize');
  console.log('Valor exato de credentials.email:', JSON.stringify(credentials?.email));
  console.log('Tentando login com:', credentials?.email);
  if (!credentials?.email || !credentials?.password) {
          console.log('Credenciais ausentes:', credentials)
          return null
        }

        console.log('Buscando usuário no banco:', credentials.email);
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        console.log('Credenciais recebidas:', credentials);
        console.log('Resultado da busca do usuário:', user, 'Tipo:', typeof user);

        if (!user) {
          console.log('Usuário não encontrado:', credentials.email)
          return null
        }

        console.log('Usuário encontrado:', user.email, 'Status:', user.status, 'Senha hash:', user.password)
        console.log('Resultado da busca do usuário:', user);
        console.log('Comparando senha:', credentials.password, 'com hash:', user.password);
        if (!user.password) {
          console.log('Usuário não possui senha definida:', user.email)
          return null
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('Resultado da comparação de senha:', isPasswordValid);
        if (!isPasswordValid) {
          console.log('Senha inválida para:', credentials.email, 'Senha digitada:', credentials.password, 'Hash no banco:', user.password)
          return null
        }
        console.log('Login bem-sucedido para:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        // Salva imagem do Google no token (e no banco, se necessário)
        if (user.image) {
          token.image = user.image;
        } else if (profile && (profile as any).picture) {
          const picture = (profile as any).picture as string;
          token.image = picture;
          // Atualiza no banco se não estiver salvo
          await prisma.user.update({
            where: { id: user.id },
            data: { image: picture },
          });
        }
        // Buscar vínculo ativo do usuário
        const membership = await prisma.membership.findFirst({
          where: {
            userId: user.id,
            isDeleted: false,
            status: "ACTIVE"
          }
        });
        console.log('Membership encontrado:', membership);
        if (membership) {
          token.orgId = membership.orgId;
          token.role = membership.role;
          console.log('Token atualizado com role:', membership.role);
        } else {
          token.orgId = undefined;
          token.role = undefined;
          console.log('Nenhum membership encontrado para usuário:', user.id);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).orgId = token.orgId as string | undefined;
        (session.user as any).role = token.role as string | undefined;
        (session.user as any).image = token.image as string | undefined;
        console.log('Session callback - role definida como:', token.role);
      }
      return session;
    },
  },
  pages: {
  signIn: "/auth/login",
  },
}