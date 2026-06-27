import { describe, it, expect } from 'vitest';
import { detectEmergency } from '@/lib/emergency/ruleEngine';

describe('detectEmergency', () => {
  it('detects chest pain', () => {
    const r = detectEmergency('I have severe chest pain and pressure');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('chest_pain');
  });

  it('detects stroke signs', () => {
    const r = detectEmergency('My face is drooping on one side and speech is slurred');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('stroke');
  });

  it('detects severe bleeding', () => {
    const r = detectEmergency('I cut my hand and it won\'t stop bleeding');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('severe_bleeding');
  });

  it('detects poisoning', () => {
    const r = detectEmergency('My child accidentally drank bleach');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('poisoning');
  });

  it('detects overdose', () => {
    const r = detectEmergency('I think I took too many tablets');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('overdose');
  });

  it('detects suicide risk', () => {
    const r = detectEmergency('I want to kill myself');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('suicide_risk');
  });

  it('detects breathing difficulty', () => {
    const r = detectEmergency('I can\'t breathe properly since this morning');
    expect(r.triggered).toBe(true);
    expect(r.category).toBe('breathing_difficulty');
  });

  it('does not trigger on normal symptoms', () => {
    const r = detectEmergency('I have a mild headache and a runny nose');
    expect(r.triggered).toBe(false);
  });

  it('handles empty input safely', () => {
    const r = detectEmergency('');
    expect(r.triggered).toBe(false);
  });
});
