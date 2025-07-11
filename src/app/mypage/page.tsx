import React from 'react'

import style from './mypage.module.css'
import { FiEdit } from "react-icons/fi";

export default function page() {
    const firstResp = {
        username: '홍길동',
        userId: 'member1',
        // 차량
        model: '테슬라 테슬라_모델S',
        mainModel: true,    // 대표차량
        // 충전히스토리
        monthlyChargeCount: 5,      // 월충전횟수
        monthlyChargeAmount: 300,   // 월 kWh
        monthlyChargeCost: 50000,   // 월 충전금액
        chargingHistory: [
            {
                statNm: "부산119안전체험관",
                chgerId: '01',
                chargeDate: '2025.07.01',   // 충전한 날짜
                chargeSTime: '14:20',       // 충전시작 시간
                chargeETime: '15:40',       // 충전완료 시간
                chargeAmount: 12.5,
                chargeCost: 3200,
                chargeDuration: 80, // 충전하는데 걸린 시간(분)
                isReserved: true,
                reservedSTime: '13:30', // 예약 시작시간
                reservedETime: '15:30', // 예약 완료시간
                chgerType: '06',        // 충전기 종류(급/완)
                busiNm: '환경부'
            }
        ]
    }

    

    
  return (
    <div className='w-full min-h-screen flex justify-center bg-[#F7F9FA]'>
    <div className='w-7/10 max-w-[1100px] flex pt-15'>
        {/* 왼쪽 */}
        <div className='flex-1/3 px-3 py-5 bg-white shadow-md rounded-xl '>
            <div className='flex justify-between items-center'>
                <div>
                    <p className='font-bold text-[19px]'>{firstResp.username}</p>
                    <p className='text-[#afafaf] text-[15px]'>ID: {firstResp.userId}</p>
                </div>
                <span className='text-[20px] text-[#afafaf] bg-[#f2f2f2] p-2 rounded-full'><FiEdit /></span>
            </div>
            <div className='border'>
                <p>{firstResp.model}{firstResp.mainModel && <span className='bg-[#EBFAD3] text-[#568811] rounded-full px-2 py-1'>main</span>}</ p>
            </div>
        </div>
        {/* 오른쪽 */}
        <div className='flex-2/3'>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h4 className="text-lg font-bold text-[#2F2F2F]">총 충전 횟수</h4>
                    <p className="text-2xl font-semibold text-[#4FA969]">3회</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h4 className="text-lg font-bold text-[#2F2F2F]">총 사용량</h4>
                    <p className="text-2xl font-semibold text-[#4FA969]">000kWh</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#2F2F2F]">충전소 이름</h3>
                <p className="text-sm text-[#6B6B6B]">서울 강남구</p>
            </div>
        </div>
    </div>
    </div>
  )
}
