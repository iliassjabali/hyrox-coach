// Claude model ids for each agent role (the three-model orchestration).
export const MODELS = {
  classifier: 'claude-haiku-4-5', // cheap/fast labelling
  coach: 'claude-opus-4-8', // hardest reasoning: plan generation
  critic: 'claude-sonnet-4-6', // balanced: plausibility/safety review
} as const;
