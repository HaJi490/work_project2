import React from 'react'
import { ChargingStationResponseDto, ChargerInfoMap, ChargerInfoItem } from '@/types/dto'
import codeToNm from '../db/chgerType.json'

interface StationDetailPanalProps {
    station: ChargingStationResponseDto;
    onClose: () => void;
}

export default function StationDetailPanal({ station, onClose }: StationDetailPanalProps) {
    if (station == null) return null;

    // string -> date
    const parseTimestamp = (respDt: string) => {
        const year = parseInt(respDt.substring(0,4));
        const month = parseInt(respDt.substring(5,6)) -1; // js는 0~11월
        const day  = parseInt(respDt.substring(6,8));
        const hour  = parseInt(respDt.substring(8,10));
        const minute  = parseInt(respDt.substring(10,12));
        const second   = parseInt(respDt.substring(12,14));
        
        return new Date(year, month, day, hour, minute, second);
    }

    // 경과시간 계산
    const getTimeAgo = (respDt: string) => {
        const past = parseTimestamp(respDt);
        const now = new Date();
        const diffMs = now.getTime() - past.getTime();

        const diffSeconds = Math.floor(diffMs / 1000)
        const minute = Math.floor(diffSeconds % 60);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays >= 1){
            return `${diffDays}일 전`;
        }else if (diffMinutes >= 1){
            return `${diffHours}시간 ${minute}분 전`;
        } else {
            return '방금 전';
        }
    }

    // 충전기타입으로 변환
    const typeCodeToNm = (chgerCode: string) => {
        const match =  codeToNm.find(type => chgerCode.includes(type.code));
        return match?.type || ''; // 맞는게 있으면 이름(type) 반환, 아니면 ''                      
    } 
    

    return (
        <div className="absolute top-125 left-155 h-full -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-20 w-100 max-h-[80vh] ">
            <div className='h-full flex flex-col overflow-y-auto'>
                <header className=" ">
                    <div className='flex my-2'>
                        <p className="text-sm text-gray-700 mr-2 px-3 bg-[#4FA969] rounded-[50]">
                            {station.limitYn ? '개방' : '비개방'}
                        </p>
                        <p className="text-sm text-gray-700 mr-2 px-3 bg-[#4FA969] rounded-[50]">
                            {station.parkingFree ? '무료주차' : '유료주차'}
                        </p>
                    </div>
                    <h3 className="text-lg font-bold text-[#4FA969]">{station.statNm}</h3>
                    <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>
                        &times;
                    </button>
                </header>
                <p className="text-sm text-gray-600 mb-2">{station.addr}</p>
                {/* <h4 className="font-semibold text-gray-800 mb-1">운영 정보</h4> */}
                {station.chargerInfo['01'].useTime && <p className="text-sm text-gray-700">운영 시간: {station.chargerInfo['01'].useTime}</p>}
                    {station.chargerInfo['01'].busiNm && <p className="text-sm text-gray-700">문의: {station.chargerInfo['01'].busiNm}</p>}

                <div className="mb-4">
                    {/* <h4 className="font-semibold text-gray-800 mb-1">충전기 정보</h4> */}
                    <div className="flex items-center text-sm bg-[#f2f2f2] py-2 px-3 text-gray-700 mb-1"> 
                        {station.totalFastNum !== 0 ? <span><span className='font-bold'>급속</span> <span className="font-bold text-[#4FA969]">{station.chargeFastNum}</span> / {station.totalFastNum} </span> : ''}
                        
                        {station.totalSlowNum !== 0 ? <span><span className='font-bold'>완속</span> <span className="font-bold text-[#4FA969]">{station.chargeSlowNum}</span> / {station.totalSlowNum}</span>  : ''}
                    </div>
                    {/* 이미지에 있는 AC3상, DC콤보와 같은 상세 정보는 ChargingStationResponseDto에 해당 필드가 있다면 추가 */}
                    {/* 예시: station.chargerTypeDetails && station.chargerTypeDetails.map(...) */}
                </div>

                <h4>실시간 충전현황</h4>
                <div className='grid grid-cols-1'>
                    {Object.entries(station.chargerInfo as ChargerInfoMap).map(
                        ([chgerId, charger]: [string, ChargerInfoItem]) => {
                        const stat = charger.stat;
                        const lastTsdt = charger.lastTsdt;
                        const nowTsdt = charger.nowTsdt;
                        const chgerType = charger.chgerType;

                        return(
                            <div key={chgerId} className="m-1 px-3 py-2 border border-[#4FA969] rounded">
                                <div className='font-bold text-[#4FA969] flex justify-between'>
                                    <p className=''>{stat === '2' ? '충전가능': '사용중' }</p>
                                    <p>{chgerId}</p>
                                </div>
                                {/* <p>{nowTsdt}</p> */}
                                <p>{typeCodeToNm(chgerType)}</p>
                                <p>{getTimeAgo(lastTsdt)}</p>
                            </div>
                        )

                    })}
                </div>
            </div> 
            <div className='w-full pt-4 border-t absolute bottom-0 bg-white z-10'style={{borderColor:'#f2f2f2'}}>
                <p>현재위치에서 ddddddddd</p> 
                <p>현재위치에서 ddddddddd</p> 
                
            </div>

                {/* <div className="mt-4 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#4FA969] text-white rounded hover:bg-green-700">
                        확인
                    </button>
                </div> */}
            
        </div>
    )
}
