import MapContainer from '../../../components/ViewerMap';
import React, { useEffect, useMemo, useState } from 'react';
import ReactGA from 'react-ga';
import {
  authedFetcher,
  convertYearString,
  getYearFromFile,
  githubToken,
  mapBCFormat,
  mod,
} from '../../../util/constants';
import Footer from '../../../components/Footer';
import NavBar from '../../../components/NavBar';
import Timeline from '../../../components/Timeline';
import ReactTooltip from 'react-tooltip';
import useKeyPress from '../../../hooks/useKeyPress';
import { GetServerSideProps } from 'next';
import { Octokit } from '@octokit/core';
import { ConfigType, GithubFileInfoType } from '../../../util/types';
import Layout from '../../../components/Layout';
import { useRouter } from 'next/router';
import { Auth, Button, Icon, Modal, Space, Typography } from '@supabase/ui';
import { supabase } from '../../../util/initSupabase';
import useSWR from 'swr';
import Link from 'next/link';

ReactGA.initialize('UA-188190791-1');

interface DataProps {
  years: number[];
  user: string;
  id: string;
  config: ConfigType;
  isGlobe: boolean;
}

const Viewer = ({
  years,
  user,
  id,
  config,
  isGlobe: isGlobeProp,
}: DataProps) => {
  const [index, setIndex] = useState(0);
  const [hide, setHide] = useState(false);
  const [help, setHelp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGlobe, setIsGlobe] = useState(isGlobeProp);
  const isMobile =
    typeof window !== 'undefined'
      ? /Mobi|Android/i.test(navigator.userAgent)
      : false;
  const aPress = useKeyPress('a');
  const dPress = useKeyPress('d');
  const router = useRouter();

  // Auth
  const { user: authUser, session } = Auth.useUser();
  console.log('session', session);
  const { data, error } = useSWR(
    session ? ['/api/getUser', session.access_token] : null,
    authedFetcher,
  );
  const [authView, setAuthView] = useState('sign_in');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') setAuthView('forgotten_password');
        if (event === 'USER_UPDATED')
          setTimeout(() => setAuthView('sign_in'), 1000);
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json());
      },
    );

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dPress) {
      setIndex(mod(index + 1, years.length));
    }
  }, [dPress]);

  useEffect(() => {
    if (aPress) {
      setIndex(mod(index - 1, years.length));
    }
  }, [aPress]);

  useEffect(() => {
    ReactGA.pageview(`/?view=${isGlobe ? 'globe' : 'map'}`);
  }, [isGlobe]);

  const View = () => {
    if (!authUser)
      return (
        <Space direction="vertical" size={8}>
          <div>
            <Typography.Title level={3}>
              Please Sign in or Sign up to Historic Borders!
            </Typography.Title>
          </div>
          <Auth
            supabaseClient={supabase}
            providers={['google', 'github']}
            view={authView as any}
            socialLayout="horizontal"
            socialButtonSize="xlarge"
          />
        </Space>
      );

    return (
      <Space direction="vertical" size={6}>
        {authView === 'forgotten_password' && (
          <Auth.UpdatePassword supabaseClient={supabase} />
        )}
        {authUser && (
          <>
            <Typography.Text>You're signed in</Typography.Text>
            <Typography.Text strong>Email: {authUser?.email}</Typography.Text>

            <Button
              icon={<Icon src="LogOut" />}
              type="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Log out
            </Button>
            {error && (
              <Typography.Text type="danger">
                Failed to fetch user!
              </Typography.Text>
            )}
            {data && !error ? (
              <>
                <Typography.Text type="success">
                  User data retrieved server-side (in API route):
                </Typography.Text>

                <Typography.Text>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </Typography.Text>
              </>
            ) : (
              <div>Loading...</div>
            )}

            <Typography.Text>
              <Link href="/profile">
                <a>SSR example with getServerSideProps</a>
              </Link>
            </Typography.Text>
          </>
        )}
      </Space>
    );
  };

  if (!(years && user && id && config))
    return <div>Not a valid timeline. Check your url.</div>;

  return (
    <>
      <Layout title={config.name} url={`https://historyborders.app`}>
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
            <ReactTooltip
              resizeHide={false}
              id="globeTip"
              place="left"
              effect="solid"
              globalEventOff={isMobile ? 'click' : undefined}
            >
              {isGlobe ? 'Switch to Map View' : 'Switch to Globe View'}
            </ReactTooltip>
          </>
        )}
        <div
          data-tip
          data-for="fullscreenTip"
          data-delay-show="300"
          className="fullscreen"
          onClick={() => setHide(!hide)}
          style={{ top: hide ? '16px' : '165px' }}
        >
          <div className="noselect">🔭</div>
        </div>
        <div
          data-tip
          data-for="globeTip"
          data-delay-show="300"
          className="globe"
          onClick={() => {
            setIsGlobe(!isGlobe);
            router.replace({
              path: '',
              query: { view: !isGlobe ? 'globe' : 'map' },
            });
          }}
          style={{ top: hide ? '73px' : '222px' }}
        >
          <div className="noselect">{isGlobe ? '🗺' : '🌎'}</div>
        </div>
        <div className={`${hide ? 'app-large' : 'app'}`}>
          {!hide && (
            <>
              <NavBar
                onHelp={() => setHelp(!help)}
                showHelp={help}
                title={config.name}
              />
              <Timeline index={index} onChange={setIndex} years={years} />
            </>
          )}
          <MapContainer
            year={convertYearString(mapBCFormat, years[index])}
            fullscreen={hide}
            user={user}
            id={id}
            threeD={isGlobe}
          />
          {!hide && (
            <Footer
              dataUrl={`https://github.com/aourednik/historical-basemaps`}
            />
          )}
        </div>
        {
          <Modal visible>
            <View />
          </Modal>
        }
      </Layout>
    </>
  );
};

export default Viewer;

export const getServerSideProps: GetServerSideProps<DataProps> = async ({
  query,
  params,
}) => {
  const isGlobe = query?.view === 'globe' ? true : false;
  if (params && params.user && params.id) {
    try {
      const octokit = new Octokit({ auth: githubToken });
      const configRes = await fetch(
        `https://raw.githubusercontent.com/${params.user}/historicborders-${params.id}/main/config.json`,
      );
      var config: ConfigType = await configRes.json();
      config.default = false;
      const fileResp = await octokit.request(
        `/repos/${params.user}/historicborders-${params.id}/contents/years`,
      );
      const files: GithubFileInfoType[] = fileResp.data;
      const years = files
        .map((x) => getYearFromFile(x.name))
        .sort((a, b) => a - b);
      return {
        props: {
          years,
          user: params.user,
          id: params.id,
          config,
          isGlobe,
        } as DataProps,
      };
    } catch (e) {
      console.log(e);
    }
  }
  return {
    props: {
      isGlobe,
    } as DataProps,
  };
};
