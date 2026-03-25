import type { Achievement, VisitorMode, VisitorProgress } from '../types';
import { PROGRESS_STORAGE_KEY } from '../hooks/storageKeys';

const DEFAULT_PROGRESS: VisitorProgress = {
  visits: 0,
  totalCommands: 0,
  lastCommandAt: null,
  discoveredCommands: [],
  hiddenCommands: [],
  achievements: [],
  unlockedVault: false,
  adminUnlocked: false,
  activePath: 'standard',
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Ran your first terminal command.',
  },
  {
    id: 'guided_tour',
    title: 'Guided Tour',
    description: 'Started exploring through a guided path.',
  },
  {
    id: 'deep_dive',
    title: 'Deep Dive',
    description: 'Discovered at least 5 unique commands.',
  },
  {
    id: 'hidden_terminal',
    title: 'Hidden Terminal',
    description: 'Found a hidden command.',
  },
  {
    id: 'vault_access',
    title: 'Vault Access',
    description: 'Unlocked the hidden vault.',
  },
];

function safeParse(raw: string | null): VisitorProgress {
  if (!raw) return { ...DEFAULT_PROGRESS };

  try {
    const parsed = JSON.parse(raw) as Partial<VisitorProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      discoveredCommands: parsed.discoveredCommands ?? [],
      hiddenCommands: parsed.hiddenCommands ?? [],
      achievements: parsed.achievements ?? [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function getVisitorProgress(): VisitorProgress {
  try {
    return safeParse(localStorage.getItem(PROGRESS_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function setVisitorProgress(progress: VisitorProgress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage failures.
  }
}

export function trackVisit(): VisitorProgress {
  const progress = getVisitorProgress();
  const next = {
    ...progress,
    visits: progress.visits + 1,
  };
  setVisitorProgress(next);
  return next;
}

export function setActivePath(mode: VisitorMode): VisitorProgress {
  const progress = getVisitorProgress();
  const next = {
    ...progress,
    activePath: mode,
  };
  setVisitorProgress(next);
  return next;
}

function unlock(progress: VisitorProgress, achievementId: string): VisitorProgress {
  if (progress.achievements.includes(achievementId)) {
    return progress;
  }

  return {
    ...progress,
    achievements: [...progress.achievements, achievementId],
  };
}

export function recordCommandExecution(commandName: string, hidden: boolean): {
  progress: VisitorProgress;
  unlocked: Achievement[];
} {
  const current = getVisitorProgress();

  let next: VisitorProgress = {
    ...current,
    totalCommands: current.totalCommands + 1,
    lastCommandAt: Date.now(),
    discoveredCommands: current.discoveredCommands.includes(commandName)
      ? current.discoveredCommands
      : [...current.discoveredCommands, commandName],
    hiddenCommands:
      hidden && !current.hiddenCommands.includes(commandName)
        ? [...current.hiddenCommands, commandName]
        : current.hiddenCommands,
  };

  const before = new Set(next.achievements);

  if (next.totalCommands >= 1) {
    next = unlock(next, 'first_steps');
  }
  if (next.activePath !== 'standard') {
    next = unlock(next, 'guided_tour');
  }
  if (next.discoveredCommands.length >= 5) {
    next = unlock(next, 'deep_dive');
  }
  if (next.hiddenCommands.length >= 1) {
    next = unlock(next, 'hidden_terminal');
  }
  if (next.unlockedVault) {
    next = unlock(next, 'vault_access');
  }

  setVisitorProgress(next);

  const unlocked = ACHIEVEMENTS.filter(
    (achievement) => next.achievements.includes(achievement.id) && !before.has(achievement.id)
  );

  return { progress: next, unlocked };
}

export function unlockVault(): VisitorProgress {
  const current = getVisitorProgress();
  const next = unlock(
    {
      ...current,
      unlockedVault: true,
    },
    'vault_access'
  );
  setVisitorProgress(next);
  return next;
}

export function unlockAdmin(): VisitorProgress {
  const current = getVisitorProgress();
  const next = {
    ...current,
    adminUnlocked: true,
  };
  setVisitorProgress(next);
  return next;
}
