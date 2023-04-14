import MapContainer from '../components/ViewerMap';
import React, { useEffect, useMemo, useState } from 'react';
import { convertYearString, mapBCFormat, mod } from '../util/constants';
import Footer from '../components/Footer';
import Timeline from '../components/Timeline';
import ReactTooltip from 'react-tooltip';
import useKeyPress from '../hooks/useKeyPress';
import Layout from '../components/Layout';
import toast, { Toaster } from 'react-hot-toast';
import { useQuery } from '../hooks/useQuery';
import { DataProps } from '../pages';
import { useAppStateSetter, useAppStateValue } from '../hooks/useState';
import { ConfigType } from '../util/types';
import ReactGA4 from 'react-ga4';
import { toastMessages } from '../config/toasts';

ReactGA4.initialize(process.env.NEXT_PUBLIC_GA_FOUR as string);

export default function Viewer({ years, user, id, config }: DataProps) {
  const [hide, setHide] = useState(false);
  const [mounted, setMounted] = useState(false);

  const aPress = useKeyPress('a');
  const dPress = useKeyPress('d');
  const { query, setQuery } = useQuery();
  const [year, setYear] = useState(query?.year);
  const index = useMemo(() => {
    const i = years?.findIndex((y) => y.toString() === year) ?? -1;
    return i === -1 ? 0 : i;
  }, [years]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dPress) {
      const year = years[mod(index + 1, years.length)].toString();
      setQuery({ year });
      setYear(year);
      try {
        ReactGA4.event({
          category: 'Button Press',
          action: 'd press',
          label: 'year',
        });
      } catch (e) {
        console.error(`ga error: ${e}`);
      }
    }
  }, [dPress, query]);

  useEffect(() => {
    if (aPress) {
      const year = years[mod(index - 1, years.length)].toString();
      setQuery({ year });
      setYear(year);
      try {
        ReactGA4.event({
          category: 'Button Press',
          action: 'a press',
          label: 'year',
        });
      } catch (e) {
        console.error(`ga error: ${e}`);
      }
    }
  }, [aPress, query]);

  useEffect(() => {
    ReactGA4.send({
      hitType: 'pageview',
      page: `${query?.year ? `/?year=${query?.year}` : '/'}`,
      title: `${query?.year ? `Year ${query?.year}` : 'Home'}`,
    });
  }, []);

  useEffect(() => {
    toastMessages.forEach(({ message, opts }) => {
      toast(message, opts);
    });
  }, []);

  if (!(years && user && id && config))
    return <div>Not a valid timeline. Check your url.</div>;

  return (
    <>
      <Layout title={config.name} url={`https://historyborders.app`}>
        <Viewer.MenuItem mounted={mounted} vPos={95} />
        <Viewer.Timeline
          index={index}
          years={years}
          onChange={(y) => {
            setQuery({ year: y });
            setYear(y);
          }}
        />
        <Viewer.Map
          user={user}
          id={id}
          config={config}
          year={convertYearString(mapBCFormat, years[index])}
        />
      </Layout>
      <Toaster />
    </>
  );
}

Viewer.Map = (props: {
  user: string;
  id: string;
  config: ConfigType;
  year: string;
}) => {
  const hide = useAppStateValue('hide');
  const { config, user, id, year } = props;
  return (
    <div className={`${hide ? 'app-large' : 'app'}`}>
      <MapContainer year={year} fullscreen={hide} user={user} id={id} />
      <Viewer.Footer config={config} />
    </div>
  );
};

Viewer.Footer = (props: { config: ConfigType }) => {
  const hide = useAppStateValue('hide');
  const { config } = props;
  return (
    <>
      {!hide && (
        <Footer
          dataUrl={`https://github.com/aourednik/historical-basemaps`}
          lastCommit={
            config.commitDate ? new Date(config.commitDate) : undefined
          }
        />
      )}
    </>
  );
};

Viewer.Timeline = (props: {
  index: number;
  years: number[];
  onChange: (year: string) => void;
}) => {
  const hide = useAppStateValue('hide');
  return (
    <>
      {!hide && (
        <>
          <div className="timeline-container">
            <Timeline
              globe={false}
              index={props.index}
              onChange={(v) => {
                const year = props.years[v].toString();
                props.onChange(year);
              }}
              years={props.years}
            />
          </div>
        </>
      )}
    </>
  );
};

Viewer.MenuItem = (props: { mounted: boolean; vPos: number }) => {
  const { mounted, vPos } = props;
  const hide = useAppStateValue('hide');
  const setState = useAppStateSetter();
  const isMobile =
    typeof window !== 'undefined'
      ? /Mobi|Android/i.test(navigator.userAgent)
      : false;
  return (
    <>
      {mounted && (
        <>
          <ReactTooltip
            resizeHide={false}
            id="fullscreenTip"
            place="left"
            effect="solid"
            globalEventOff={isMobile ? 'click' : undefined}
          >
            {hide ? 'Show Timeline' : 'Hide Timeline'}
          </ReactTooltip>
        </>
      )}
      <div
        data-tip
        data-for="fullscreenTip"
        data-delay-show="300"
        className="fullscreen"
        onClick={() => {
          setState((c) => void (c.hide = !hide));
          try {
            ReactGA4.event({
              category: 'UI',
              action: `${hide ? `clicked fullscreen` : 'off fullscreen'}`,
              label: 'fullscreen',
            });
          } catch (e) {
            console.error(`ga error: ${e}`);
          }
        }}
        style={{ top: hide ? `${vPos - 79}px` : `${vPos}px` }}
      >
        <div className="noselect">🔭</div>
      </div>
    </>
  );
};