'use client'

import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { accessTokenAtom, tokenExpireAtAtom } from '@/store/auth'

export default function TokenExpireWatcher() {
    const [, setToken] = useAtom(accessTokenAtom)
    const [expireAt, setExpireAt] = useAtom(tokenExpireAtAtom)
    const route = useRouter();

    // 마운트시에도 체크
    useEffect(() => {
    if (expireAt && Date.now() > expireAt) {
        setToken(null);
        setExpireAt(null);
        route.push('/login?toast=자동 로그아웃 되었습니다.');
    }
    }, []);

    // 1. 자동로그아웃 타이머
    useEffect(() => {
        const timer = setInterval(() => {
            if (expireAt && Date.now() > expireAt) {
                setToken(null)
                setExpireAt(null)
                // alert('자동 로그아웃 되었습니다.')
                route.push('/login?toast=자동 로그아웃 되었습니다.');
            }
        }, 60000) // 1분마다 검사

        return () => clearInterval(timer)
    }, [expireAt])

    // 2. 유저활동 감지 -> 만료시간 연장
    useEffect(() => {
        const extendExpireTime = () => {
        if (expireAt) {
            const newExpireAt = Date.now() + 2 * 60 * 60 * 1000;
            setExpireAt(newExpireAt)
        }
        }

        const events = ['click', 'keydown', 'scroll', 'mousemove'];
        events.forEach(event =>
        window.addEventListener(event, extendExpireTime)
        );

        return () => {
        events.forEach(event =>
            window.removeEventListener(event, extendExpireTime)
        );
        };
    }, [expireAt])


    return null // 이 컴포넌트는 UI에 아무것도 안 보여줌
}