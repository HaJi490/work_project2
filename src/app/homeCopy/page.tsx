'use client'

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { isEqual } from 'lodash' // lodash 라이브러리의 isEqual 함수를 사용하면 객체 비교가 편리합니다.

import { ChargingStationRequestDto, ChargingStationResponseDto, MapQueryDto, CoordinatesDto } from '@/types/dto';
import nmToid from '../db/busi_id.json'
import respDummies from '../db/ChargingStationResponseDto.json'

import style from './home.module.css';
import ChargingMap from "../components/ChargingMap/ChargingMap copy";
import FilterModal from "../components/Filter/FilterModal"
import StationDetailPanal from "@/components/StationDetailPanal.module/StationDetailPanal";
import Toast from "@/components/Toast/Toast";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { TfiSearch } from "react-icons/tfi";

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
  keyWord?: string;
}

export default function Home() {
  const [list, setList] = useState<ChargingStationResponseDto[]>([]);  // resp
  const [isFilterOpen, setIsFilterOpen] = useState(false);            // 필터 onoff
  const [toastMessage, setToastMessage] = useState('');               // 필터에서 닫힐때 보낼 메시지(운영기관 선택안했을때)
  const [currentFilter, setCurrentFilter] = useState<Filters>({       // req에 담을 정보
    lat: 0,
    lon: 0,
    radius: 2000,
    canUse: false,
    parkingFree: false,
    limitYn: false,
    chargerTypes: [],
    chargerComps: [],
    outputMin: 0,
    outputMax: 300,
    keyWord: '',
  });
  const [myPos, setMyPos] = useState<[number, number] | null>(null);         // map에 쓰일 현재위치_ 반경표시
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null); // map의 중심
  const [selectedStation, setSelectedStation] = useState<ChargingStationResponseDto | null>(null);     // 선택된 충전소
  const closeDetailRef = useRef<HTMLButtonElement | null>(null);  // 필터누르면 detailpenal 꺼지게

  const searchRef = useRef<HTMLInputElement>(null);                   // 검색어
  // const [places, setPlaces] = useState<Place[]>([]);               // 검색어에 따른 리스트
  const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false);


  // 1. 충전소 정보를 가져오는 통합 함수
  // useCallback을 사용하여 myPos나 currentFilter가 변경될 때만 함수가 재생성되도록 함
  const fetchStations = useCallback(async (filtersToApply: Filters) => {

    function CompNmToIds(selectedNm: string[]): string[] {
      return nmToid.filter(company => selectedNm.includes(company.busi_nm))
        .map(company => company.busi_id);
    }
    // API 요청 DTO에 맞게 필터 객체 구성
    const requestBody: ChargingStationRequestDto = {
      "coorDinatesDto": {
        lat: filtersToApply.lat,
        lon: filtersToApply.lon,
        radius: filtersToApply.radius,
      },
      "mapQueryDto": {
        useMap: true,
        canUse: filtersToApply.canUse,
        parkingFree: filtersToApply.parkingFree,
        limitYn: filtersToApply.limitYn,
        chgerType: filtersToApply.chargerTypes.length > 0 ? filtersToApply.chargerTypes : [], // 빈 배열일 때 undefined로 보내는 등 백엔드에 맞게 조정
        busiId: filtersToApply.chargerComps.length > 0 ? CompNmToIds(filtersToApply.chargerComps) : [],
        outputMin: filtersToApply.outputMin,
        outputMax: filtersToApply.outputMax,
        keyWord: filtersToApply.keyWord
      }
    };

    console.log("API 요청 보낼 필터:", requestBody);

    try {
      const res = await axios.post<ChargingStationResponseDto[]>(
        `http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`,
        requestBody
      );
      const data = res.data;

      setList(Array.isArray(data) ? data : []);
      console.log("충전소 정보:: ", data);
    } catch (err) {
      console.error("fetchStations error: ", err);
      setList([]);
    }
  }, []);


  // 2. 현재위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // 초기 currentFilter에 위치 정보 업데이트
      // setCurrentFilter((prev) => ({
      //   ...prev,
      //   lat,  // 변수이름 같으면 생략가능
      //   lon: lng,

      // }));
      setMyPos([lat, lng]);
      setMapCenter([lat, lng]);
    },
      (error) => {
        console.error("위치 정보를 가져오지 못했습니다.", error);
        // 위치 못가져오면 기본값 부산대역
        const defaultPos: [number, number] = [35.1795, 129.0756]
        //   setCurrentFilter((prev) => ({
        //   ...prev,
        //   lat: 35.2325,  
        //   lon: 129.0851,
        // }));
        setMyPos(defaultPos);
        setMapCenter(defaultPos);
      });
  }, []);

  // 3. 카카오지도 api 로드확인 및 콜백 등록
  useEffect(() => {
    //window객체 존재 확인
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        if (window.kakao.maps.services) {
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
  }, [])

  // 4. currentFilter 변경 시 충전소 정보 다시 불러오기
  useEffect(() => {
    if (kakaoMapLoaded && myPos) {
      const filtersToRequest = {
        ...currentFilter,
        lat: myPos[0], // currentFilter의 lat/lon 대신, 확정된 myPos 값을 사용
        lon: myPos[1],
      };
      fetchStations(filtersToRequest);
    }
  }, [currentFilter, myPos, kakaoMapLoaded, fetchStations])

  // 받은 list markers에 넣기
  const markers = list.map((item) => ({ // 🍕 respDummies 로 변경
    id: item.statId,
    name: item.statNm,
    lat: item.lat,
    lng: item.lng,
    availableCnt: item.chargeNum,
  }
  ))

  // 5. 장소 검색
  const searchPlaces = () => {
    const keyword = searchRef.current?.value;

    const nextFilter = {
      ...currentFilter,
      keyWord: keyword
    }
    console.log(nextFilter);
    setCurrentFilter(nextFilter);
  };

  // 6. 필터 완료버튼 클릭했을 시_ 필터적용, 모달닫기, 토스트표시
  const handleApplyFilters = (newFilters: Omit<Filters, 'lat' | 'lon'>, msg?: string) => { //Omit<Type, Keys>는 TypeScript의 내장 유틸리티 타입으로, Type(Filters)에서 특정 Keys(lat,lon)를 제거(생략)한 새로운 타입을 생성
    // 6-1. 토스트 표시
    if (msg) {
      setToastMessage(msg);
    }
    // 6-2. 필터모달 닫기
    setIsFilterOpen(false); //모달닫기

    // 6-3. 필터 적용
    // currentFilter에 newFilter씌운 객체
    const nextFilter = {
      ...currentFilter,
      ...newFilters
    }

    console.log(nextFilter);
    // current와 next가 실제로 다른지 비교
    if (!isEqual(currentFilter, newFilters)) {
      setCurrentFilter(nextFilter);
    }
  }

  // 7. 리스트 아이템 클릭시 지도 이동 및 상세정보 표시
  const handleStaionClick = (station: ChargingStationResponseDto) => {
    setMapCenter([station.lat, station.lng]);
    console.log('선택한 충전소 정보:', station);
    setSelectedStation(station);
  }

  // 8. 상세정보 패널 닫기
  const handleCloseDetailPanel = () => {
    setSelectedStation(null);
  }

  useEffect(() => {
    setSelectedStation(null);
  }, [closeDetailRef])

  // 9. 지도 현위치에서 검색
  const handleSearchHere = (center: any) => {
    const lat = center.getLat();
    const lng = center.getLng();
    console.log('지도중심 좌표: ', lat, lng);
    setMyPos([lat, lng]);
    setMapCenter([lat, lng]);

    // setCurrentFilter(prev => ({
    //   ...prev,
    //   lat: lat,
    //   lon: lng,
    // }));
  }


    return (
      <div className={style.mainContainer}>
        {/* 왼쪽 */}
        <div className="w-100 h-full flex flex-col p-10 bg-white z-10 shadow-md">
          <div className='flex flex-row justify-between'>
            <h3 className=" font-semibold mb-4" style={{ color: "#4FA969" }}> 충전소 찾기</h3>
            <button ref={closeDetailRef} onClick={() => setIsFilterOpen(true)}
              className='text-[24px] cursor-pointer' style={{ color: '#666' }}><HiOutlineAdjustmentsHorizontal /></button>
            <FilterModal isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApplyFilters={handleApplyFilters} // 필터
              initialFilters={currentFilter} />
            <Toast message={toastMessage} setMessage={setToastMessage} />
          </div>
          {/* 검색 */}
          <div className="pb-4 border-b border-[#f2f2f2]">
            <div className={style.searchInput}>
              <input type="text" ref={searchRef} placeholder="충전소를 검색하세요" className="outline-none" />
              <button className="pr-5 px-2 py-1 pt-1 cursor-pointer" onClick={() => { searchPlaces() }}><TfiSearch /></button>
            </div>

          </div>
          {/* 충전소 목록 */}
          {/* <h4>충전소 목록</h4> */}
          <ul className="scrollContent">
            {list.map((item) => ( // 🍕 respDummies 로 변경
              <li key={item.statId} className={style.listSection} onClick={() => handleStaionClick(item)}>
                <h4 className='text-[15px]' style={{ color: '#232323' }}>{item.statNm}</h4>
                <p className='text-[12px]' style={{ color: '#666' }}>{item.addr}</p>
                <div className='flex gap-3'>
                  <p className='text-[12px]' style={{ color: '#666' }}>
                    {item.parkingFree ? '무료주차, ' : '유료주차, '} {item.limitYn ? '비개방, ' : '개방, '} {item.chargeNum} / {item.totalChargeNum}</p>
                </div>
              </li>

            ))}
          </ul>
        </div>
        {/* 오른쪽 - 지도 */}
        <div className="flex-grow">
          {myPos ? (
            <ChargingMap myPos={myPos}
              radius={currentFilter.radius} posHere={handleSearchHere}
              mapCenter={mapCenter} //충전소마커, 현지도위치, 반경, 현지도위치콜백, 맵의중심(충전소선택, 현재위치 구분을위해서) 
              markers={markers}
              selectedStationId={selectedStation?.statId} />
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p>지도를 불러오는 중입니다...</p>
            </div>
          )
          }
          {/* <div className="fixed h-full top-20 left-[calc(30%+2rem)] z-50"> */}
          {selectedStation && (
            <StationDetailPanal station={selectedStation}
              onClose={handleCloseDetailPanel}
              closeDetailRef={closeDetailRef} />  //outsideClickRefs={closeDetailRef}
          )}

          {/* </div> */}
        </div>
      </div>
    );
  }

