'use client'

import React, {use, useEffect, useState, useMemo} from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';

import { MyReservationDto, Charger, Reservation} from '@/types/dto';
import chgerCodeNm from '../../db/chgerType.json';
import { LuDot } from "react-icons/lu";
import { IoCalendarClearOutline } from "react-icons/io5";
import { FiMapPin } from "react-icons/fi";
import { accessTokenAtom } from '@/store/auth';

// 기존 Reservation + key
interface MergedReservation {
  key: string; // React 렌더링을 위한 고유 키
  startTime: string;
  endTime: string;
  // 나머지 정보는 첫 번째 예약 슬롯의 것을 그대로 사용합니다.
  charger: Charger; 
  date: string;
}

export default function page() {
  const [token] = useAtom(accessTokenAtom)
  const [myReserv, setMyReserv] = useState<MyReservationDto>();
  const [daypicker, setDaypicker] = useState<boolean>(false);

  // 1. 예약정보 가져오기
  useEffect(()=>{
    const getMyReservation = async() => {
      try{
        if (!token) {
              console.warn('토큰 없음');
              return;
          }
        const res = await axios.get(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/getSlots`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setMyReserv(res.data);
      }catch(error){
        console.log('getMyReservation 에러: ', error)
      }
    }
  
    getMyReservation();
  },[token])

  // 2. 연속성 검사함수
  const groupConsecutiveReservations = (reservations: Reservation[]): MergedReservation[] => {
    // 예약 데이터가 없으면 빈 배열을 반환합니다.
    if (!reservations || reservations.length === 0) {
      return [];
    }

    // 1. timeId 기준으로 데이터를 정렬합니다. (가장 중요!)
    const sorted = [...reservations].sort((a, b) => a.timeId - b.timeId);

    const mergedList: MergedReservation[] = [];
    
    // 첫 번째 예약을 기준으로 첫 그룹을 시작합니다.
    let currentGroup: Reservation[] = [sorted[0]];

    // 2. 두 번째 예약부터 순회합니다.
    for (let i = 1; i < sorted.length; i++) {
      const currentRes = sorted[i];
      const lastResInGroup = currentGroup[currentGroup.length - 1];

      // 3. timeId를 비교하여 연속성 검사
      if (currentRes.timeId === lastResInGroup.timeId + 1) {
        // 연속된다면, 현재 그룹에 추가하기만 합니다.
        currentGroup.push(currentRes);
      } else {
        // 4. 연속이 끊겼을 때:
        // 이전까지의 그룹을 최종 리스트에 추가합니다.
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup[currentGroup.length - 1];
        mergedList.push({
          key: `${firstSlot.timeId}-${lastSlot.timeId}`,
          startTime: firstSlot.startTime,
          endTime: lastSlot.endTime,
          charger: firstSlot.charger, // 정보는 첫 슬롯의 것을 대표로 사용
          date: firstSlot.date,
        });
        // 현재 항목으로 새로운 그룹을 시작합니다.
        currentGroup = [currentRes];
      }
    }

    // 5. 루프가 끝난 후, 마지막으로 남아있는 그룹을 처리합니다.
    if (currentGroup.length > 0) {
      const firstSlot = currentGroup[0];
      const lastSlot = currentGroup[currentGroup.length - 1];
      mergedList.push({
        key: `${firstSlot.timeId}-${lastSlot.timeId}`,
        startTime: firstSlot.startTime,
        endTime: lastSlot.endTime,
        charger: firstSlot.charger,
        date: firstSlot.date,
      });
    }

    return mergedList;
  };

  // 3. useMemo를 사용해 myReserv 데이터가 바뀔 때만 그룹핑을 다시 계산합니다.
  const groupedReservations = useMemo(() => {
    const newGroupedData: Record<string, MergedReservation[]> = {};
    
    // 날짜별로 루프를 돌며 그룹핑 함수를 적용합니다.
    for (const date in myReserv) {
      newGroupedData[date] = groupConsecutiveReservations(myReserv[date]);
    }
    
    return newGroupedData;
  }, [myReserv]);

  return (
    <div className='w-full min-h-screen bg-[#F7F9FA] flex justify-center items-start p-4 md:p-8'>
      <div className='w-full max-w-[1300px] flex flex-col'>
        {groupedReservations && Object.entries(groupedReservations).map(([date, reservationList]) => { // 1. [날짜, 안의 배열]를 바로 비구조화 할당
          // const showDate = idx === 0;
          // prevDate = date;

          return (
            <React.Fragment key={date}>
                <h3 className='mb-3 mt-4 font-medium text-lg text-gray-400'>{date}</h3>
              {reservationList.map((r) => (
                // 예약 카드
                <div key={r.key} className="flex bg-white border-l-4 border-green-500 rounded-lg shadow-md mb-4 p-5 w-full cursor-pointer transition hover:shadow-lg">

                  {/* 👈 1. 시간 정보를 왼쪽에 배치하되, 레이아웃을 해치지 않도록 개선 */}
                  <div className='flex flex-col items-center justify-center pr-5 mr-5 border-r border-gray-200'>
                    <p className='text-lg font-semibold text-gray-800'>{r.startTime.slice(0, 5)}</p>
                    <p className='text-sm text-gray-400'>~{r.endTime.slice(0, 5)}</p>
                  </div>

                  {/* 👈 2. 메인 정보 영역: 모든 정보를 담는 컨테이너. flex-1으로 남은 공간을 모두 차지 */}
                  <div className='flex-1 flex flex-col gap-3'>

                    {/* 카드 헤더: 충전소 이름과 태그 */}
                    <div className='flex justify-between items-start'>
                      <h3 className='text-xl font-bold text-gray-800'>{r.charger.storeInfo.statNm}</h3>
                      <div className='text-xs font-semibold rounded-full px-3 py-1 bg-green-100 text-green-700 whitespace-nowrap'>
                        AI 추천
                      </div>
                    </div>

                    {/* 카드 본문: 주소 및 충전기 타입 */}
                    <div className='flex flex-col gap-2'>
                      <p className='text-sm text-gray-500 flex items-center'>
                        <span className='text-gray-900 font-medium mr-4 w-12'>주소</span>
                        {r.charger.storeInfo.addr}
                      </p>
                      <p className='text-sm text-gray-500 flex items-center'>
                        <span className='text-gray-900 font-medium mr-4 w-12'>타입</span>
                        <span className='flex items-center'>
                          {r.charger.storeInfo.enabledCharger.join(', ')}
                          {/* {chgerCodeToNm(r.chgerType).split('+').map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                              <span>{part}</span>
                              {idx < arr.length - 1 && (
                                <span className='text-gray-300 mx-1'><LuDot /></span>
                              )}
                            </React.Fragment>
                          ))} */}
                        </span>
                      </p>
                    </div>

                    {/* 👈 3. 카드 푸터: 추가 정보와 액션 버튼 */}
                    <div className='flex justify-end items-center mt-2'>
                        {/* 레퍼런스처럼 연한 회색 아이콘과 버튼으로 변경 */}
                        <div className='flex items-center gap-3 text-gray-400 '>
                          <span className='inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                            <FiMapPin size={20} className="cursor-pointer hover:text-gray-600 transition" />
                          </span>
                          <span className='inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                            <IoCalendarClearOutline size={20} className="cursor-pointer hover:text-gray-600 transition" />
                          </span>
                          <button className='px-4 py-1.5 border border-gray-200 rounded-full text-gray-500 text-xs font-semibold hover:bg-gray-100 hover:text-gray-800 transition'>
                            예약 취소
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          );
        })}
        {daypicker &&
          <div>
            
          </div>
        }
      </div>
    </div>
    // <div className='w-full min-h-screen bg-[#F7F9FA] flex justify-center items-start'>
    //   <div className='w-7/10 max-w-[1300px] flex flex-col'>
    //     { myReserv && myReserv.map((r, idx) => {
    //       const showDate = r.reservDate !== prevDate;
    //       prevDate = r.reservDate

    //       return(
    //         <React.Fragment key={idx + r.reservDate}>
    //           {showDate &&
    //             <h3 className='mb-2 font-medium text-lg text-[#afafaf]'>{r.reservDate}</h3>
    //           }
    //           {/* 예약카드 */}
    //           <div className="flex items-start mb-4 h-full bg-white border-[#f2f2f2] rounded-xl shadow-md p-6 w-full text-left focus:outline-none cursor-pointer">
    //             <div className='text-left w-16 '>
    //               <p className='text-xl font-bold text-[#4FA969]'>{r.reservedSTime}</p> 
    //               <p className='text-sm text-[#666]'>{r.reservedETime}</p>
    //             </div>
    //             <div className='w-1 rounded-full bg-green-500 h-full mt-1'></div>
    //             <div className='flex-1 flex flex-col gap-2'>
    //               <h3 className='text-lg font-semibold'>{r.statNm}</h3>
    //               <p className='text-sm text-[#666] '>
    //                 <span className='text-black mr-3'>Addr</span>
    //                 {r.addr}
    //               </p>
    //               <p className='flex text-sm text-[#666] '>
    //                 <span className='text-black font-normal mr-3'>Type</span>
    //                 {/* <span className='mt-[1.2px] mr-2 text-[]'><MdOutlineEvStation /></span> */}
    //                 {chgerCodeToNm(r.chgerType).split('+').map((part, idx, arr)=>(
    //                     <React.Fragment key={idx}>
    //                         <span>{part}</span>
    //                         {idx < arr.length - 1 && (
    //                         <span className='text-[#afafaf]'><LuDot/></span>
    //                         )}
    //                     </React.Fragment>
    //                 ))}
    //               </p>
    //               {/* <p>{r.chargeAmount}</p>
    //               <p>{r.chargeCost}</p> */}
    //               {/* 추가 */}
    //             </div>
    //             <div className='flex flex-col items-end justify-between'>
    //               <div className='text-xs rounded-full px-4 py-1 ml-2 bg-[#EBFAD3] text-[#568811]'>
    //                 AI추천
    //               </div>
    //               <div className='flex'>
    //                 <span className='w-7 h-7 border rounded-full border-[#f2f2f2] text-center text-[#666]'><IoCalendarClearOutline /></span>
    //                 <span className='px-4 py-1 border rounded-full border-[#f2f2f2] text-[#666] text-sm'>cancel</span>
    //               </div>
    //             </div>
    //         </div>
    //         </React.Fragment>
    //       )})
    //     }
    //   </div>
    // </div>
  )
}
