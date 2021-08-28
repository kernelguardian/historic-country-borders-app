import Link from 'next/link';
import { supabase } from '../../util/initSupabase';
import { GetServerSideProps } from 'next';
import { User } from '../../util/types';

interface ProfileProps {
  user: User;
}

const Profile = ({ user }: ProfileProps) => {
  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <div className="flex--row">
        <p>You're signed in</p>
        <p>Email: {user.email}</p>
        <p>
          User data retrieved server-side (from Cookie in getServerSideProps):
        </p>

        <p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </p>

        <p>
          <Link href="/">
            <a>Static example with useSWR</a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({
  req,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    // If no user, redirect to index.
    return { props: {}, redirect: { destination: '/', permanent: false } };
  }

  // If there is a user, return it.
  return { props: { user } as ProfileProps };
};
