/*
  Warnings:

  - A unique constraint covering the columns `[name,org_id]` on the table `support_type` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `org_id` to the `support_type` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "support_type_name_key";

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cpfCnpj" TEXT,
ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "obs" TEXT,
ADD COLUMN     "phone1" TEXT,
ADD COLUMN     "phone2" TEXT,
ADD COLUMN     "preferredContact" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "tipoPessoa" TEXT;

-- AlterTable
ALTER TABLE "queue" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "support_type" ADD COLUMN     "org_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "support_type_name_org_id_key" ON "support_type"("name", "org_id");

-- AddForeignKey
ALTER TABLE "support_type" ADD CONSTRAINT "support_type_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
