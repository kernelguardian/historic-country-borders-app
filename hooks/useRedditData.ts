import { FeatureCollection } from 'geojson';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import useSWR, { Fetcher } from 'swr';

const fetcher: Fetcher<FeatureCollection, string> = (url) =>
  fetch(`/api/reddit?url=${url}`)
    .then((x) => x.json())
    .catch((e) => e);

export const useRedditData = (year: string) => {
  const { query: { reddit } = {} } = useRouter();

  const { data, error } = useSWR(reddit as string, fetcher);
  const featuresByYear = useMemo(
    () =>
      ({
        features: data?.features?.filter((x) =>
          x.properties?.unixTime?.some((x: number) => {
            const diff = new Date(x * 1000).getFullYear() - Number(year);
            return Math.abs(diff) <= 50;
          }),
        ),
        type: 'FeatureCollection',
      } as FeatureCollection),
    [year, data],
  );

  return {
    data: featuresByYear,
    isLoading: !error && !data,
    isError: error,
  } as const;
};
