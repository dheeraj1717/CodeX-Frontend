export function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-4"><div className="skeleton h-4 w-6" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-48" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-14" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-28" /></td>
    </tr>
  );
}

export function SkeletonBlock({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}
