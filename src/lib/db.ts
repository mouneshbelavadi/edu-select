import dns from 'node:dns';
import { PrismaClient } from '@prisma/client';

// Ensure IPv4 resolution takes precedence for cloud database connections (Neon) across all local/server networks
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();
export const prisma = db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
