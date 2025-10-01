import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import { Resend } from "resend";

// Função para enviar o e-mail de redefinição
async function sendResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "noreply@serviceplus.com",
      to: email,
      subject: "Redefinição de senha",
      html: `<p>Olá,</p><p>Para redefinir sua senha, clique no link abaixo:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se não solicitou, ignore este e-mail.</p>`
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição:", error);
    throw new Error("Erro ao enviar e-mail de redefinição");
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail é obrigatório." }), { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Não revela se o e-mail existe
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    // Gera token seguro
    const token = randomBytes(32).toString("hex");
    const expires = addMinutes(new Date(), 30); // 30 minutos de validade
    // Remove tokens antigos
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    // Salva novo token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    await sendResetEmail(email, token);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erro ao solicitar redefinição de senha." }), { status: 500 });
  }
}
