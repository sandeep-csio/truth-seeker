
export interface EvaluationItem {
  id: string;
  question: string;
  answer: string;
  answer_llm: string;
  agriculture_consensus?: boolean;
  relevance?: number;
  isCompleted: boolean;
  factuality?: 'Correct' | 'Partially Correct' | 'Incorrect';
}

export interface EvaluationProject {
  id: string;
  name: string;
  items: EvaluationItem[];
  currentIndex: number;
  completed: number;
  lastUpdated: Date;
}
