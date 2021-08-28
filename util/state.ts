import { atom } from 'jotai';
import { User } from './types';

const user = atom<User>({ email: '' });
