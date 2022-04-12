import { Feature, Geometry, Point } from 'geojson';
import { NextApiHandler } from 'next';
import winkNLP from 'wink-nlp';
// @ts-ignore
import its from 'wink-nlp/src/its';
// @ts-ignore
import as from 'wink-nlp/src/as';
// @ts-ignore
import model from 'wink-eng-lite-model';

const nlp = winkNLP(model);

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
  if (url) {
    try {
      const urlString = url as string;
      if (urlString.includes('/comments/')) {
        return res.end();
      }
      const resp = await fetch(`${baseUrl}${urlString}.json`);

      const data = (await resp.json()) as any;
      const allDateData = data.data.children.flatMap((x) =>
        convertPostToFeature(x.data),
      );

      return res.json({ allDateData });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error });
    }
  }
  return res.status(404).send({ error: 'Not Found' });
};

export default handler;

const convertPostToFeature = (post: RedditPost) => {
  const title = post.title;
  const body = post.selftext_html;
  const timelineDates = parseDateFromText(post.selftext);
  return timelineDates.length > 0
    ? ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        } as Point,
        properties: {
          date: timelineDates,
          title,
          body,
        },
      } as Feature)
    : [];
};

const getGeocoding = async (location: string) => {
  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=pk.eyJ1IjoibnJnYXBwbGUiLCJhIjoiY2trN2E1YnVvMGJ4OTJwbWptM25waHVmNyJ9.UxvOXdAatpV-H1AXQQ23Kg`,
  );
  const data = await resp.json();
  console.log('data', data);
};

const parseDateFromText = (text: string) => {
  const timelines: string[] = [];
  const doc = nlp.readDoc(text);
  doc
    .entities()
    .filter((e) => {
      var shapes = e.tokens().out(its.shape);
      // We only want dates that can be converted to an actual
      // time using new Date()
      return (
        e.out(its.type) === 'DATE' &&
        (shapes[0] === 'dddd' ||
          (shapes[0] === 'Xxxxx' && shapes[1] === 'dddd') ||
          (shapes[0] === 'Xxxx' && shapes[1] === 'dddd') ||
          (shapes[0] === 'dd' &&
            shapes[1] === 'Xxxxx' &&
            shapes[2] === 'dddd') ||
          (shapes[0] === 'dd' &&
            shapes[1] === 'Xxxx' &&
            shapes[2] === 'dddd') ||
          (shapes[0] === 'd' &&
            shapes[1] === 'Xxxxx' &&
            shapes[2] === 'dddd') ||
          (shapes[0] === 'd' && shapes[1] === 'Xxxx' && shapes[2] === 'dddd'))
      );
    })
    .each((e) => {
      timelines.push(e.out());
    });

  return timelines;
};
