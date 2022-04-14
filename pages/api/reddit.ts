import { Feature, FeatureCollection, Geometry, Point } from 'geojson';
import { NextApiHandler } from 'next';
import winkNLP from 'wink-nlp';
// @ts-ignore
import its from 'wink-nlp/src/its';
// @ts-ignore
import model from 'wink-eng-lite-model';
// @ts-ignore
import nlpC from 'compromise';

const nlp = winkNLP(model);

const baseUrl = 'https://www.reddit.com/r';

interface SubredditData {
  data: {
    children: { data: RedditPost }[];
  };
}

interface RedditPost {
  title: string;
  selftext_html: string;
  selftext: string;
}

const getLocation = (text: string) => {
  let doc = nlpC(text);
  let str = doc.places();
  return str.json().values[0]?.text;
};

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

      const data = (await resp.json()) as SubredditData;
      const allDateData = (await Promise.all(
        data.data.children.map(async (x: { data: RedditPost }) =>
          convertPostToFeature(x.data),
        ),
      )) as Feature[];
      // @ts-ignore
      const removeUndefined = allDateData.filter((x) => x);
      console.log({ g: removeUndefined[0].geometry });
      return res.json({
        features: removeUndefined,
        type: 'FeatureCollection',
      } as FeatureCollection);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error });
    }
  }
  return res.status(404).send({ error: 'Not Found' });
};

export default handler;

const convertPostToFeature = async (post: RedditPost) => {
  const title = post.title;
  const body = post.selftext_html;
  const timelineDates = parseDateFromText(post.selftext);
  const location = getLocation(post.selftext);
  const coord = await getGeocoding(location);
  return timelineDates.length > 0 && coord
    ? ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coord,
        },
        properties: {
          date: timelineDates.map((x) => x.date),
          unixTime: timelineDates.map((x) => x.unixTime),
          title,
          body,
        },
      } as Feature)
    : undefined;
};

const getGeocoding = async (location: string) => {
  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=pk.eyJ1IjoibnJnYXBwbGUiLCJhIjoiY2trN2E1YnVvMGJ4OTJwbWptM25waHVmNyJ9.UxvOXdAatpV-H1AXQQ23Kg`,
  );
  const data = (await resp.json()) as FeatureCollection;
  return (data?.features[0]?.geometry as Point).coordinates;
  console.log('data', data);
};

const parseDateFromText = (text: string) => {
  const timelines: any[] = [];
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
      let date = e.out();
      const hasLetters = /[a-zA-Z]/i.test(date);
      if (hasLetters) {
        const isAD = /[aA]/i.test(date);
        date = date.replace(/\D/g, '');
        if (!isAD) {
          date = '-'.concat(date);
        }
      }
      timelines.push({
        date,
        unixTime: new Date(date).getTime() / 1000,
      });
    });

  return timelines;
};
