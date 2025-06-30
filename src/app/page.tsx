'use client'

import style from './home.module.css';
import ChargingMap from "../components/ChargingMap";
import Nav from "../components/Nav/Nav";
import FilterModal from "../components/Filter/FilterModal"

import axios from "axios";
import { useEffect, useState } from "react";

import { ChargingStationRequestDto } from "@/dto";
import { ChargingStationResponseDto } from '@/dto';

import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export default function Home() {
  const[list, setList] = useState<ChargingStationResponseDto[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // const requestBody: ChargingStationRequestDto = {
  //   carModel: 'Hyundai Ioniq 5',
  //   batteryLevel: 30.5,
  //   currentLocation: { latitude: 37.5665, longitude: 126.9780 },
  //   destination: { latitude: 37.3943, longitude: 127.1115 },
  //   searchRadiusKm: 15,
  //   connectorTypes: ['CCS1', 'CHAdeMO'],
  //   chargingSpeeds: {
  //     min: 100,
  //     max: 200
  //   },
  //   availableOnly: true,
  //   isOpen: true,
  //   freeParking: false,
  //   membership: ['휴맥스EV', 'EVinfra'],
  //   providers: ['Kepco']
  // }

  // 충전소정보 resp
  useEffect(()=>{
    const stationInfo = async()=>{
      try{
        const res = await axios.post<ChargingStationResponseDto[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`, 
          {
            "lat":35.231944,
            "lon":129.083333
          }
        );
        const data = res.data;

        setList(Array.isArray(data) ? data : []);
        console.log(data); 
      } catch(err){
        console.error("stationInfo error: ", err);
        setList([]);
      }
    }

    stationInfo();
  },[]) //

  // 받은 list markers에 넣기
  const markers = list.map((item) => ({
    id: item.statId,
    name: item.statNm,
    lat: item.lat,
    lng: item.lng,
    availableCnt: item.chargeNum,
  }
  ))
      
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
          <input type="text" placeholder="검색" className="w-full p-2 border rounded mb-4"/>
          <h4>충전소 목록</h4>
          <ul>
            {list.map((item) => (
              <li key={item.statId} className={style.listSection}>
                <h4 className='font-bold text-[19px]' style={{color:'#232323'}}>{item.statNm}</h4>
                <p className='text-[12px]' style={{color:'#666'}}>{item.addr}</p>
                <div className='flex gap-3'>
                  <p className='text-[12px]' style={{color:'#666'}}>
                    {item.parkingFree ? '무료주차, ' : ''} {item.limitYn ? '개방, ': ''} {item.chargeNum} / { item.totalChargeNum}</p>
                </div>
              </li>

            ))}
          </ul>
        </div>
        {/* 오른쪽 - 지도 */}
        <div className="flex-grow">
          <ChargingMap markers={markers}/>
        </div>
      </div>

    </div>
  );
}
