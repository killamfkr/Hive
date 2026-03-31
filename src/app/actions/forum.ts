"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const threadSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(1).max(20000),
});

const postSchema = z.object({
  content: z.string().min(1).max(20000),
});

export async function createThread(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Sign in required." };

  const categorySlug = String(formData.get("categorySlug") ?? "");
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    return { error: "Category not found" };
  }
  if (category.requiresPaid && user.membershipTier !== "PAID") {
    return { error: "This board is for Pro members only." };
  }

  const parsed = threadSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Invalid title or first post." };
  }

  const thread = await prisma.thread.create({
    data: {
      title: parsed.data.title.trim(),
      categoryId: category.id,
      authorId: user.id,
      posts: {
        create: {
          content: parsed.data.body.trim(),
          authorId: user.id,
        },
      },
    },
  });

  revalidatePath(`/forum/${category.slug}`);
  return { ok: true as const, threadId: thread.id };
}

export async function createPost(threadId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Sign in required." };

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: { category: true },
  });
  if (!thread) {
    return { error: "Thread not found" };
  }
  if (thread.category.requiresPaid && user.membershipTier !== "PAID") {
    return { error: "Pro membership required to post here." };
  }

  const parsed = postSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: "Invalid reply." };
  }

  await prisma.post.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      content: parsed.data.content.trim(),
    },
  });

  revalidatePath(`/forum/thread/${threadId}`);
  return { ok: true };
}
