-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "experiences" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "translations" JSONB;
