export type CodeStub = {
  language: string;
  startSnippet: string;
  userSnippet: string;
  endSnippet: string;
};

export type TestCase = {
  input: string;
  output: string;
};

export type Problem = {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: TestCase[];
  codeStubs: CodeStub[];
  editorial?: string;
};

export type ProblemListItem = {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
};

export type SubmissionResult = {
  submissionId?: string;
  status?: string;
  output?: string;
  error?: string;
  userId?: string;
  testCaseResults?: {
    input: string;
    output: string;
    expected: string;
    status: string;
    error?: string;
  }[];
};