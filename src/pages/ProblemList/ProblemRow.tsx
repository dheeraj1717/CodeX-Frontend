import { Link } from 'react-router-dom';
import DifficultyBadge from '../../components/DifficultyBadge';
import { ProblemListItem } from '../../types/problem.types';

type Props = {
  problem: ProblemListItem;
  index: number;
};

export default function ProblemRow({ problem, index }: Props) {
  return (
    <tr className="cx-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
      <td className="px-4 py-3">
        <span className="cx-num">{index + 1}</span>
      </td>
      <td className="px-4 py-3">
        <Link to={`/problems/${problem._id}`} className="cx-problem-link">
          {problem.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <DifficultyBadge difficulty={problem.difficulty} />
      </td>
      <td className="px-4 py-3">
        {(problem.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="cx-tag">{tag}</span>
        ))}
      </td>
    </tr>
  );
}
