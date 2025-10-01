import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("[API][users/link] session:", JSON.stringify(session));
  if (!session) {
    console.log("[API][users/link] Falha: sessão ausente");
    return NextResponse.json({ error: "Acesso negado. Sem sessão." }, { status: 403 });
  }
  const orgId = (session.user as any)?.orgId;
  if (!orgId) {
    console.log("[API][users/link] Falha: orgId ausente na sessão", session.user);
    return NextResponse.json({ error: "Acesso negado. Sem empresa vinculada." }, { status: 403 });
  }
  const { email, password } = await req.json();
  console.log("[API][users/link] Dados recebidos:", { email, password, orgId });
  if (!email || !password) {
    console.log("[API][users/link] Falha: email ou senha ausentes");
    return NextResponse.json({ error: "Email e senha obrigatórios." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("[API][users/link] Falha: usuário não encontrado", email);
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  try {
    await prisma.membership.create({
      data: {
        userId: user.id,
        orgId,
        role: "EXTERNAL",
        status: "ACTIVE"
      }
    });
    console.log("[API][users/link] Vínculo criado com sucesso", { userId: user.id, orgId });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API][users/link] Erro ao criar vínculo:", e);
    return NextResponse.json({ error: "Erro ao criar vínculo." }, { status: 500 });
  }
}
