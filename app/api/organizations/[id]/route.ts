import { validarCNPJ } from "@/utils/validateCnpj";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    if (logoFile && typeof logoFile === "object" && "arrayBuffer" in logoFile && logoFile.size > 0) {
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

    // Verificação de duplicidade (exceto a própria empresa)
    const exists = await prisma.organization.findFirst({ where: { cnpj, NOT: { id: params.id } } });
    if (exists) {
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 400 });
    }

    // Atualização da empresa
    const org = await prisma.organization.update({
      where: { id: params.id },
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
        slug,
        ...(logoUrl ? { logoUrl } : {}),
      },
    });

    return NextResponse.json(org, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const org = await prisma.organization.findUnique({ where: { id: params.id } });
    if (!org) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }
    return NextResponse.json(org, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
