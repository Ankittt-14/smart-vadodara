import axios from 'axios';

const API_BASE = 'http://localhost:4000';

export const api = axios.create({ baseURL: API_BASE });

export const IMG_BASE = API_BASE;

export const RISK_COLORS = {
  Critical: { text: 'text-error', bg: 'bg-error-container', dot: 'bg-error', border: 'border-error' },
  High: { text: 'text-tertiary', bg: 'bg-tertiary-container', dot: 'bg-tertiary', border: 'border-tertiary-container' },
  Moderate: { text: 'text-primary', bg: 'bg-primary-container/20', dot: 'bg-primary', border: 'border-primary/30' },
  Low: { text: 'text-secondary', bg: 'bg-secondary-container', dot: 'bg-secondary', border: 'border-secondary' },
};

export const STATUS_LABELS = {
  'Pending Review': 'Pending Review',
  'In Progress': 'In Progress',
  'Fixed - Pending AI Review': 'Fixed – Pending AI Review',
  Verified: 'Verified',
  Flagged: 'Flagged (Spam)',
  Duplicate: 'Duplicate',
};
