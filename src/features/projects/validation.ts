import type { Project, ProjectColorToken } from '../../types';

export interface ProjectFormDraft {
  name: string;
  description: string;
  colorToken: string;
}

export interface ProjectFormFields {
  name: string;
  description: string;
  colorToken: ProjectColorToken;
}

export type ProjectFormField = keyof ProjectFormDraft;
export type ProjectFormErrors = Partial<Record<ProjectFormField, string>>;

export const PROJECT_COLOR_OPTIONS: Array<{
  value: ProjectColorToken;
  label: string;
  description: string;
}> = [
  { value: 'clay', label: 'Clay', description: 'Warm terracotta' },
  { value: 'rust', label: 'Rust', description: 'Deep red earth' },
  { value: 'olive', label: 'Olive', description: 'Soft green' },
  { value: 'slate', label: 'Slate', description: 'Blue grey' },
];

const validColorTokens = new Set<ProjectColorToken>(
  PROJECT_COLOR_OPTIONS.map(({ value }) => value),
);

export function emptyProjectDraft(project?: Project | null): ProjectFormDraft {
  return {
    name: project?.name ?? '',
    description: project?.description ?? '',
    colorToken: project?.colorToken ?? 'clay',
  };
}

export function validateProjectForm(draft: ProjectFormDraft): {
  errors: ProjectFormErrors;
  value: ProjectFormFields | null;
} {
  const name = draft.name.trim();
  const description = draft.description.trim();
  const errors: ProjectFormErrors = {};

  if (!name) errors.name = 'Give the project a name.';
  else if (name.length < 2) errors.name = 'Project names must contain at least 2 characters.';
  else if (name.length > 60) errors.name = 'Project names can be up to 60 characters.';

  if (description.length > 300) {
    errors.description = 'Project descriptions can be up to 300 characters.';
  }
  if (!validColorTokens.has(draft.colorToken as ProjectColorToken)) {
    errors.colorToken = 'Choose a valid project color.';
  }

  if (Object.keys(errors).length > 0) return { errors, value: null };
  return {
    errors,
    value: {
      name,
      description,
      colorToken: draft.colorToken as ProjectColorToken,
    },
  };
}
