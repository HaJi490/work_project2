'use client'

import { useEffect, useState } from "react"
import style from './FilterModal.module.css'

interface Props{
    isOpen: boolean;
    onClose: () => void;
}

export default function Filter({isOpen, onClose}: Props) {
    const [canUse, setCanUse] = useState(false);
    const [parkingFree, setParkingFree] = useState(false);
    const [limitYn, setLimitYn] = useState(false);

    useEffect(() => {
        // 모달 열릴 때 스크롤 방지
        if(isOpen) {
            document.body.style.overflow = 'hidden';
        } else{
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity/50">
        {/* 헤더 */}
        <div className="bg-white rounded-lg w-full max-w-xl p-6 relative">
            <button
            className="absolute top-4 right-4 text-2xl"
            onClick={onClose}
            >
            &times;
            </button>

            <h2 className="mb-4 font-bold">필터</h2>
            {/* 탭메뉴  */}
            <div className="flex gap-4 border-b pb-2 mb-4" style={{borderColor:'#f2f2f2'}}>
                {/* 사용가능, 개방여부, 무료주차 */}
                {/* 탐색반경, 충전속도, 커넥터 타입 */}
                {/* 운영기관, 충전사, 멤버십 */}
                <button className={style.filterList}>속성</button> 
                <button className={style.filterList}>탐색반경</button>
                <button className={style.filterList}>충전속도</button>
                <button className={style.filterList}>커넥터</button>
                <button className={style.filterList}>멤버십</button>
                <button className={style.filterList}>충전사</button>
            </div>
            {/* 설정 */}
            <h4 className="mb-2" style={{color:'#666'}}>속성</h4>
            <div className="flex gap-4 mb-4">
                <button className={style.propYn}>충전가능</button>
                <button className={style.propYn}>개방여부</button>
                <button className={style.propYn}>무료주차</button>
            </div>
            <h4 className="mb-2" style={{color:'#666'}}>탐색반경</h4>
            <div className="mb-4">
                
                {/* 트랙 */}
                <div className="top-1/2 left-0 right-0 h-1 bg-gray-300 rounded-full -translate-y-1/2" />
            </div>

            <h4 className="mb-2" style={{color:'#666'}}>충전속도</h4>
            <div className="flex gap-4 mb-4">
                <button className={style.propYn}>완속</button>
                <button className={style.propYn}>중속</button>
                <button className={style.propYn}>급속</button>
            </div>
        </div>
    </div>
  )
}
