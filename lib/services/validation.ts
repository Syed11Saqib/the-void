import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  age: z.coerce.number().int().min(0, 'Invalid age').max(130, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  heightCm: z.coerce.number().min(30, 'Invalid height').max(260, 'Invalid height'),
  weightKg: z.coerce.number().min(1, 'Invalid weight').max(400, 'Invalid weight'),
  diabetes: z.boolean().default(false),
  bloodPressure: z.boolean().default(false),
  asthma: z.boolean().default(false),
  smoking: z.boolean().default(false),
  alcohol: z.boolean().default(false),
  lifestyle: z.string().max(200).optional(),
  allergies: z.string().max(300).optional(),
  otherDiseases: z.string().max(300).optional(),
  emergencyContactName: z.string().max(60).optional(),
  emergencyContactPhone: z
    .string()
    .max(20)
    .optional()
    .refine((v) => !v || /^[0-9+\-\s]{6,20}$/.test(v), 'Invalid phone number'),
  avatarColor: z.string().default('#1FB088'),
  avatarEmoji: z.string().default('🙂'),
  isTemporary: z.boolean().default(false),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const symptomInputSchema = z.object({
  text: z.string().min(2, 'Please describe your symptoms').max(1000),
});
