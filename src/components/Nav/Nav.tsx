'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image'

import style from './Nav.module.css'
import { FiUser } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { FiLogIn } from "react-icons/fi";
import { setLazyProp } from 'next/dist/server/api-utils';


export default function Nav() {
  const route = useRouter();
  const [isLoggedin, setIsLoggedIn] = useState<boolean>(false);

  useEffect(()=> {
    const token = localStorage.getItem('accessToken');

    if(token) setIsLoggedIn(true);
    else setIsLoggedIn(false);
    
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    // setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    route.push('/login');
  };

  return (
    <div className={style.navContainer}>
      {/* 로고 */}
      <div className={`${style.logoBox} cursor-pointer`} onClick={()=>{route.push('/')}}>
        <Image src="/gwLogo.png" alt='gw로고' width={150} height={80} priority/>
      </div>
      {/* 중앙 메뉴 */}
      <ul className={style.menu}>
        <li>ㅇㅇ소개</li>
        <li>이용안내</li>
        <li onClick={()=>{route.push('/')}} className='cursor-pointer'>충전소찾기</li>
        <li>충전스케줄링</li>
      </ul>
      {/* 우측 버튼 */}
      <div className={style.authBox}>
        {isLoggedin ? 
          <div className='flex gap-4'>
          <button onClick={()=>{route.push('/login')}} className='cursor-pointer text-[23px] text-[#666]'><FiUser/></button>
          <button onClick={()=>{handleLogout()}} className='cursor-pointer text-[23px] text-[#666]'><FiLogOut/></button>
          </div>
          : <button onClick={()=>{route.push('/login')}} className='px-6 py-2 rounded bg-[#4FA969] text-white cursor-pointer'>로그인</button>
        }
      </div>
    </div>

  )
}
