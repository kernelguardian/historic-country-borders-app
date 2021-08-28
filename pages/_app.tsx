import '../styles/index.css';
import '../styles/flex-box.css';
import { AppProps } from 'next/app';
//@ts-ignore
import { disableBodyScroll } from 'body-scroll-lock';
import { useEffect, useRef } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { Auth } from '@supabase/ui';
import { supabase } from '../util/initSupabase';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    disableBodyScroll(document.querySelector('body'));
  }, []);
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </Auth.UserContextProvider>
  );
}
