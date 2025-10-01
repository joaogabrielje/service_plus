
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarCNPJ } from "@/utils/validateCnpj";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany();
    return NextResponse.json(orgs, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const cnpj = formData.get("cnpj") as string;
    const ie = formData.get("ie") as string;
    const cep = formData.get("cep") as string;
    const address = formData.get("address") as string;
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const number = formData.get("number") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const primaryColor = formData.get("primaryColor") as string;
    const secondaryColor = formData.get("secondaryColor") as string;
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : "";
    console.log('[ORG POST] Dados recebidos:', {
      name, cnpj, ie, cep, address, state, city, number, email, phone, primaryColor, secondaryColor
    });
    // logoUrl removido temporariamente
    let logoUrl = "";

    // Validação do CNPJ
    if (!validarCNPJ(cnpj)) {
      console.log('[ORG POST] CNPJ inválido:', cnpj);
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
    }

    // Verificação de duplicidade
    const exists = await prisma.organization.findUnique({ where: { cnpj } });
    if (exists) {
      console.log('[ORG POST] CNPJ já cadastrado:', cnpj);
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 400 });
    }

    // Criação da empresa
    let org = null;
    try {
      org = await prisma.organization.create({
        data: {
          name,
          cnpj,
          ie,
          cep,
          address,
          state,
          city,
          number,
          email,
          phone,
          primaryColor,
          secondaryColor,
          logoUrl,
          slug,
        },
      });
      console.log('[ORG POST] Organização criada:', org);
    } catch (err) {
      console.log('[ORG POST] Erro ao criar organização:', err);
      return NextResponse.json({ error: "Erro ao criar organização" }, { status: 500 });
    }

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
