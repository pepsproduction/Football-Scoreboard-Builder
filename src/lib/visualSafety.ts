/**
 * Shared visual guardrails for template-driven scoreboard artwork.
 *
 * Konva treats skew as a shear coefficient. Keeping the conversion here
 * prevents old percentage-like template values from turning into extreme
 * perspective distortion.
 */
export const MAX_SAFE_SKEW = 0.08;

export function safeSkew(value: number | undefined): number {
  const normalized = Math.max(-0.5, Math.min(0.5, value || 0));
  return normalized * MAX_SAFE_SKEW;
}
