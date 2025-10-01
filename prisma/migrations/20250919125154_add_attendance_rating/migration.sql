-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "support_type" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
