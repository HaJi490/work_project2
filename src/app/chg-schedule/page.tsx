'use client'

import React, { useEffect, useState, useMemo, useCallback, useRef} from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';

import Toast from '@/components/Toast/Toast';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import Calender from '@/components/Calender';
import { MyReservationDto, Charger, Reservation} from '@/types/dto';
import { TimeInfo } from '@/types/dto';
import chgerCodeNm from '../../db/chgerType.json';
import { LuDot } from "react-icons/lu";
import { IoCalendarClearOutline } from "react-icons/io5";
import { FiMapPin } from "react-icons/fi";
import { accessTokenAtom } from '@/store/auth';
import { TbWashDryP } from 'react-icons/tb';

// 기존 Reservation + key
interface MergedReservation {
  key: string; // React 렌더링을 위한 고유 키
  startTime: string;
  endTime: string;
  charger: Charger; 
  date: string;
  timeIds: number[];
  reserveId: number[];
}

// 새로 선택한 슬롯 정보
interface SelectionSlot {
  timeId: number;
  startTime: string;
  endTime: string;
}

export default function page() {
  const [token] = useAtom(accessTokenAtom)
  const [myReserv, setMyReserv] = useState<MyReservationDto>();
  const [viewMode, setViewMode] = useState<'예약완료' | '예약취소'>('예약완료');
  
  const [toastMsg, setToastMsg] = useState<string>('');
  const [confirmMsg, setConfirmMsg] = useState<string>('');
  const [cofirmSubmsg, setConfirmSubmsg] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [reserveIdsToCancel, setReserveIdsToCancel] = useState<number[]>();       //❗추가됨

  // ❗예약 수정을 위한 상태
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [reservationToEdit, setReservationToEdit] = useState<MergedReservation | null>(null);
  const [availableTimeslots, setAvailableTimeslots] = useState<TimeInfo[]>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentSelection, setCurrentSelection] = useState<SelectionSlot[]>([]) ;
  const panelRef = useRef<HTMLDivElement>(null);

  // const [selectedTimeIds, setSelectedTimeIds] = useState<number[]>();
  // const [getTimeslots, setGetTimeslots] = useState<TimeInfo[]>();

  

  // 1. 예약정보 가져오기
  const getMyReservation = useCallback(async() => {
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
  }, [token]);

  useEffect(()=>{
    getMyReservation();
  },[getMyReservation])

   // 2. 예약정보 그루핑 (연속된 시간 병합)
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
        reserveId: group.map((r) => r.reserveId),
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


  // 3. 예약취소 함수들
  const handleConfirmModal = (reserveId: number[]) =>{ //🔥
    setShowConfirmModal(true);
    setReserveIdsToCancel(reserveId);  //🔥
    setConfirmMsg('예약을 취소하시겠습니까?');
    setConfirmSubmsg('선택한 내용은 복구할 수 없습니다.')
  }

  // 예약취소 alert - 확인
  const handleCancelReserv = async() => {
    try{
      if (!token || !reserveIdsToCancel) { //🔥
          console.warn('토큰 없음');
          return;
      }

      setShowConfirmModal(false);
      // alert('예약을 취소하시겠습니까/')
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setslotsCancel`,
        {slotIds: reserveIdsToCancel}, //🔥
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
      setReserveIdsToCancel([]);
      await getMyReservation();
    }
  }

  // 4. 예약수정 함수들
  
  // 4-1. 특정날짜의 타임슬롯 정보 가져오기
  const fetchTimeslotsForEdit = useCallback(async (charger: Charger, date: string, reservation?: MergedReservation)=> {
    try{
      const res = await axios.post<TimeInfo[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/time/timeslots`, {
        statId: charger.storeInfo.statId,
        chgerId: charger.chargerId.chgerId,
        date: date,
      });
      setAvailableTimeslots(res.data);

      // 타임슬롯을 가져온 후, '현재 수정중인 예약'을 기반으로 'currentSelection'상태를 초기화
      if(reservation){
        const initialSelection = res.data.filter(slot => reservation.timeIds.includes(slot.timeId))
                                        .map(slot => ({
                                            timeId: slot.timeId,
                                            startTime: slot.startTime,
                                            endTime: slot.endTime,
                                          }));
        setCurrentSelection(initialSelection);
      }       
    } catch(error) {
      console.error('fetchTimeslotsForEdit 에러: ', error);
      setToastMsg('예약현황을 불러오는데 실패했습니다.')
    }
  },[reservationToEdit]); 

  // 4-2. 수정패널 열기
  const handleOpenEditPanel = (reservation: MergedReservation) => {
    setReservationToEdit(reservation);
    setShowEditPanel(true);
    const reservationDate = new Date(reservation.date);
    setSelectedDate(reservationDate);
    fetchTimeslotsForEdit(reservation.charger, reservation.date, reservation);
  }

  // 4-3. 캘린더에서 날짜 변경시
  const handleDateChange = (date:Date) => {
    if(!reservationToEdit) return;
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(date);
    fetchTimeslotsForEdit(reservationToEdit.charger, formattedDate);
    setCurrentSelection([]); // 날짜가 바뀌면 선택 초기화
  }

  // 4-4. 연속성 검사함수
  const isConsecutive = (arr: number[]) => {
    if(arr.length <= 1) return true;
    const sorted = [...arr].sort((a, b) => a - b);
    for(let i = 1 ; i < sorted.length; i++){
      if(sorted[i] !== sorted[i-1] + 1){
        return false;
      }
    }
    return true;
  }

  // 4-5. 타임슬록 선택/해제 및 연속성 검사 핸들러
  const handleToggleSlot = (slot: TimeInfo) => {
    const isAlreadySelected = currentSelection.some(s => s.timeId === slot.timeId);
    let potentialSelection: SelectionSlot[];

    if (isAlreadySelected){
      // 선택 해제
      potentialSelection = currentSelection.filter(s => s.timeId !== slot.timeId);
    }else{
      // 새로 선택
      const isMyOriginalSlot = reservationToEdit?.timeIds.includes(slot.timeId);
      if(!slot.enabled && !isMyOriginalSlot){
        setToastMsg('예약이 불가능한 시간입니다.');
        return;
      }
      potentialSelection = [...currentSelection, {timeId: slot.timeId, startTime: slot.startTime, endTime: slot.endTime}];
    }

    // '만약 이렇게 선택된다면'을 가정하고 연속성 검사
    const potentialTimeIds = potentialSelection.map(s => s.timeId);
    if (isConsecutive(potentialTimeIds)) {
        // 연속이 맞으면 상태 업데이트
        setCurrentSelection(potentialSelection.sort((a, b) => a.timeId - b.timeId));
    } else {
        // 연속이 아니면 에러 메시지 표시하고 상태는 변경하지 않음
        setToastMsg('연속된 시간대만 선택할 수 있습니다.');
    }
  };

  // 4-6. 최적화된 예약변경 확정 로직
  const handleUpdateReservation = async() => {
    if(!reservationToEdit) return;

    // 만약 변경된 내용이 없다면 함수 종료
    const originalIds = reservationToEdit.timeIds.sort().join(',');
    const newIds = currentSelection.map(s => s.timeId).sort().join(',');

    if (originalIds === newIds) {
      setToastMsg("변경된 내용이 없습니다.");
      return;
    }

    try{
        await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setslotsCancel`,
          { slotIds: reservationToEdit.timeIds }, 
          { headers: { Authorization: `Bearer ${token}` } });
        if(currentSelection.length > 0){
          await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setSlots`,
          { slotIds: currentSelection.map(s => s.timeId) }, 
          { headers: { Authorization: `Bearer ${token}` } });
        }

      setToastMsg('예약이 성공적으로 변경되었습니다.');
      setShowEditPanel(false);
      await getMyReservation();

    } catch(error){
      console.error('[예약변경 실패]handleUpdateReservation 에러 : ', error);
      setToastMsg('예약 변경 중 오류가 발생했습니다.');
      await getMyReservation();
    }
  }

  // 4-7. 왼쪽패널 true -> 뒤쪽 스크롤막기
  useEffect(() => {
    if (showEditPanel) {
      // 패널이 열리면 body의 스크롤을 막습니다.
      document.body.style.overflow = 'hidden';
    } else {
      // 패널이 닫히면 body의 스크롤을 다시 허용합니다.
      document.body.style.overflow = 'unset'; // 'auto' 또는 'visible'도 가능
    }

    // 컴포넌트가 언마운트될 때(페이지 이동 등) 스타일을 초기화하는 클린업 함수
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEditPanel]); // 의존성 배열에 showEditPanel을 넣어 상태 변경을 감지

  // 4-8. 바깥 클릭 감지 useEffect 훅
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowEditPanel(false);
      }
    };
    if (showEditPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditPanel]);

  return (
    <>
      <div className='w-full min-h-screen bg-[#F7F9FA] flex justify-center items-start p-4 md:p-8'>
        <Toast message={toastMsg} setMessage={setToastMsg}/>
        {showConfirmModal &&
          <ConfirmModal message={confirmMsg} submsg={cofirmSubmsg} onConfirm={()=>handleCancelReserv()} onCancel={()=>setShowConfirmModal(false)}/>
        }
        <div className= {`w-full  ${showEditPanel ? 'px-10 pl-50' : 'max-w-[1300px]'}`}>
          {/* 1. 왼쪽: 예약 목록 */}
          <div className={`w-full transition-all duration-500 ${showEditPanel ? 'pr-[30rem]': 'pr-0'}`}>
            <div className='flex-1 flex flex-col'>
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
                                <button onClick={()=>handleOpenEditPanel(r)} className='inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                                  <IoCalendarClearOutline size={20} className="cursor-pointer hover:text-gray-600 transition" />
                                </button>
                                <button onClick={()=>handleConfirmModal(r.reserveId)} // 🔥 예약취소를 위해 timeId-> reservId한부분
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
          </div>
          {/* 2. 오른쪽: 예약 수정패널 */}
          {showEditPanel && reservationToEdit &&
            <div ref={panelRef} // 바깥 클릭 감지를 위해 ref 연결
                className={`fixed top-20 right-0 h-[calc(100vh-80px)] w-[30rem] bg-white shadow-xl z-50 p-6
                transition-transform duration-500 ease-in-out 
                ${showEditPanel ? 'translate-x-0' : 'translate-x-full'}`} > 
                {/* 수평으로 이동(full 자기 크기만큼) */}
              {/* <div className='fixed inset-0 z-40' onClick={()=> setShowEditPanel(false)}></div> */}
              <div className=' h-full overflow-y-auto'>
                <div className='p-6'>
                  <h3  className='text-xl font-bold mb-1'>예약 수정하기</h3>
                  <p className='text-gray-500 mb-4'>
                    {selectedDate?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </p>
                  <Calender selectedDate={selectedDate} onSelectDate={setSelectedDate} handleTimeslots={handleDateChange}/>
                  <hr className='my-6' />

                  <h4 className='text-lg font-semibold mb-3'>시간 선택</h4>
                  <div className='grid grid-cols-4 gap-2'>
                    {availableTimeslots?.map((slot) => {
                      const isSelected = currentSelection.some(s => s.timeId === slot.timeId);
                      const isMyOriginalSlot = reservationToEdit.timeIds.includes(slot.timeId);
                      const slotClasses = `p-2 text-center rounded-md text-sm cursor-pointer transition 
                                        ${!slot.enabled && !isMyOriginalSlot ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''} 
                                        ${(slot.enabled || isMyOriginalSlot) && !isSelected ? 'bg-gray-100 hover:bg-blue-100' : ''} 
                                        ${isSelected ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-300' : ''}`;

                      return(
                        <div key={slot.timeId} className={slotClasses} onClick={() => handleToggleSlot(slot)}>
                          {slot.startTime.slice(0, 5)}
                        </div>
                      );
                    })}
                  </div>
                  {currentSelection.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-bold">변경될 예약 정보</h5>
                        <div className='text-sm mt-2'>
                            <p>기존: <span className="font-mono">{reservationToEdit.startTime.slice(0,5)} ~ {reservationToEdit.endTime.slice(0,5)}</span></p>
                            <p>변경: <span className="font-mono">{currentSelection[0].startTime.slice(0,5)} ~ {currentSelection[currentSelection.length - 1].endTime.slice(0,5)}</span></p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowEditPanel(false)} className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm">창 닫기</button>
                            <button onClick={handleUpdateReservation} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold">변경 확정</button>
                        </div>
                    </div>
                  )}
                  {currentSelection.length === 0 && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <p className="text-center text-gray-500">모든 예약을 취소하려면 아래 버튼을 눌러주세요.</p>
                      <button onClick={handleUpdateReservation} className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold">모든 시간 취소</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </>
  )
}
