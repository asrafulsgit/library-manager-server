/*
  Warnings:

  - You are about to drop the column `bookId` on the `Borrow` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Borrow` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Borrow" DROP CONSTRAINT "Borrow_bookId_fkey";

-- AlterTable
ALTER TABLE "public"."Borrow" DROP COLUMN "bookId",
DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "public"."BorrowItems" (
    "id" TEXT NOT NULL,
    "borrowId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BorrowItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BorrowItems" ADD CONSTRAINT "BorrowItems_borrowId_fkey" FOREIGN KEY ("borrowId") REFERENCES "public"."Borrow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BorrowItems" ADD CONSTRAINT "BorrowItems_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
