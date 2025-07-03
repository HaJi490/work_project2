'use client'

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";

import { ChargingStationRequestDto, ChargingStationResponseDto, MapQueryDto, CoordinatesDto } from '@/types/dto';
import idTonm from '../db/busi_id.json'

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

interface Filters {
  lat: number;
  lon: number;
  radius: number;
  canUse: boolean;
  parkingFree: boolean;
  limitYn: boolean;
  chargerTypes: string[];
  chargerComps: string[];
  outputMin: number;
  outputMax: number;
}

export default function Home() {
  const[list, setList] = useState<ChargingStationResponseDto[]>([]);  // resp
  const [isFilterOpen, setIsFilterOpen] = useState(false);            // 필터 onoff
  const [currentFilter, setCurrentFilter] = useState<Filters>({
      lat: 35.1795,
      lon: 129.0756,
      radius: 3000,
      canUse: false,
      parkingFree: false,
      limitYn: false,
      chargerTypes: [],
      chargerComps: [],
      outputMin: 0,
      outputMax: 300, 
  }); 
  const [myPos, setMyPos] = useState<[number, number]>([currentFilter.lat, currentFilter.lon]);
  
  const searchRef = useRef<HTMLInputElement>(null);                   // 검색어
  const [places, setPlaces] = useState<Place[]>([]);                  // 검색어에 따른 리스트
  const[kakaoMapLoaded, setKakaoMapLoaded] = useState(false);


  // 충전소 정보를 가져오는 통합 함수
  // useCallback을 사용하여 myPos나 currentFilter가 변경될 때만 함수가 재생성되도록 함
  const fetchStations = useCallback(async (filtersToApply: Filters) => {
    // API 요청 DTO에 맞게 필터 객체 구성
    const requestBody: ChargingStationRequestDto = {
      "coorDinatesDto" : {
        lat: filtersToApply.lat,
        lon: filtersToApply.lon,
        radius: filtersToApply.radius,
      },
      "mapQueryDto":{
        useMap: true,
        canUse: filtersToApply.canUse,
        parkingFree: filtersToApply.parkingFree,
        limitYn: filtersToApply.limitYn,
        chgerType: filtersToApply.chargerTypes.length > 0 ? filtersToApply.chargerTypes : [], // 빈 배열일 때 undefined로 보내는 등 백엔드에 맞게 조정
        busiId: filtersToApply.chargerComps.length > 0 ? filtersToApply.chargerComps : [],
        outputMin: filtersToApply.outputMin,
        outputMax: filtersToApply.outputMin,
      }
    };

    console.log("API 요청 보낼 필터:", requestBody);

    try {
      const res = await axios.post<ChargingStationResponseDto[]>(
        `http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`,
        filtersToApply
      );
      const data = res.data;

      setList(Array.isArray(data) ? data : []);
      console.log("충전소 정보:: ", data);
    } catch (err) {
      console.error("fetchStations error: ", err);
      setList([]);
    }
  }, []); // 의존성 배열 비워둠 (컴포넌트 마운트 시 한 번만 생성)


  // 1. 현재위치 가져오기
  useEffect(()=>{
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // 초기 currentFilter에 위치 정보 업데이트
        setCurrentFilter((prev) => ({
          ...prev,
          lat,  // 변수이름 같으면 생략가능
          lon: lng,
          
        }));
        setMyPos([lat, lng]);
      },
      (error) => {
          console.error("위치 정보를 가져오지 못했습니다.", error);
          // 위치 못가져오면 기본값 부산시청
          setCurrentFilter((prev) => ({
          ...prev,
          lat: 35.1795,  
          lon: 129.0756,
        }));
        setMyPos([35.1795, 129.0756]);
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

  // 3. currentFilter 변경 시 충전소 정보 다시 불러오기
  useEffect(()=>{
    if (kakaoMapLoaded && currentFilter.lat && currentFilter.lon) {
        fetchStations(currentFilter);
    }
    // if (currentFilter.coorDinatesDto.lat == 0 && currentFilter.coorDinatesDto.lon == 0) return;

    // const stationInfo = async()=>{
    //   try{
    //     const res = await axios.post<ChargingStationResponseDto[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`, 
    //       {
    //         currentFilter
    //       }
    //     );
    //     const data = res.data;

    //     setList(Array.isArray(data) ? data : []);
    //     console.log("충전소정보:: ", data); 
    //     setMyPos([currentFilter.coorDinatesDto.lat, currentFilter.coorDinatesDto.lon]); //map에 보낼 경도,위도
    //   } catch(err){
    //     console.error("stationInfo error: ", err);
    //     setList([]);
    //   }
    // }
    // stationInfo();
  },[currentFilter, kakaoMapLoaded, fetchStations])

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
    setCurrentFilter((prev) => ({
      ...prev,
      lat,  
      lon: lng,
    }));
    setMyPos([lat, lng]);
    setPlaces([]);  // 검색 결과 목록 숨김
  }

  // 5. 필터 선택했을 시
  const handleApplyFilters = (newFilters: Omit<ChargingStationRequestDto, 'lat' | 'lon' >) => { //Omit<Type, Keys>는 TypeScript의 내장 유틸리티 타입으로, Type(Filters)에서 특정 Keys(lat,lon)를 제거(생략)한 새로운 타입을 생성
    setIsFilterOpen(false); //모달닫기
    // 넘어온 정보들만 필터 씌우기
    setCurrentFilter((prev) => ({
      ...prev,
      newFilters
    }));
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
              <FilterModal isOpen={isFilterOpen} 
                          onClose={()=>setIsFilterOpen(false)}
                          onApplyFilters={handleApplyFilters} // 필터
                          initialFilters={currentFilter} />
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
