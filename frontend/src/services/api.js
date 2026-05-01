// Central API service – all backend calls go through here
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

export const api = {
  chat: (query, language = 'en', history = []) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ query, language, history }),
    }),

  timeline: () => request('/timeline'),

  eligibility: (age, citizen, state = '') =>
    request('/eligibility', {
      method: 'POST',
      body: JSON.stringify({ age, citizen, state }),
    }),

  quiz: () => request('/quiz'),

  checkAnswer: (question_id, answer) =>
    request('/quiz/check', {
      method: 'POST',
      body: JSON.stringify({ question_id, answer }),
    }),

  suggestedPrompts: () => request('/suggested-prompts'),

  health: () => request('/health'),
};
