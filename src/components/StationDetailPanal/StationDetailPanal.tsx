'use client'

import React, { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import { useAtom } from 'jotai';
import { accessTokenAtom } from '@/store/auth';

import { ChargingStationResponseDto, ChargerInfoMap, ChargerInfoItem } from '@/types/dto'
// import { DayPicker } from 'react-day-picker'
// import "react-day-picker/style.css";
import Calender from '../Calender'
import codeToNm from '../../db/chgerType.json'

import { TimeInfo } from '../../types/dto'
import { LuDot } from "react-icons/lu";
import style from './StationDetailPanal.module.css'

interface StationDetailPanalProps {
    station: ChargingStationResponseDto;
    onClose: () => void;
    closeDetailRef?: React.RefObject<HTMLButtonElement | null>;
}

type DateFormatTp = 'korean' | 'iso';

export default function StationDetailPanal({ station, onClose, closeDetailRef }: StationDetailPanalProps) {
    const [token] = useAtom(accessTokenAtom); // 토큰 가져오기

    const panelRef = useRef<HTMLDivElement>(null);                  // 전체 판넬닫기
    const reservRef = useRef<HTMLDivElement>(null);                 // 예약 판넬닫기
    const [showReserv, setShowReserv] = useState<boolean>(false);   // 예약창 뜨기
    const [selectedChger, setSelectedChger] = useState<ChargerInfoItem>();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const [selectedTime, setSelectedTime] = useState<string[]>([]);
    const [getTimeslots, setGetTimeslots] = useState<TimeInfo[]>();
    const [timeFilter, setTimeFilter] = useState<string>('AM'); // 오전/오후
    // const timeslotRef = useRef<HTMLDivElement>(null);

    // 다른곳 누르면 닫힘
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // 클릭된 요소가 HTML 노드인지 확인
            const targetNode = e.target as Node;

            // closeDetailRef 버튼을 클릭한 경우 → 무조건 패널 닫기
            if (closeDetailRef?.current?.contains(targetNode)) {
                onClose();
                return;
            }
            // 2. 예약창이 열려있고, 클릭이 예약창 외부에서 발생한 경우 -> 예약창만 닫기
            if (showReserv && reservRef.current && !reservRef.current.contains(e.target as Node)) {
                setShowReserv(false); // 예약창만 닫기
                return;
            }
            // 3. 예약창이 닫혀있거나 (위에서 처리되지 않았거나), 클릭이 전체 패널 외부에서 발생한 경우 -> 전체 패널 닫기
            if (panelRef.current && !panelRef.current.contains(targetNode)) {
                onClose(); // 바깥 클릭 시 전체 패널 닫기
            }

        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, showReserv, closeDetailRef]);

    // string -> date
    const parseTimestamp = (respDt: string) => {
        const year = parseInt(respDt.substring(0, 4));
        const month = parseInt(respDt.substring(5, 6)) - 1; // js는 0~11월
        const day = parseInt(respDt.substring(6, 8));
        const hour = parseInt(respDt.substring(8, 10));
        const minute = parseInt(respDt.substring(10, 12));
        const second = parseInt(respDt.substring(12, 14));

        return new Date(year, month, day, hour, minute, second);
    }

    // date 경과시간 계산
    const getTimeAgo = (respDt: string) => {
        const past = parseTimestamp(respDt);
        const now = new Date();
        const diffMs = now.getTime() - past.getTime();

        const diffSeconds = Math.floor(diffMs / 1000)
        const minute = Math.floor(diffSeconds % 60);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays >= 1) {
            return `${diffDays}일 전`;
        } else if (diffMinutes >= 1) {
            return `${diffHours}시간 ${minute}분 전`;
        } else {
            return '방금 전';
        }
    }

    // (화면)date -> string
    const formatDateString = (date: Date, type: DateFormatTp = 'korean') => {  // 디폴트
        const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // js는 0~11월
        const day = date.getDate();
        const hour = date.getHours();
        const weekday = WEEKDAY[date.getDay()];

        if (type === 'korean') {
            return `${year}년 ${month}월 ${day}일 (${weekday})` //  getDay()로 0(일)~6(토) 반환
        }
        else if (type === 'iso') {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return '';
    }

    // 충전기타입으로 변환
    const typeCodeToNm = (chgerCode: string) => {
        const match = codeToNm.find(type => chgerCode.includes(type.code));    // 한개일땐 find
        return match?.type || ''; // 맞는게 있으면 이름(type) 반환, 아니면 ''                      
    }

    // 예약화면 띄우기
    const handleChgReservation = (charger: ChargerInfoItem) => {
        setShowReserv(true);
        setSelectedChger(charger);
        setSelectedDate(undefined);         // 초기화
        setSelectedTime([]);  // 초기화
        setShowDatePicker(true);
    }

    // 에약현황 가져오기
    const handleTimeslots = async (date: Date) => {
        setSelectedDate(date);
        setShowDatePicker(false);

        if (selectedChger) {  // state변수 바로xx -> ts가 정적타입검사기여서 selectedChger를 undefined일거라고 판단
            const requestBody = {
                statId: selectedChger.statId,
                chgerId: selectedChger.chgerId,
                date: formatDateString(date, 'iso')
            };
            console.log('예약현황 요청: ', requestBody);
            try {
                const res = await axios.post<TimeInfo[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/time/timeslots`, requestBody);

                setGetTimeslots(res.data);  
                console.log(res.data);
            } catch (error) {
                console.error('handleTimeslots error:', error)
            }
        } else {
            console.warn("충전기 또는 날짜 정보가 부족하여 예약 현황을 가져올 수 없습니다.");
        }
    }

    // am, pm 시간대 구분
    const amTimes = getTimeslots?.filter(item => {
        const hour = parseInt(item.startTime.slice(0, 2));
        return hour < 12;
    });

    const pmTimes = getTimeslots?.filter(item => {
        const hour = parseInt(item.startTime.slice(0, 2));
        return hour >= 12;
    });


    // 버튼 렌더링
    const renderTimeButtons = (times: typeof getTimeslots) => { //getTimeslots과 같은 타입
        return times?.map((item) => {                          // 함수 리턴
            const timeStr = item.startTime.slice(0, 5);
            const isSelected = selectedTime.includes(timeStr); //bool
            const isDisabled = !item.enabled;

            return (                                            // map의 리턴
                <button key={item.timeId}
                    disabled={isDisabled}
                    className={`py-2 border border-[#afafaf] rounded
                                    ${isSelected ? 'bg-[#4FA969] text-black' : 'bg-white text-black'} 
                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    onClick={() => !isDisabled ? handleTimeslotChecked(timeStr, !selectedTime.includes(timeStr)): ''}>
                    {timeStr}
                </button>
            );
        });
    }

    // 연속성 검사함수
    const isConsecutive = (arr: number[]) => {
        if (arr.length <= 1) return true;
        const sorted = [...arr].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] !== sorted[i - 1] + 1) {
                return false;
            }
        }
        return true;
    };

    // timeslot 선택 핸들러
    const handleTimeslotChecked = (value: string, checked: boolean) => {
        // 선택된 타임s
        const newSelected = checked ? [...selectedTime, value] : selectedTime.filter((time) => time !== value);

        // 선택된 타임id
        const selectedTimeIds = getTimeslots?.filter(slot => newSelected.includes(slot.startTime.slice(0,5)))   // selectedTime(x) newSelected(o)
                                            .map(slot => slot.timeId);
        // 연속되지않으면 경고
        if(!isConsecutive(selectedTimeIds || [])){
            alert('연속된 시간대만 선택할 수 있습니다.');
            return;
        }
        
        // 연속일 경우
        setSelectedTime(newSelected);
        console.log(newSelected);
    }

    // 예약요청 __ 로그인상태, 연속된 시간
    const handleReservationInfo = () => {
        if(!selectedTime?.length){
            alert('시간대를 선택해주세요.');
            return;
        }
        const selectedTimeIds = getTimeslots?.filter(slot => selectedTime.includes(slot.startTime.slice(0,5)))
                                            .map(slot => slot.timeId);

        console.log('예약 시간대id: ', selectedTimeIds)
        const requestBody = {slotIds: selectedTimeIds} ;

        console.log('예약요청 데이터: ', requestBody );

        if (!token) {
            console.warn('토큰 없음');
            alert('로그인이 필요한 서비스입니다.')
            return;
        }

        axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setSlots`, requestBody,
            {headers: {
                Authorization: `Bearer ${token}`
            }}
        )   
        .then((res) => {
            alert('예약이 완료되었습니다.');
            setShowReserv(false);

        })
        .catch((err) => {
            console.error('예약 실패:', err);
        });
    }


    return (
        <div ref={panelRef} className="absolute top-135 left-162 h-full -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-20 w-100 max-h-[80vh]">
            <div className='h-full flex flex-col overflow-y-auto relative'>
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
                {station.useTime && <p className="text-sm text-gray-700">운영 시간: {station.useTime}</p>}
                {station.busiNm && <p className="text-sm text-gray-700">문의: {station.busiNm}</p>}

                <div className="mb-4">
                    {/* <h4 className="font-semibold text-gray-800 mb-1">충전기 정보</h4> */}
                    <div className="flex items-center text-sm bg-[#f2f2f2] py-2 px-3 text-gray-700 mb-1">
                        {station.totalFastNum !== 0 ? <span><span className='font-bold'>급속</span> <span className="font-bold text-[#4FA969]">{station.chargeFastNum}</span> / {station.totalFastNum} </span> : ''}

                        {station.totalSlowNum !== 0 ? <span><span className='font-bold'>완속</span> <span className="font-bold text-[#4FA969]">{station.chargeSlowNum}</span> / {station.totalSlowNum}</span> : ''}
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

                            return (
                                <button key={chgerId} onClick={() => handleChgReservation(charger)}
                                    className="m-1 px-3 py-2 border border-[#4FA969] rounded text-left">
                                    <div className='font-bold text-[#4FA969] flex justify-between'>
                                        <p className=''>{stat === '2' ? '충전가능' : '사용중'}</p>
                                        <p>{chgerId}</p>
                                    </div>
                                    {/* <p>{nowTsdt}</p> */}
                                    <p>{typeCodeToNm(chgerType)}</p>
                                    <p>{getTimeAgo(lastTsdt)}</p>
                                </button>
                            )
                        })}
                </div>
                {showReserv && selectedChger &&
                    <div ref={reservRef} className='w-full pt-4 border-t fixed bottom-0 left-0 right-0 px-4 bg-white z-20' style={{ borderColor: '#f2f2f2' }}>
                        <div>
                            <p className='text-bold'>{selectedChger.chgerId}</p>
                            <p className='flex'>{typeCodeToNm(selectedChger.chgerType).split('+').map((part, idx, arr)=>(
                                <React.Fragment key={idx}>
                                    <span>{part}</span>
                                    {idx < arr.length - 1 && (
                                    <span className='text-[#f2f2f2]'><LuDot/></span>
                                    )}
                                </React.Fragment>
                            ))}</p>
                            {/* <p>상태: {selectedChger.stat === '2' ? '충전가능' : '사용중'}</p> */}
                        </div>
                        <div className='font-bold text-[#4FA969]' onClick={() => setShowDatePicker(true)}>
                            {selectedDate ? `${formatDateString(selectedDate, 'korean')}` : ''}
                        </div>
                        {showDatePicker ?
                            <Calender selectedDate={selectedDate} onSelectDate={setSelectedDate} // CustomDayPicker 내부에서 selectedDate를 업데이트할 함수 전달
                                        handleTimeslots={handleTimeslots}  />   // 시간을 가져오는 함수 전달
                            :
                            <div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button className='py-2 border border-[#afafaf] rounded' onClick={() => setTimeFilter('AM')}>오전</button>
                                    <button className='py-2 border border-[#afafaf] rounded' onClick={() => setTimeFilter('PM')}>오후</button>
                                </div>
                                <div className='grid grid-cols-4 gap-2'>
                                    {timeFilter === 'AM' && renderTimeButtons(amTimes)}
                                    {timeFilter === 'PM' && renderTimeButtons(pmTimes)}
                                </div>
                                <button className='w-full py-3 m-2 bg-[#4FA969] text-white' onClick={()=>{handleReservationInfo()}}>다음단계</button>
                            </div>
                        }
                    </div>
                }
            </div>

        </div>
    )
}
