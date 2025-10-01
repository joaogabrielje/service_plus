/*
  Warnings:

  - You are about to drop the column `support_type` on the `attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "support_type",
ADD COLUMN     "support_type_id" TEXT;

-- CreateTable
CREATE TABLE "support_type" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_type_name_key" ON "support_type"("name");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_support_type_id_fkey" FOREIGN KEY ("support_type_id") REFERENCES "support_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
