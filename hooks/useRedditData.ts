import { FeatureCollection } from 'geojson';
import { useRouter } from 'next/router';
import useSWR, { Fetcher } from 'swr';

const fetcher: Fetcher<FeatureCollection, string> = (url) =>
  fetch(`/api/reddit?url=${url}`)
    .then((x) => x.json())
    .catch((e) => e);

export const useRedditData = ({ year }: { year: string }) => {
  const { query: { reddit } = {} } = useRouter();

  const { data, error } = useSWR(reddit as string, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  } as const;
};
