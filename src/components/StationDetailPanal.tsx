import React from 'react'
import { ChargingStationResponseDto, ChargerInfoMap, ChargerInfoItem } from '@/types/dto'

interface StationDetailPanalProps {
    station: ChargingStationResponseDto;
    onClose: () => void;
}

export default function StationDetailPanal({ station, onClose }: StationDetailPanalProps) {
    if (station == null) return null;

    return (
        <div className="absolute top-125 left-155 h-full -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-20 w-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4FA969]">{station.statNm}</h3>
                <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>
                    &times;
                </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{station.addr}</p>

            <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-1">충전기 정보</h4>
                <div className="flex items-center text-sm text-gray-700 mb-1">
                    <span className="mr-2">사용 가능:</span>
                    <span className="font-bold text-[#4FA969]">{station.chargeNum}</span> / {station.totalChargeNum} 대
                </div>
                {/* 이미지에 있는 AC3상, DC콤보와 같은 상세 정보는 ChargingStationResponseDto에 해당 필드가 있다면 추가 */}
                {/* 예시: station.chargerTypeDetails && station.chargerTypeDetails.map(...) */}
            </div>

            <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-1">운영 정보</h4>
                <p className="text-sm text-gray-700">
                    주차: {station.parkingFree ? '무료' : '유료'}
                </p>
                <p className="text-sm text-gray-700">
                    운영 상태: {station.limitYn ? '개방' : '비개방'}
                </p>
                {/* 운영 시간, 전화번호 등 추가 정보가 DTO에 있다면 여기에 표시 */}
                {station.chargerInfo['01'].useTime && <p className="text-sm text-gray-700">운영 시간: {station.chargerInfo['01'].useTime}</p>}
                {station.chargerInfo['01'].busiNm && <p className="text-sm text-gray-700">문의: {station.chargerInfo['01'].busiNm}</p>}
            </div>

            <div className=''>
                <h4>충전기 상태</h4>
                {Object.entries(station.chargerInfo as ChargerInfoMap).map(
                    ([chgerId, charger]: [string, ChargerInfoItem]) => {
                    const stat = charger.stat;
                    const lastTsdt = charger.lastTsdt;
                    const nowTsdt = charger.nowTsdt;
                    const chgerType = charger.chgerType;

                    return(
                        <div key={chgerId} className="mb-2">
                            <p>충전기 {chgerId}</p>
                            <p>상태: {stat}</p>
                            <p>시작 시간: {nowTsdt}</p>
                            <p>종료 시간: {lastTsdt}</p>
                            <p>타입: {chgerType}</p>
                        </div>
                    )

                })}
            </div>

            {/* 현재 위치에서 소모 예상 정보는 추가적인 계산 로직이 필요하므로 제외 */}

            <div className="mt-4 text-right">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#4FA969] text-white rounded hover:bg-green-700"
                >
                    확인
                </button>
            </div>
        </div>
    )
}
