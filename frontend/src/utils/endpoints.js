/**
 * BioProFLiC Centralized API Endpoints
 * Mandatory file complying with AGENTS.md rules
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },

  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  CLASSES: {
    LIST: "/classes",
    DETAIL: (id) => `/classes/${id}`,
    CREATE: "/classes",
    UPDATE: (id) => `/classes/${id}`,
    DELETE: (id) => `/classes/${id}`,
  },

  STUDENTS: {
    LIST: "/students",
    DETAIL: (id) => `/students/${id}`,
    CREATE: "/students",
    UPDATE: (id) => `/students/${id}`,
    DELETE: (id) => `/students/${id}`,
  },

  PROJECTS: {
    LIST: "/projects",
    DETAIL: (id) => `/projects/${id}`,
    CREATE: "/projects",
    UPDATE: (id) => `/projects/${id}`,
    STAGES: (id) => `/projects/${id}/stages`,
  },

  STAGES: {
    DETAIL: (id) => `/stages/${id}`,
    UPDATE_STATUS: (id) => `/stages/${id}/status`,
    ADD_MATERIAL: (stageId) => `/stages/${stageId}/materials`,
    ADD_PROBLEM: (stageId) => `/stages/${stageId}/problems`,
  },

  GROUPS: {
    LIST: "/groups",
    DETAIL: (id) => `/groups/${id}`,
    CREATE: "/groups",
    UPDATE: (id) => `/groups/${id}`,
    DELETE: (id) => `/groups/${id}`,
    DISCUSSIONS: (id) => `/groups/${id}/discussions`,
    SOLUTION: (id) => `/groups/${id}/solution`,
  },

  PRESENTATIONS: {
    LIST: "/presentations",
    CREATE: "/presentations",
    GRADE: (id) => `/presentations/${id}/grade`,
    FEEDBACKS: (id) => `/presentations/${id}/feedbacks`,
  },

  REFLECTIONS: {
    LIST: "/reflections",
    CREATE: "/reflections",
  },

  ASSESSMENTS: {
    QUIZ_DETAIL: (id) => `/quizzes/${id}`,
    UPDATE_QUIZ: (id) => `/quizzes/${id}`,
    ADD_QUESTION: (quizId) => `/quizzes/${quizId}/questions`,
    UPDATE_QUESTION: (id) => `/quiz-questions/${id}`,
    DELETE_QUESTION: (id) => `/quiz-questions/${id}`,
    SUBMIT_QUIZ: (id) => `/quizzes/${id}/submit`,
    ATTEMPTS: "/quiz-attempts",
  },

  REPORTS: {
    SUMMARY: "/reports/summary",
  },

  NOTIFICATIONS: {
    LIST: "/notifications",
  },

  ACTIVITY_LOGS: {
    LIST: "/activity-logs",
  },

  UPLOAD: "/upload",
};
