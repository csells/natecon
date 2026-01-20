import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
  tips: string[];
}

function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { level: 'weak', score: 0, label: '', tips: [] };
  }

  let score = 0;
  const tips: string[] = [];

  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    tips.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    tips.push('Add numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    tips.push('Add special characters');
  }

  // Determine strength level
  let level: StrengthLevel;
  let label: string;

  if (score <= 3) {
    level = 'weak';
    label = 'Weak';
    if (password.length < 8) tips.unshift('Use at least 8 characters');
  } else if (score <= 5) {
    level = 'medium';
    label = 'Medium';
  } else {
    level = 'strong';
    label = 'Strong';
  }

  return { level, score, label, tips: tips.slice(0, 2) };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-200',
              bar === 1 && password.length > 0 && 'bg-destructive',
              bar <= 2 && strength.level !== 'weak' && 'bg-yellow-500',
              bar <= 3 && strength.level === 'strong' && 'bg-green-500',
              (strength.level === 'weak' && bar > 1) && 'bg-muted',
              (strength.level === 'medium' && bar > 2) && 'bg-muted',
              !password && 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium',
            strength.level === 'weak' && 'text-destructive',
            strength.level === 'medium' && 'text-yellow-500',
            strength.level === 'strong' && 'text-green-500'
          )}
        >
          {strength.label}
        </span>
        {strength.tips.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {strength.tips[0]}
          </span>
        )}
      </div>
    </div>
  );
}
