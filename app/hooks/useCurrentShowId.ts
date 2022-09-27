import { useMatches } from '@remix-run/react';

export function useCurrentShowId(): string {
  const matches = useMatches();

  for (const match of matches) {
    if (match.params.show) {
      return match.params.show;
    }
  }

  throw new Error('No show found');
}
