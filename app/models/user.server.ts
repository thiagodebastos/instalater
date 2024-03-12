import type { User } from "@prisma/client";
import { prisma } from "~/services/db.server";
import { compare, hash } from "~/utils/password";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const passwordHash = await hash(password);

  return prisma.user.create({ data: { email, passwordHash } });
}

export async function verifyLogin(email: User["email"], password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return false; // user doesn't exist

  // TODO: make sure to not return false here when a user has an `oauthId`.
  // In this case a user is not expected to always have a password
  if (!user.passwordHash) return false; // user exists but doesn't have password, must have created account with oAuth

  const isValid = await compare(password, user.passwordHash);

  if (!isValid) return false;

  return user;
}
