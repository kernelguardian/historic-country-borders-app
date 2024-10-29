import Image from 'next/image';

interface FooterProps {
  dataUrl?: string;
  lastCommit?: Date;
  discussionUrl?: string;
}

export default function Footer({
  dataUrl = 'https://github.com/nrgapple/historicborders-timeline-example',
  lastCommit,
  discussionUrl,
}: FooterProps) {
  return (
    <div className="footer">
      <div>
        {!!lastCommit && (
          <div className="last-commit">
            <span>
              Maps Updated:{' '}
              {lastCommit.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
      <div className="footer-right">
        <div>
          Data from <a href={dataUrl}>here</a>.
          {/* Create your own data{' '}
          <a href="https://github.com/nrgapple/historicborders-timeline-example">
            here
          </a>{' '} */}
        </div>
        {/* <div>
          <a href="https://github.com/nrgapple/historic-country-borders-app">
            ⭐️ Star this on Github!
          </a>
        </div> */}
        <div>
          <a href={"https://historicborders.app/"}>Original Creator</a>
          {/* Hosting on my own because I will use it frequently and needs to add custom data */}
        </div>
      </div>
    </div>
  );
}
