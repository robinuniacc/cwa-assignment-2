-- CreateEnum
CREATE TYPE "prompt_type" AS ENUM ('text', 'code', 'newline');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('short_answer', 'multiple_choice', 'true_false', 'fill_in_the_blanks');

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bgImgWidth" INTEGER NOT NULL,
    "bgImgHeight" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fill_in_the_blanks_answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "fill_in_the_blanks_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fill_in_the_blanks_questions" (
    "question_id" UUID NOT NULL,

    CONSTRAINT "fill_in_the_blanks_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "multiple_choice_choices" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "multiple_choice_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multiple_choice_questions" (
    "question_id" UUID NOT NULL,

    CONSTRAINT "multiple_choice_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "type" "prompt_type" NOT NULL,
    "prompt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "type" "question_type" NOT NULL,
    "center_x" INTEGER NOT NULL,
    "center_y" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_answer_questions" (
    "question_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "short_answer_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "true_false_questions" (
    "question_id" UUID NOT NULL,
    "answer" BOOLEAN NOT NULL,

    CONSTRAINT "true_false_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateIndex
CREATE INDEX "idx_fib_answers_question_id" ON "fill_in_the_blanks_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "fill_in_the_blanks_answers_question_id_position_key" ON "fill_in_the_blanks_answers"("question_id", "position");

-- CreateIndex
CREATE INDEX "idx_mc_choices_question_id" ON "multiple_choice_choices"("question_id");

-- CreateIndex
CREATE INDEX "idx_prompts_question_id" ON "prompts"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompts_question_id_position_key" ON "prompts"("question_id", "position");

-- CreateIndex
CREATE INDEX "idx_questions_type" ON "questions"("type");

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_answers" ADD CONSTRAINT "fill_in_the_blanks_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "fill_in_the_blanks_questions"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_questions" ADD CONSTRAINT "fill_in_the_blanks_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiple_choice_choices" ADD CONSTRAINT "multiple_choice_choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "multiple_choice_questions"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiple_choice_questions" ADD CONSTRAINT "multiple_choice_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer_questions" ADD CONSTRAINT "short_answer_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "true_false_questions" ADD CONSTRAINT "true_false_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
