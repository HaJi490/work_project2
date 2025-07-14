'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { useAtom } from 'jotai';

import style from './Nav.module.css'
import { FiUser } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import Link from 'next/link';
import { setLazyProp } from 'next/dist/server/api-utils';
import { accessTokenAtom, isLoggedInAtom } from '@/store/auth';


export default function Nav() {
  const route = useRouter();
  const [token, setToken] = useAtom(accessTokenAtom); // setter로 토큰 직접조작
  const [isLoggedin] = useAtom(isLoggedInAtom);

  // useEffect(()=> {
  //   const token = localStorage.getItem('accessToken');

  //   if(token) setIsLoggedIn(true);
  //   else setIsLoggedIn(false);
    
  // }, [route.pathname])  // 페이지 이동 시마다 token 검사

  const handleLogout = () => {
    setToken(null);
    alert("로그아웃 되었습니다.");
    route.push('/login');
  };

  return (
    <div className={style.navContainer}>
      {/* 로고 */}
      <div className={`${style.logoBox} cursor-pointer`} onClick={()=>{route.push('/')}}>
        <Link href="/">
          <Image src="/gwLogo.png" alt='gw로고' width={150} height={80} priority/>
        </Link>
        
      </div>
      {/* 중앙 메뉴 */}
      <ul className={style.menu}>
        <li>회사소개</li>
        <li>이용안내</li>
        <li onClick={()=>{route.push('/')}} className='cursor-pointer'>충전소 찾기</li>
        <li>충전스케줄링</li>
      </ul>
      {/* 우측 버튼 */}
      <div className={style.authBox}>
        {isLoggedin ? 
          <div className='flex gap-4'>
          <button onClick={()=>{route.push('/mypage')}} className='cursor-pointer text-[23px] text-[#666]'><FiUser/></button>
          <button onClick={()=>{handleLogout()}} className='cursor-pointer text-[23px] text-[#666]'><FiLogOut/></button>
          </div>
          : <button onClick={()=>{route.push('/login')}} className='px-6 py-2 rounded bg-[#4FA969] text-white cursor-pointer'>로그인</button>
        }
      </div>
    </div>

  )
}
