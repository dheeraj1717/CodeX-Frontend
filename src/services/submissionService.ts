import { submissionApi } from './api';

export interface SubmissionPayload {
  code: string;
  language: string;
  userId: string;
  problemId: string;
}

export async function createSubmission(payload: SubmissionPayload) {
  const res = await submissionApi.post('/submission', payload);
  return res.data;
}
