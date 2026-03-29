import { trpc } from '../trpc.tsx';

export default function TestTrpcRoute() {
  const testQuery = trpc.test.useQuery();

  const output = testQuery.error
    ? {
        message: testQuery.error.message,
        status: 'error',
      }
    : (testQuery.data ?? { status: 'loading' });

  return <pre>{JSON.stringify(output, null, 2)}</pre>;
}
