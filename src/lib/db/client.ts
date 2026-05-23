// STIGMATOR Database Client
// Prisma client - server side only

let prismaInstance: any;

export async function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  
  // Only import Prisma on the server
  if (typeof window !== 'undefined') {
    // Browser/build time - return mock
    return createMockPrisma();
  }
  
  try {
    // webpackIgnore prevents webpack from bundling this
    const { PrismaClient } = await import(/* webpackIgnore: true */ '@prisma/client');
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any;
    };
    
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  } catch {
    // Fallback to mock if Prisma isn't available
    return createMockPrisma();
  }
}

// Mock Prisma for browser/build time
function createMockPrisma() {
  const mockHandler = {
    get() {
      return async () => [];
    }
  };
  
  return new Proxy({} as any, mockHandler);
}

// Export a promise that resolves to the prisma client
export const prismaPromise = getPrismaClient();

// Default export
export default prismaPromise;

// Named export for direct usage
export const prisma = new Proxy({} as any, {
  get(_, prop) {
    if (!prismaInstance) {
      throw new Error('Prisma not initialized. Use getPrismaClient() or prismaPromise.');
    }
    return prismaInstance[prop];
  }
});
