/*
  Warnings:

  - A unique constraint covering the columns `[bi_identity_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bi_identity_id" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_bi_identity_id_key" ON "users"("bi_identity_id");
