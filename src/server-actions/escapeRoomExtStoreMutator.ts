"use server";
import prisma, { DBQuestionType } from "../lib/prisma";
import {
  FillInTheBlanksQuestion,
  MultipleChoiceQuestion,
  Question,
  ShortAnswerQuestion,
  TrueFalseQuestion,
} from "@/app/escape-room/typings";
import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { imageSize } from "image-size";

const S3_CLIENT = new S3Client({});
const S3_GET_OBJ_CMD = new GetObjectCommand({
  Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
  Key: `${process.env.NEXT_PUBLIC_S3_PREFIX_UNFINISHED_ROOMS!}/bgimg`,
});

function convertTSQuestionTypeToDBType(type: Question["type"]): DBQuestionType {
  return type.replace(/-/g, "_") as DBQuestionType;
}

async function clearDB() {
  await prisma.questions.deleteMany();
}

function extractCriticalDBQIntoTSQ<T>(
  q: T & {
    question: {
      id: string;
      center_x: number;
      center_y: number;
      prompts: { type: string; prompt: string }[];
    };
  },
) {
  return {
    id: q.question.id,
    position: {
      centerX: q.question.center_x,
      centerY: q.question.center_y,
    },
    prompt: q.question.prompts,
  };
}

async function loadData() {
  const stdQuery = {
    omit: { question_id: true },
    include: {
      question: {
        include: {
          prompts: {
            select: { type: true, prompt: true },
            orderBy: { position: "asc" as "asc" | "desc" },
          },
        },
      },
    },
  };

  const shortAnsQs = (
    await prisma.short_answer_questions.findMany({ ...stdQuery })
  ).map((q) => {
    return {
      ...extractCriticalDBQIntoTSQ(q),
      type: "short-answer",
      answer: q.answer,
    } as ShortAnswerQuestion;
  });

  const mcQs = (
    await prisma.multiple_choice_questions.findMany({
      ...stdQuery,
      include: {
        ...stdQuery.include,
        choices: {
          select: { is_correct: true, text: true },
        },
      },
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "multiple-choice",
        choices: q.choices.map((c) => ({
          text: c.text,
          isCorrect: c.is_correct,
        })),
      }) as MultipleChoiceQuestion,
  );

  const fitbQs = (
    await prisma.fill_in_the_blanks_questions.findMany({
      ...stdQuery,
      include: {
        ...stdQuery.include,
        answers: {
          select: { answer: true },
          orderBy: { position: "asc" },
        },
      },
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "fill-in-the-blanks",
        answer: q.answers.map((a) => a.answer),
      }) as FillInTheBlanksQuestion,
  );
  const tfQs = (
    await prisma.true_false_questions.findMany({
      ...stdQuery,
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "true-false",
        answer: q.answer,
      }) as TrueFalseQuestion,
  );

  let obj;
  try {
    obj = await S3_CLIENT.send(S3_GET_OBJ_CMD);
  } catch (e) {
    if (e instanceof NoSuchKey) {
      obj = {};
    } else {
      throw e;
    }
  }

  let imgDims;
  let bgImgBlob;
  if (obj.Body) {
    const arr = await obj.Body.transformToByteArray();
    imgDims = imageSize(arr);
    bgImgBlob = new Blob([new Uint8Array(arr)], {
      type: obj.ContentType || undefined,
    });
  }

  return {
    questions: [...shortAnsQs, ...mcQs, ...fitbQs, ...tfQs],
    bgImgBlob: bgImgBlob,
    imgSize: imgDims
      ? { width: imgDims.width, height: imgDims.height }
      : { width: 0, height: 0 },
  };
}

async function saveData(latestData: {
  bgImgBlob: Blob | null;
  questions: Question[];
  imgSize: { width: number; height: number };
}) {
  // Save image to S3 and image size
  if (latestData.bgImgBlob) {
    await S3_CLIENT.send(
      new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: `${process.env.NEXT_PUBLIC_S3_PREFIX_UNFINISHED_ROOMS!}/bgimg`,
        Body: Buffer.from(await latestData.bgImgBlob.arrayBuffer()),
        ContentType: latestData.bgImgBlob.type || "",
      }),
    );
  }

  // Save questions to postgres
  await clearDB();

  for (const q of latestData.questions) {
    await prisma.questions.upsert({
      where: { id: q.id },
      update: {
        center_x: q.position.centerX,
        center_y: q.position.centerY,
        type: convertTSQuestionTypeToDBType(q.type),
      },
      create: {
        id: q.id,
        type: convertTSQuestionTypeToDBType(q.type),
        center_x: q.position.centerX,
        center_y: q.position.centerY,
      },
    });

    // Add prompts
    for (let idx = 0; idx < q.prompt.length; idx++) {
      const p = q.prompt[idx];
      await prisma.prompts.create({
        data: {
          question_id: q.id,
          type: p.type,
          prompt: p.prompt,
          position: idx + 1,
        },
      });
    }

    if (q.type === "short-answer") {
      const saq = q as ShortAnswerQuestion;
      await prisma.short_answer_questions.upsert({
        where: { question_id: q.id },
        create: { question_id: q.id, answer: saq.answer },
        update: { answer: saq.answer },
      });
    } else if (q.type === "multiple-choice") {
      const mcq = q as MultipleChoiceQuestion;
      await prisma.multiple_choice_questions.upsert({
        where: { question_id: q.id },
        create: { question_id: q.id },
        update: {},
      });

      for (const c of mcq.choices) {
        await prisma.multiple_choice_choices.create({
          data: {
            question_id: q.id,
            text: c.text,
            is_correct: c.isCorrect,
          },
        });
      }
    } else if (q.type === "fill-in-the-blanks") {
      const fitbq = q as FillInTheBlanksQuestion;
      await prisma.fill_in_the_blanks_questions.upsert({
        where: { question_id: q.id },
        create: { question_id: q.id },
        update: {},
      });

      for (let idx = 0; idx < fitbq.answer.length; idx++) {
        const a = fitbq.answer[idx];
        await prisma.fill_in_the_blanks_answers.create({
          data: {
            question_id: q.id,
            answer: a,
            position: idx + 1,
          },
        });
      }
    } else if (q.type === "true-false") {
      const tfq = q as TrueFalseQuestion;
      await prisma.true_false_questions.upsert({
        where: { question_id: q.id },
        create: { question_id: q.id, answer: tfq.answer },
        update: { answer: tfq.answer },
      });
    }
  }
}

export { loadData, saveData };
