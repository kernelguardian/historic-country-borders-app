import { Feature, Geometry, Point } from 'geojson';
import { NextApiHandler } from 'next';

const baseUrl = 'https://www.reddit.com/r';

interface SubredditData {
  children: { data: RedditPost }[];
}

interface RedditPost {
  title: string;
  selftext_html: string;
  selftext: string;
}

const handler: NextApiHandler = async (req, res) => {
  const {
    query: { url },
  } = req;
  console.log('REQ Query', url);
  if (url) {
    try {
      const urlString = url as string;
      if (urlString.includes('/comments/')) {
        return;
      }
      const resp = await fetch(`${baseUrl}${urlString}.json`);

      const data = (await resp.json()) as SubredditData;
      console.log(data);
      return;
    } catch (error) {
      res.status(500).send({ error });
    }
  }
  res.status(404).send({ error: 'Not Found' });
};

export default handler;

const convertPostToFeature = (post: RedditPost) => {
  const title = post.title;
  const body = post.selftext_html;
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0],
    } as Point,
    properties: {
      title,
      body,
    },
  } as Feature;
};

const getGeocoding = async (location: string) => {
  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=pk.eyJ1IjoibnJnYXBwbGUiLCJhIjoiY2trN2E1YnVvMGJ4OTJwbWptM25waHVmNyJ9.UxvOXdAatpV-H1AXQQ23Kg`,
  );
  const data = await resp.json();
  console.log('data', data);
};
