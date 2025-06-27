import React from 'react'
import Image from 'next/image'
import style from './Nav.module.css'
import { FiUser } from "react-icons/fi";
import { FiLogIn } from "react-icons/fi";

export default function Nav() {
  return (
    <div className={style.navContainer}>
      {/* 로고 */}
      <div className={style.logoBox}>
        <Image src="/gwLogo.png" alt='gw로고' width={150} height={80} />
      </div>
      {/* 중앙 메뉴 */}
      <ul className={style.menu}>
        <li>ㅇㅇ소개</li>
        <li>이용안내</li>
        <li>충전소찾기</li>
        <li>충전스케줄링</li>
      </ul>
      {/* 우측 버튼 */}
      <div className={style.authBox}>
        <span><FiUser/></span>
        <span><FiLogIn/></span>
      </div>
    </div>

  )
}
