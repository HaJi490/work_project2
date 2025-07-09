'use client'

import React from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image'

import style from './Nav.module.css'
import { FiUser } from "react-icons/fi";
import { FiLogIn } from "react-icons/fi";
import Link from 'next/link';


export default function Nav() {
  const route = useRouter();

  

  return (
    <div className={style.navContainer}>
      {/* 로고 */}
      <div className={style.logoBox}>
        <Link href="/">
          <Image src="/gwLogo.png" alt='gw로고' width={150} height={80} priority/>
        </Link>
        
      </div>
      {/* 중앙 메뉴 */}
      <ul className={style.menu}>
        <li>충전스케줄링</li>
        <li>이용안내</li>
        <li>회사소개</li>
      </ul>
      {/* 우측 버튼 */}
      <div className={style.authBox}>
        <button onClick={()=>{route.push('/login')}} className='cursor-pointer'><FiUser/></button>
        <button onClick={()=>{route.push('/login')}} className='cursor-pointer'><FiLogIn/></button>
      </div>
    </div>

  )
}
