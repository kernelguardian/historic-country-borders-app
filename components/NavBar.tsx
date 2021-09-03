import { User } from '@supabase/gotrue-js';
import { Modal } from '@supabase/ui';
import { AuthUser } from '../util/types';
import AuthView from './AuthView';
import Help from './Help';

interface NavBarProps {
  title: string;
  author?: string;
  onHelp?: () => void;
  showHelp?: boolean;
  onAuth?: () => void;
  showAuth?: boolean;
  user: User | null;
}

const NavBar = ({
  onHelp,
  showHelp,
  title,
  onAuth,
  showAuth,
  user,
}: NavBarProps) => (
  <div className="nav-bar">
    <div className="title drop">🌍 {title}</div>
    <div className="help-icon" onClick={onAuth}>
      {user ? 'Sign in' : 'Hello'}
    </div>
    <div className="help-icon noselect" onClick={onHelp}>
      ❔
    </div>
    {showHelp && <Help />}
    <Modal visible={showAuth ?? false}>
      <AuthView />
    </Modal>
  </div>
);

export default NavBar;
