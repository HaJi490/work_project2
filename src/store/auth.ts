import {atom} from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/* 1. 실제 토큰 저장용 – localStorage('accessToken')와 동기화 */
export const accessTokenAtom = atomWithStorage<string | null > ('accessToken', null);

/* 2. 파생 아톰 – 토큰 존재 여부만 true/false로 */
export const isLoggedInAtom = atom((get)=>!!get(accessTokenAtom));