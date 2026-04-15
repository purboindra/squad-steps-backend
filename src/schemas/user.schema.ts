import z from "zod";

export const createUserSchema = z.object({
  email: z.string().min(1, "Email is required"),
  displayName: z.string().min(1, "Display name is required"),
  profile_picture: z.string().optional(),
  current_steps: z.number().optional(),
  // passkeys:z.array({}).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
