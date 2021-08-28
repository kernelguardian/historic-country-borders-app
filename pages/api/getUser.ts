import { NextApiHandler } from 'next';
import { supabase } from '../../util/initSupabase';

const getUser: NextApiHandler = async (req, res) => {
  const token = req.headers.token as string;
  console.log('token', token);
  const { data: user, error } = await supabase.auth.api.getUser(token);
  console.log('user', user);
  if (error) return res.status(401).json({ error: error.message });
  return res.status(200).json(user);
};

export default getUser;
