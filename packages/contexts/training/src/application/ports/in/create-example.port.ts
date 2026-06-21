// Driving port — what the outside world calls into the application.
export interface CreateExampleInput {
  id: string;
  label: string;
}

export interface CreateExampleOutput {
  id: string;
  label: string;
}

export interface CreateExample {
  execute(input: CreateExampleInput): Promise<CreateExampleOutput>;
}
