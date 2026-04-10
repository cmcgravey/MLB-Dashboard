import { Alert } from '@mui/material';

interface EmptyStateProps {
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

export function EmptyState({ message, severity = 'info' }: EmptyStateProps) {
  return <Alert severity={severity}>{message}</Alert>;
}
