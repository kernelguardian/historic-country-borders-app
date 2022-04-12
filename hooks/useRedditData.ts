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
        features: data?.features? .filter((x) =>
          x.properties?.unixTime?.some((x: number) => {
            console.log({ x, d1: new Date(x * 1000).getFullYear() });

            const diff = new Date(x * 1000).getFullYear() - Number(year);
            console.log({ diff });

            return Math.abs(diff) <= 50;
          }),
        ),
        type: 'FeatureCollection',
      } as FeatureCollection),
    [year, data],
  );

  console.log({ featuresByYear });

  return {
    data: featuresByYear,
    isLoading: !error && !data,
    isError: error,
  } as const;
};
