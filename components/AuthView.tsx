import { Auth, Typography, Space, Button, Icon } from '@supabase/ui';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { authedFetcher } from '../util/constants';
import { supabase } from '../util/initSupabase';

const AuthView = () => {
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

  return <View />;
};

export default AuthView;
