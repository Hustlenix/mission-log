"use client";

import { createAuthClient } from "better-auth/react";

// Better Auth resolves the current browser origin when baseURL is omitted.
export const authClient = createAuthClient();
