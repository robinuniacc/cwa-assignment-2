import { PrismaClient } from "../../prisma/generated/client";

type DBQuestionType =
  | "short_answer"
  | "multiple_choice"
  | "true_false"
  | "fill_in_the_blanks";

const prisma = new PrismaClient();

export default prisma;
export type { DBQuestionType };
