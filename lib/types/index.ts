// Core domain types shared across the app.

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type Urgency = 'low' | 'medium' | 'high' | 'emergency';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  conditions: {
    diabetes: boolean;
    bloodPressure: boolean;
    asthma: boolean;
    smoking: boolean;
    alcohol: boolean;
  };
  lifestyle?: string;
  allergies: string[];
  otherDiseases: string[];
  emergencyContact?: EmergencyContact;
  avatarColor: string;
  avatarEmoji: string;
  isTemporary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProfileDraft = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface EmergencyFlag {
  triggered: boolean;
  category?:
    | 'chest_pain'
    | 'stroke'
    | 'severe_bleeding'
    | 'poisoning'
    | 'overdose'
    | 'suicide_risk'
    | 'breathing_difficulty';
  matchedPhrase?: string;
  message?: string;
}

export interface HealthSummary {
  patientName: string;
  urgency: Urgency;
  possibleCause: string; // explicitly framed as "not a diagnosis"
  homeCare: string[];
  doctorRecommendation: string;
  emergencySigns: string[];
  disclaimer: string;
  followUpAsked: number;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm?: number;
  address?: string;
  phone?: string;
  type: 'government' | 'unspecified';
}

export interface Coordinates {
  lat: number;
  lon: number;
}
