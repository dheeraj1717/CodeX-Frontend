type Props = { difficulty: string };

const MAP: Record<string, string> = {
  easy: 'diff-easy',
  medium: 'diff-medium',
  hard: 'diff-hard',
};

export default function DifficultyBadge({ difficulty }: Props) {
  const cls = MAP[difficulty?.toLowerCase()] ?? 'diff-easy';
  const label = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : '—';
  return <span className={cls}>{label}</span>;
}
