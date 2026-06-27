import { describe, it, expect } from 'vitest';
import { profileSchema } from '@/lib/services/validation';

describe('profileSchema', () => {
  const base = {
    name: 'Asha Devi',
    age: 34,
    gender: 'female' as const,
    heightCm: 160,
    weightKg: 58,
    diabetes: false,
    bloodPressure: true,
    asthma: false,
    smoking: false,
    alcohol: false,
    avatarColor: '#1FB088',
    avatarEmoji: '🙂',
    isTemporary: false,
  };

  it('accepts a valid profile', () => {
    const result = profileSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = profileSchema.safeParse({ ...base, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an impossible age', () => {
    const result = profileSchema.safeParse({ ...base, age: 999 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid emergency phone format', () => {
    const result = profileSchema.safeParse({ ...base, emergencyContactPhone: 'not-a-phone!!' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid emergency phone format', () => {
    const result = profileSchema.safeParse({ ...base, emergencyContactPhone: '+91 98765 43210' });
    expect(result.success).toBe(true);
  });
});
