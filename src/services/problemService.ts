import { problemApi } from './api';
import { Problem, ProblemListItem } from '../types/problem.types';

export async function getProblems(): Promise<ProblemListItem[]> {
  const res = await problemApi.get('/problems/');
  return res.data.data as ProblemListItem[];
}

export async function getProblemById(id: string): Promise<Problem> {
  const res = await problemApi.get(`/problems/${id}`);
  return res.data.data as Problem;
}
