import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import { SymbolLayout } from 'mapbox-gl';
import { useEffect, useState } from 'react';
import { FeatureCollectionOptStyle, MapStyle, Theater } from '../util/types';
import {
  oldLayout,
  inUseLayout,
  deadLayout,
  currentLayout,
} from '../util/mapStyles';

export type TheaterData = [
  old: FeatureCollectionOptStyle,
  dead: FeatureCollectionOptStyle,
  inUse: FeatureCollectionOptStyle,
  current: FeatureCollectionOptStyle,
  //unknowns: FeatureCollection,
];

export const useRomeData = (year: number, theaters: Theater[]) => {
  const [data, setData] = useState<TheaterData | []>([]);

  const diff = (main: Theater[], other: Theater[]) =>
    main.filter((x) => !other.some((y) => y.id === x.id));

  const injectLayout = (fe: FeatureCollection, style: MapStyle) =>
    ({
      ...fe,
      style,
    } as FeatureCollection);

  const toFeatureCollection = (theaters: Theater[]) => {
    return {
      type: 'FeatureCollection',
      features: theaters.map(
        ({
          feature: { geometry },
          title,
          created,
          lastUse,
          capacity,
          emperor,
          chronoGroup,
          id,
        }) =>
          ({
            type: 'Feature',
            geometry: geometry,
            properties: {
              id,
              title,
              created,
              lastUse,
              capacity,
              emperor,
              chronoGroup,
            } as GeoJsonProperties,
          } as Feature),
      ),
    } as FeatureCollection;
  };

  const convert = (year: number, theaters: Theater[]) => {
    const unknowns = theaters.filter((x) => !x.created);
    const notUnknown = diff(theaters, unknowns);
    console.log(
      'notUnknown',
      notUnknown.filter((x) => !x.created),
    );
    const currentTh = notUnknown.filter((x) => x.created === year);
    const notCurrent = diff(notUnknown, currentTh);
    const inUses = notCurrent.filter((x) => {
      if (x.lastUse) {
        return year > x.created! && year < x.lastUse;
      }
      const difference = year - x.created!;
      return difference < 100 && difference > 0;
    });
    const notInUses = diff(notCurrent, inUses);
    const notBorn = notInUses.filter((x) => x.created! > year);
    const live = diff(notInUses, notBorn);
    const deads = live.filter((x) => {
      if (x.lastUse) {
        return year > x.lastUse;
      }
      return false;
    });
    const notDeads = diff(live, deads);

    const olds = notDeads.filter((x) => x.created !== year);

    setData(
      (curr) =>
        [
          injectLayout(toFeatureCollection(olds), oldLayout),
          injectLayout(toFeatureCollection(deads), deadLayout),
          injectLayout(toFeatureCollection(inUses), inUseLayout),
          injectLayout(toFeatureCollection(currentTh), currentLayout),
          //toFeatureCollection(unknowns),
        ] as TheaterData,
    );
  };

  useEffect(() => {
    if (year && theaters) {
      convert(year, theaters);
    }
  }, [year, theaters]);

  return data;
};
