import '../styles/index.css';
import { AppProps } from 'next/app';
//@ts-ignore
import { disableBodyScroll } from 'body-scroll-lock';
import { useEffect } from 'react';
import { QueryProvider } from '../hooks/useQuery';
import { StateProvider, useAppState } from '../hooks/useState';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import FeedbackWidget from '../components/feedback';
import '../components/feedback/styles.css';
import ReactGA4 from 'react-ga4';

ReactGA4.initialize(process.env.NEXT_GA_MEASUREMENT_ID);

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    disableBodyScroll(document.querySelector('body') as HTMLBodyElement);
  }, []);
  return (
    <QueryProvider>
      <StateProvider>
        <FeedbackWrapper />
        <Component {...pageProps} />
      </StateProvider>
    </QueryProvider>
  );
}

function FeedbackWrapper() {
  const {
    state: { hide },
  } = useAppState();
  return (
    <>
      {!hide && (
        <FeedbackWidget
          title="Hey There 👋"
          description="Let me know how I can make this better or just give me a 😊. (Map data is not mine. Please create an issue from the github link in the bottom right to help them fix any issues.)"
          themeColor="#6930c3"
          textColor="white"
          customIcon={<div style={{ fontSize: 30 }}>👋</div>}
          type="full"
          metadata={process.env.NODE_ENV === 'development' ? { dev: true } : {}}
        />
      )}
    </>
  );
}
