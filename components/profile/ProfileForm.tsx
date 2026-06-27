'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { profileSchema, type ProfileFormValues } from '@/lib/services/validation';
import type { Profile, ProfileDraft } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AVATAR_COLORS, AVATAR_EMOJIS } from '@/lib/store/profileStore';
import { cn } from '@/lib/utils';

const CONDITION_FIELDS = [
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'bloodPressure', label: 'Blood Pressure' },
  { key: 'asthma', label: 'Asthma' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'alcohol', label: 'Alcohol' },
] as const;

export function ProfileForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save profile',
}: {
  initial?: Profile;
  onSubmit: (draft: ProfileDraft) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          age: initial.age,
          gender: initial.gender,
          heightCm: initial.heightCm,
          weightKg: initial.weightKg,
          diabetes: initial.conditions.diabetes,
          bloodPressure: initial.conditions.bloodPressure,
          asthma: initial.conditions.asthma,
          smoking: initial.conditions.smoking,
          alcohol: initial.conditions.alcohol,
          lifestyle: initial.lifestyle ?? '',
          allergies: initial.allergies.join(', '),
          otherDiseases: initial.otherDiseases.join(', '),
          emergencyContactName: initial.emergencyContact?.name ?? '',
          emergencyContactPhone: initial.emergencyContact?.phone ?? '',
          avatarColor: initial.avatarColor,
          avatarEmoji: initial.avatarEmoji,
          isTemporary: initial.isTemporary,
        }
      : {
          gender: 'prefer_not_to_say',
          diabetes: false,
          bloodPressure: false,
          asthma: false,
          smoking: false,
          alcohol: false,
          avatarColor: AVATAR_COLORS[0],
          avatarEmoji: AVATAR_EMOJIS[0],
          isTemporary: false,
        },
  });

  const avatarColor = watch('avatarColor');
  const avatarEmoji = watch('avatarEmoji');
  const isTemporary = watch('isTemporary');

  function submit(values: ProfileFormValues) {
    const draft: ProfileDraft = {
      name: values.name,
      age: values.age,
      gender: values.gender,
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      conditions: {
        diabetes: values.diabetes,
        bloodPressure: values.bloodPressure,
        asthma: values.asthma,
        smoking: values.smoking,
        alcohol: values.alcohol,
      },
      lifestyle: values.lifestyle,
      allergies: values.allergies ? values.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
      otherDiseases: values.otherDiseases
        ? values.otherDiseases.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      emergencyContact:
        values.emergencyContactName || values.emergencyContactPhone
          ? { name: values.emergencyContactName ?? '', phone: values.emergencyContactPhone ?? '' }
          : undefined,
      avatarColor: values.avatarColor,
      avatarEmoji: values.avatarEmoji,
      isTemporary: values.isTemporary,
    };
    onSubmit(draft);
  }

  return (
    <motion.form
      onSubmit={handleSubmit(submit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
    >
      {/* Avatar picker */}
      <div>
        <Label>Avatar</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => setValue('avatarEmoji', emoji)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-transform focus-ring',
                avatarEmoji === emoji ? 'scale-110 ring-2 ring-mint-500' : 'opacity-60 hover:opacity-100'
              )}
              style={{ background: `${avatarColor}22` }}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setValue('avatarColor', color)}
              className={cn(
                'h-7 w-7 rounded-full transition-transform focus-ring',
                avatarColor === color && 'scale-110 ring-2 ring-foreground/30'
              )}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-1.5" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" className="mt-1.5" {...register('age')} />
          {errors.age && <p className="mt-1 text-xs text-danger-600">{errors.age.message}</p>}
        </div>

        <div>
          <Label>Gender</Label>
          <Select onValueChange={(v) => setValue('gender', v as ProfileFormValues['gender'])} defaultValue={watch('gender')}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" type="number" className="mt-1.5" {...register('heightCm')} />
          {errors.heightCm && <p className="mt-1 text-xs text-danger-600">{errors.heightCm.message}</p>}
        </div>

        <div>
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" type="number" className="mt-1.5" {...register('weightKg')} />
          {errors.weightKg && <p className="mt-1 text-xs text-danger-600">{errors.weightKg.message}</p>}
        </div>
      </div>

      <div>
        <Label>Health conditions</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {CONDITION_FIELDS.map((f) => (
            <label
              key={f.key}
              className="flex items-center justify-between rounded-2xl border border-border bg-white/50 px-3 py-2.5"
            >
              <span className="text-sm text-foreground/80">{f.label}</span>
              <Switch checked={watch(f.key)} onCheckedChange={(v) => setValue(f.key, v)} />
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="allergies">Allergies (comma separated)</Label>
        <Input id="allergies" className="mt-1.5" placeholder="e.g. peanuts, penicillin" {...register('allergies')} />
      </div>

      <div>
        <Label htmlFor="otherDiseases">Other conditions (comma separated)</Label>
        <Input id="otherDiseases" className="mt-1.5" placeholder="e.g. thyroid, arthritis" {...register('otherDiseases')} />
      </div>

      <div>
        <Label htmlFor="lifestyle">Lifestyle notes</Label>
        <Textarea id="lifestyle" className="mt-1.5" placeholder="e.g. sedentary job, vegetarian diet" {...register('lifestyle')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyContactName">Emergency contact name</Label>
          <Input id="emergencyContactName" className="mt-1.5" {...register('emergencyContactName')} />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
          <Input id="emergencyContactPhone" className="mt-1.5" {...register('emergencyContactPhone')} />
          {errors.emergencyContactPhone && (
            <p className="mt-1 text-xs text-danger-600">{errors.emergencyContactPhone.message}</p>
          )}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-2xl border border-border bg-white/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground/80">Temporary profile</p>
          <p className="text-xs text-foreground/50">Auto-deletes when this browser tab closes</p>
        </div>
        <Switch checked={isTemporary} onCheckedChange={(v) => setValue('isTemporary', v)} />
      </label>

      <div className="sticky bottom-0 -mx-1 flex gap-3 bg-gradient-to-t from-white/90 to-transparent px-1 pt-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </motion.form>
  );
}
