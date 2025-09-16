/*
  Warnings:

  - You are about to drop the column `permissions` on the `memberships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "permissions";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "number" TEXT;
