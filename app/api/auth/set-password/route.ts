import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), { status: 401 });
    }
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "A senha deve ter pelo menos 6 caracteres." }), { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hash },
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erro ao definir senha." }), { status: 500 });
  }
}
