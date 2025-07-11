import React from 'react'

import style from './mypage.module.css'
import { FiEdit } from "react-icons/fi";
import { PiBatteryPlus } from "react-icons/pi"; // 충전횟수
import { BsLightningCharge } from "react-icons/bs"; // 빈 번개
import { BsLightningChargeFill } from "react-icons/bs"; // 안 빈 번개
import { ImCoinDollar } from "react-icons/im";  // 충전금액
import { LuTimer } from "react-icons/lu";   // 걸린시간

export default function page() {
    const firstResp = {
        username: '홍길동',
        userId: 'member1',
        // 차량
        evCars:[
            {
                brand: '테슬라',
                model: '테슬라 테슬라_모델S',
                mainModel: true,    // 대표차량
            }
        ],
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

    const stripBrandFromModel = (brand: string, model: string) => {
        if(!brand) return model.trim();

        // 비교를 위해 소문자, 공백, '_' 제거
        const brandKey = brand.replace(/\s+/g, " ").toLowerCase();
        
        // 공백 단위로 분리해 브랜드 토큰제외
        const filteredTokens = model
            .split(/\s+/)                        // 공백 기준 분리
            .filter(token => {
            const normalized = token.replace(/_/g, "").toLowerCase();
            return normalized !== brandKey;    // brand와 동일하면 제외
            });

        // 토큰 재조합, 남은 '_' 공백으로
        return filteredTokens
            .join(" ")
            .replace(/_/g, " ")   // 예: "테슬라_모델S" → "테슬라 모델S"
            .replace(/\s+/g, " ") // 여분 공백 제거
            .trim();

    }

    
  return (
    <div className='w-full min-h-screen flex justify-center bg-[#F7F9FA]'>
    <div className='w-7/10 max-w-[1300px] flex gap-5 pt-15'>
        {/* 왼쪽 */}
        <div className='flex-1/3 p-6 bg-white shadow-md rounded-xl bg-opacity-50 '>
            <div className='flex justify-between items-center mb-5'>
                <div>
                    <p className='font-bold text-[19px]'>{firstResp.username}</p>
                    <p className='text-[#afafaf] text-[15px]'>ID: {firstResp.userId}</p>
                </div>
                <span className='text-[20px] text-[#afafaf] bg-[#f2f2f2] p-2 rounded-full'><FiEdit /></span>
            </div>
            <div className='border border-[#f2f2f2] shadow-md rounded-lg p-3'>
                {firstResp.evCars.map((ev) => (
                    <div key={ev.model}>
                        <p className='text-md font-semibold'>
                            {stripBrandFromModel(ev.brand, ev.model)}
                            {ev.mainModel && <span className='bg-[#EBFAD3] text-[#568811] text-xs rounded-full px-2 py-1 ml-2'>main</span>}
                        </p> 
                        <p className='text-sm text-[#6B6B6B]'>{ev.brand}</ p>
                    </div>
                ))}
            </div>
        </div>
        {/* 오른쪽 */}
        <div className='flex-2/3'>
            {/* 마이페이지 네비 */}
            <div>

            </div>
            <div className="grid grid-cols-3 gap-6 mb-7">
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h4 className="text-sm text-[#6B6B6B] flex gap-2 mb-5">
                        <span className='pt-[1px]'><PiBatteryPlus /></span>
                        월 충전횟수
                    </h4>
                    <p className="text-2xl font-semibold text-[#4FA969]">{firstResp.monthlyChargeCount}회</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h4 className="text-sm text-[#6B6B6B] flex gap-2 mb-5">
                        <span className='pt-[1px]'><BsLightningChargeFill /></span>
                        월 충전량
                    </h4>
                    <p className="text-2xl font-semibold text-[#4FA969]">{firstResp.monthlyChargeAmount}kWh</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h4 className="text-sm text-[#6B6B6B] flex gap-2 mb-5">
                        <span className='pt-[1px]'><ImCoinDollar /></span>
                        월 지출비용
                    </h4>
                    <p className="text-2xl font-semibold text-[#4FA969]">{firstResp.monthlyChargeCost}원</p>
                </div>
            </div>
            {/* 충전목록 */}
            <h4 className='font-bold text-[#6B6B6B] ml-3 mb-2'>나의 충전기록</h4>
            <div>
                {firstResp.chargingHistory.map((history) => {
                    const chargeInfoList = [
                            {
                                icon: <BsLightningChargeFill />,
                                label: `${history.chargeAmount} kWh`,
                            },
                            {
                                icon: <ImCoinDollar />,
                                label: `${history.chargeCost}원`,
                            },
                            {
                                icon: <LuTimer />,
                                label: `${history.chargeDuration}분`,
                            },
                        ];

                    return(
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className='mb-3'>
                                <p className="text-sm text-[#afafaf]">{history.chargeDate}</p>
                                <h3 className="text-lg font-semibold text-[#2F2F2F]">{history.statNm}</h3>
                            </div>
                            <div className='bg-[#f2f2f2] inline-flex items-center px-3 py-1 rounded-lg'>
                                {chargeInfoList.map((item, i, arr) => (
                                        <React.Fragment key={i}>
                                            <div className='flex items-center'>
                                                <p className='flex items-center p-2 gap-1 text-black text-sm leading-tight'>
                                                    <span className='mt-[1px] text-[#6B6B6B]'>{item.icon}</span> 
                                                    <span className='whitespace-nowrap'>{item.label}</span>
                                                </p>
                                                { i < arr.length - 1 && (<span className="mx-2 text-[#ccc] text-sm">|</span>)}
                                            </div>
                                        </React.Fragment>
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
    </div>
  )
}
