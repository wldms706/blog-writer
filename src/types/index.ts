export type BusinessCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  hasRegulation: boolean;
};

export type TopicCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Purpose = {
  id: string;
  name: string;
  description: string;
};

export type ReaderState = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type SafetyCondition = {
  id: string;
  text: string;
  description: string;
  required: boolean;
};

export type FormData = {
  businessCategory: string | null;
  keyword: string;
  topic: string | null;
  purpose: string | null;
  readerState: string | null;
  rulesConfirmed: boolean;
  additionalContext: string;
};

export type Step = {
  id: number;
  title: string;
  subtitle: string;
};
