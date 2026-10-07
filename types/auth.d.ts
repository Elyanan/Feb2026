import "next-auth";
import "next-auth/jwt";
declare module "next-auth" {
  interface Session { user?: { id: string; role: "admin"; name: string }; }
  interface User { role?: "admin"; }
}
declare module "next-auth/jwt" {
  interface JWT { role?: string; credentialVersion?: string; absoluteExpiry?: number; }
}
