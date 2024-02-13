import { useMatches } from '@remix-run/react';

export function useCurrentShowId({ ci = false } = {}): string {
  const matches = useMatches();

  for (const match of matches) {
    if (match.params.show) {
      return match.params.show;
    }
  }

  if (ci) {
    return '';
  }
  throw new Error('No show found');
}
