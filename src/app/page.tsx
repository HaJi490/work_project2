'use client'

import axios from "axios";
import { useEffect, useState, useRef } from "react";

import { ChargingStationRequestDto } from "@/dto";
import { ChargingStationResponseDto } from '@/dto';

import style from './home.module.css';
import ChargingMap from "../components/ChargingMap";
import Nav from "../components/Nav/Nav";
import FilterModal from "../components/Filter/FilterModal"
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

interface Place {
  id: string;
  place_name: string;
  address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
}

export default function Home() {
  const[list, setList] = useState<ChargingStationResponseDto[]>([]);  // resp
  const [isFilterOpen, setIsFilterOpen] = useState(false);            // 필터 onoff
  const [myPos, setMyPos] = useState<[number, number] | null>(null);  // 현재위치, 원하는 위치
  
  const searchRef = useRef<HTMLInputElement>(null);                   // 검색어
  const [places, setPlaces] = useState<Place[]>([]);                  // 검색어에따른 리스트
  const[kakaoMapLoaded, setKakaoMapLoaded] = useState(false);

  // 1. 현재위치 가져오기
  useEffect(()=>{
      navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMyPos([lat, lng]);
      },
      (error) => {
          console.error("위치 정보를 가져오지 못했습니다.", error);
          // 위치 못가져오면 기본값 서울시청
          setMyPos([37.5665, 126.9780]);
      });
  },[]);

  // 2. 카카오지도 api 로드확인 및 콜백 등록
  useEffect(()=>{
    //window객체 존재 확인
    if(window.kakao && window.kakao.maps){
      window.kakao.maps.load(() => {
        if(window.kakao.maps.services){
          console.log('KakaoMap API 로드 성공');
          setKakaoMapLoaded(true);
        } else {
          console.error('KakaoMap API services 로드 실패')
        }
      });
    } else {
      console.warn('KakaoMap API 아직 로드안됨')
      // 일정시간 후 다시 시도하거나 사용자에게 알림 ---------------------  FIXME
      // layout.tsx에 strategy옵션 확인 //gemini '오류는...'
    }
  },[])

  // 3. 충전소정보 resp
  useEffect(()=>{
    if (!myPos) return;

    const stationInfo = async()=>{
      try{
        const res = await axios.post<ChargingStationResponseDto[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`, 
          {
            "lat": myPos[0],
            "lon": myPos[1]
          }
        );
        const data = res.data;

        setList(Array.isArray(data) ? data : []);
        console.log("충전소정보:: ", data); 
      } catch(err){
        console.error("stationInfo error: ", err);
        setList([]);
      }
    }
    stationInfo();
  },[myPos])

  // 받은 list markers에 넣기
  const markers = list.map((item) => ({
    id: item.statId,
    name: item.statNm,
    lat: item.lat,
    lng: item.lng,
    availableCnt: item.chargeNum,
  }
  ))

  // 4. 장소 검색
  const searchPlaces = () =>{
    const keyword = searchRef.current?.value;

    // 카카오API가 로드되었는지 확인하는 kakaoMapLoaded
    if(!kakaoMapLoaded){
      alert('지도를 로드하는 중입니다. 잠시후 다시 시도해주세요.');
      return;
    }
    if(!keyword){
      alert('검색어를 입력하세요')
      return;
    }

    const ps = new window.kakao.maps.service.Places();
    ps.keywordSearch(keyword, (data: Place[], status: any, pagination: any) => {
      // 키워드 리스트 추출
      if(status === window.kakao.maps.service.Status.OK ){
        setPlaces(data);
      } else if(status === window.kakao.maps.service.Status.ZERO_RESULT){
        alert('검색 결과가 없습니다.');
        setPlaces([]);
      } else if(status === window.kakao.maps.service.Status.ERROR){
        alert('검색 중 오류가 발생했습니다.');
        setPlaces([]);
      }
    });
  }

  const handlePlaceSelect = (place: Place) => {
    // 선택된 장소 경도, 위도 추출
    const lat = parseFloat(place.y); // 위도
    const lng = parseFloat(place.x); // 경도
    setMyPos([lat, lng]);
    setPlaces([]);
  }

  return (
    // grid grid-rows-[20px_1fr_20px] p-8 pb-20 gap-16 sm:p-20/
    <div className="w-full h-full items-center justify-items-center min-h-screen   font-[family-name:var(--font-geist-sans)]">
      <Nav/>
      <div className={style.mainContainer}>
        {/* 왼쪽 */}
        <div className="w-3/10 max-w-100 h-full p-10 bg-white z-10 shadow-md">
          <div className='flex flex-row justify-between'>
            <h3 className=" font-semibold mb-4" style={{color:"#4FA969"}}> 충전소 찾기</h3>
            <button onClick={()=>setIsFilterOpen(true)}
              className='text-[24px] cursor-pointer' style={{color:'#666'}}><HiOutlineAdjustmentsHorizontal/></button>
              <FilterModal isOpen={isFilterOpen} onClose={()=>setIsFilterOpen(false)} />
          </div>
          {/* 검색 */}
          <input type="text" ref={searchRef} placeholder="장소를 검색하세요" className="w-full p-2 border rounded mb-4"/>
          <button onClick={()=>searchPlaces()} disabled={!kakaoMapLoaded}>검색</button>
          {places.length > 0 ? (
            <ul>
              {places.map((place) => (
                <li className={style.searchResult} key={place.id} onClick={() => handlePlaceSelect(place)} >
                  <strong>{place['place_name']}</strong>
                  <p>{place['address_name']}</p>
                </li>
              ))}
            </ul>
              ) : (
                <p>검색결과가 없습니다.</p>
          )}
          {/* 충전소 목록 */}
          <h4>충전소 목록</h4>
          <ul>
            {list.map((item) => (
              <li key={item.statId} className={style.listSection}>
                <h4 className='font-bold text-[19px]' style={{color:'#232323'}}>{item.statNm}</h4>
                <p className='text-[12px]' style={{color:'#666'}}>{item.addr}</p>
                <div className='flex gap-3'>
                  <p className='text-[12px]' style={{color:'#666'}}>
                    {item.parkingFree ? '무료주차, ' : '유료주차, '} {item.limitYn ? '개방, ': '비개방, '} {item.chargeNum} / { item.totalChargeNum}</p>
                </div>
              </li>

            ))}
          </ul>
        </div>
        {/* 오른쪽 - 지도 */}
        <div className="flex-grow">
          <ChargingMap markers={markers} myPos ={myPos}/>
        </div>
      </div>

    </div>
  );
}
