import { promises as fs } from "fs";
import path from "path";

async function findRadixImports(dir) {
  let results = new Set();

  async function scanDirectory(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(directory, file.name);

      if (file.isDirectory()) {
        if (file.name === "node_modules" || file.name.startsWith(".")) continue;
        await scanDirectory(filePath);
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name.endsWith(".js")) {
        const content = await fs.readFile(filePath, "utf8");
        const matches = content.match(/@radix-ui\/react-[a-zA-Z0-9_-]+/g);
        if (matches) matches.forEach(m => results.add(m));
      }
    }
  }

  await scanDirectory(dir);
  return [...results].sort();
}

const radixPackages = await findRadixImports(process.cwd());

if (radixPackages.length === 0) {
  console.log("✅ Nenhum import Radix encontrado.");
} else {
  console.log("📦 Pacotes Radix encontrados no projeto:");
  console.log(radixPackages.join("\n"));
  console.log("\nPara instalar tudo, rode:");
  console.log("npm install " + radixPackages.join(" "));
}
