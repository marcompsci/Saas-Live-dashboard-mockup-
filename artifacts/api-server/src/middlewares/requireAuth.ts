import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export type AuthedRequest = Request & { userId: string };

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const userId =
    (auth.sessionClaims?.userId as string | undefined) ?? auth.userId ?? undefined;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthedRequest).userId = userId;
  next();
}
