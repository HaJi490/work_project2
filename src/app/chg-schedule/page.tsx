'use client'

import React, { useEffect, useState, useMemo} from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';

import Toast from '@/components/Toast/Toast';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import Calender from '@/components/Calender';
import { MyReservationDto, Charger, Reservation, Slot} from '@/types/dto';
import { TimeInfo } from '@/types/dto';
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
  charger: Charger; 
  date: string;
  timeIds: number[];
}

// interface 

export default function page() {
  const [token] = useAtom(accessTokenAtom)
  const [myReserv, setMyReserv] = useState<MyReservationDto>();
  const [selectedTimeIds, setSelectedTimeIds] = useState<number[]>();
  const [viewMode, setViewMode] = useState<'예약완료' | '예약취소'>('예약완료');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showDatepicker, setShowDatepicker] = useState<boolean>(false);
  const [getTimeslots, setGetTimeslots] = useState<TimeInfo[]>();

  const [toastMsg, setToastMsg] = useState<string>('');
  const [confirmMsg, setConfirmMsg] = useState<string>('');
  const [cofirmSubmsg, setConfirmSubmsg] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  

  // 1. 예약정보 가져오기
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
      console.log(res.data);
    }catch(error){
      console.log('getMyReservation 에러: ', error)
    }
  }

  useEffect(()=>{
    getMyReservation();
  },[token])

   // 2. 연속성 검사함수
  const groupConsecutiveReservations = (reservations: Reservation[]): MergedReservation[] => {
    // 예약 데이터가 없으면 빈 배열을 반환합니다.
    if (!reservations || reservations.length === 0) {
      return [];
    }

    // MergedReservation 생성함수
    const extractMergedData = (group: Reservation[]) => {
      const firstSlot = group[0];
      const lastSlot = group[group.length - 1];
      return {
        key: `${firstSlot.slot.timeId}-${lastSlot.slot.timeId}`,
        startTime: firstSlot.slot.startTime,
        endTime: lastSlot.slot.endTime,
        charger: firstSlot.slot.charger,
        date: firstSlot.slot.date,
        timeIds: group.map((r) => r.slot.timeId), // 여기에 모든 timeId 배열 추가
      };
    };

    // 2-1. timeId 기준으로 데이터를 정렬합니다. (가장 중요!)
    const sorted = [...reservations].sort((a, b) => a.slot.timeId - b.slot.timeId);

    const mergedList: MergedReservation[] = [];
    
    // 첫 번째 예약을 기준으로 첫 그룹을 시작합니다.
    let currentGroup: Reservation[] = [sorted[0]];

    // 2-2. 두 번째 예약부터 순회합니다.
    for (let i = 1; i < sorted.length; i++) {
      const currentRes = sorted[i];
      const lastResInGroup = currentGroup[currentGroup.length - 1];

    const isConsecutive = currentRes.slot.timeId === lastResInGroup.slot.timeId + 1;  // timeId 연속성확인
    const isSameState = currentRes.reseverState === lastResInGroup.reseverState;      // reserveState 동일성확인

      // 2-3. timeId, reserveState를 비교하여 연속성 검사
      if (isConsecutive && isSameState) {
        // 연속된다면, 현재 그룹에 추가하기만 합니다.
        currentGroup.push(currentRes);
      } else {
        // 4. 연속이 끊겼을 때:
        // 이전까지의 그룹을 최종 리스트에 추가합니다.
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup[currentGroup.length - 1];
        mergedList.push(extractMergedData(currentGroup));
        // 현재 항목으로 새로운 그룹을 시작합니다.
        currentGroup = [currentRes];
      }
    }

    // 2-5. 루프가 끝난 후, 마지막으로 남아있는 그룹을 처리합니다.
    if (currentGroup.length > 0) {
      const firstSlot = currentGroup[0];
      const lastSlot = currentGroup[currentGroup.length - 1];
      mergedList.push(extractMergedData(currentGroup));
    }

    return mergedList;
  };

  // 22. useMemo를 사용해 myReserv 데이터가 바뀔 때만 그룹핑을 다시 계산합니다.
  const groupedReservations = useMemo(() => {
    const newGroupedData: Record<string, MergedReservation[]> = {};
    
    // 날짜별로 루프를 돌며 그룹핑 함수를 적용합니다.
    for (const date in myReserv) {
      // 1. viewMode 상태에 따라 원본 데이터를 먼저 필터링합니다.
      const filteredList = myReserv[date].filter(
        (reservation) => reservation.reseverState === viewMode
      );

      // 2. 필터링된 목록을 그룹핑 함수에 전달합니다.
      if (filteredList.length > 0) {
        newGroupedData[date] = groupConsecutiveReservations(filteredList);
      }
      // newGroupedData[date] = groupConsecutiveReservations(myReserv[date]);
    }
    console.log('재배열 데이터: ', newGroupedData);
    return newGroupedData;
  }, [myReserv, viewMode]);

  // 3. 예약 취소하기
  const handleConfirmModal = (timeIds: number[]) =>{
    setShowConfirmModal(true);
    setSelectedTimeIds(timeIds);
    setConfirmMsg('예약을 취소하시겠습니까?');
    setConfirmSubmsg('선택한 내용들은 모두 초기화됩니다.')
  }

  // 예약취소 alert - 확인
  const handleCancelReserv = async() => {
    try{
      if (!token) {
          console.warn('토큰 없음');
          return;
      }

      setShowConfirmModal(false);
      // alert('예약을 취소하시겠습니까/')
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setslotsCancel`,
        {slotIds: selectedTimeIds},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (res.status === 200) setToastMsg('예약이 취소되었습니다.');
      
    } catch (error){
      console.log('getMyReservation 에러: ', error)
      setToastMsg('예약취소가 실패하였습니다. 다시 시도해주세요.')
    } finally{
      setSelectedTimeIds([]);
      await getMyReservation();
    }
  }

  // 예약취소 alert - 취소
  const handleKeepReserv = () => {
    setShowConfirmModal(false);
  }

  // 4. 예약 변경
  // 에약현황 가져오기
  const handleTimeslots = async (date: Date) => {
      setSelectedDate(date);
      setShowDatepicker(false);

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
  


  return (
    <>
    <div className='w-full min-h-screen bg-[#F7F9FA] flex justify-center items-start p-4 md:p-8'>
      <Toast message={toastMsg} setMessage={setToastMsg}/>
      {showConfirmModal &&
        <ConfirmModal message={confirmMsg} submsg={cofirmSubmsg} onConfirm={()=>{handleCancelReserv()}} onCancel={()=>handleKeepReserv()}/>
      }

      <div className='w-full max-w-[1300px] flex flex-col'>
        <div className="flex p-4 gap-2">
        <button
          onClick={() => setViewMode('예약완료')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
            viewMode === '예약완료'
              ? 'bg-green-600 text-white shadow'
              : 'bg-white text-gray-700 border'
          }`}
        >
          예약 완료
        </button>
        <button
          onClick={() => setViewMode('예약취소')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
            viewMode === '예약취소'
              ? 'bg-red-600 text-white shadow'
              : 'bg-white text-gray-700 border'
          }`}
        >
          예약 취소
        </button>
      </div>
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
                        <div className='flex items-center gap-3 text-gray-400 cursor-pointer'>
                          <span className='inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                            <FiMapPin size={20} className="cursor-pointer hover:text-gray-600 transition" />
                          </span>
                          <button onClick={()=>setShowDaypicker(true)} className='inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                            <IoCalendarClearOutline size={20} className="cursor-pointer hover:text-gray-600 transition" />
                          </button>
                          <button onClick={()=>handleConfirmModal(r.timeIds)}
                                  className='cursor-pointer px-4 py-1.5 border border-gray-200 rounded-full text-gray-500 text-xs font-semibold hover:bg-gray-100 hover:text-gray-800 transition'>
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
      </div>
      {showDatepicker &&
        <div className='bg-white w-110 h-full'>
          <h3>예약 수정하기</h3>
          <Calender selectedDate={selectedDate} onSelectDate={setSelectedDate} // CustomDayPicker 내부에서 selectedDate를 업데이트할 함수 전달
                                                  handleTimeslots={handleTimeslots}  /> 
                                                  {/* 예약현황, 내가 한 예약 */}
        </div>
      }
    </div>
    </>
  )
}
