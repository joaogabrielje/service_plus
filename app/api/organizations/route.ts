
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
    let logoUrl = "";
    const logoFile = formData.get("logo");
    if (logoFile && typeof logoFile === "object" && "arrayBuffer" in logoFile) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split(".").pop();
      const fileName = `${slug}-${Date.now()}.${ext}`;
      const fs = require("fs");
      const path = require("path");
      const logosDir = path.join(process.cwd(), "public", "logos");
      if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir);
      const filePath = path.join(logosDir, fileName);
      fs.writeFileSync(filePath, buffer);
      logoUrl = `/logos/${fileName}`;
    }

    // Validação do CNPJ
    if (!validarCNPJ(cnpj)) {
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
    }

    // Verificação de duplicidade
    const exists = await prisma.organization.findUnique({ where: { cnpj } });
    if (exists) {
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 400 });
    }

    // Criação da empresa
    const org = await prisma.organization.create({
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

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
