import type { AppData, Preferences } from '../types';

export type AppAction =
  | { type: 'data/replace'; data: AppData }
  | { type: 'data/update'; update: (current: AppData) => AppData }
  | { type: 'preferences/update'; patch: Partial<Preferences> };

export function appDataReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'data/replace':
      return action.data;
    case 'data/update':
      return action.update(state);
    case 'preferences/update':
      return { ...state, preferences: { ...state.preferences, ...action.patch } };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
