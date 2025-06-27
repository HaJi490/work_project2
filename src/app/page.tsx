'use client'

import style from './home.module.css';
import ChargingMap from "../components/ChargingMap";
import Nav from "../components/Nav/Nav";
import axios from "axios";
import { ChargingStationRequestDto, ChargingStationResponseDto } from "@/dto";
import { useEffect, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export default function Home() {
  const[list, setList] = useState<ChargingStationResponseDto[]>([]);

  const requestBody: ChargingStationRequestDto = {
    carModel: 'Hyundai Ioniq 5',
    batteryLevel: 30.5,
    currentLocation: { latitude: 37.5665, longitude: 126.9780 },
    destination: { latitude: 37.3943, longitude: 127.1115 },
    searchRadiusKm: 15,
    connectorTypes: ['CCS1', 'CHAdeMO'],
    chargingSpeeds: {
      min: 100,
      max: 200
    },
    availableOnly: true,
    isOpen: true,
    freeParking: false,
    membership: ['휴맥스EV', 'EVinfra'],
    providers: ['Kepco']
  }

  const respBody: ChargingStationResponseDto = {
    "chargingStations": [
    {
      "stationId": "ST123456",
      "name": "강남 고속터미널 충전소",
      "location": {
        "latitude": 37.5041,
        "longitude": 127.0046
      },
      "distanceKm": 5.2,
      "connectors": [
        {
          "type": "CCS1",
          "speeds": {
            "min":150,
            "max":1000 
          }, // 정확한 단위?? 완속/급속?
          "available": true
        }
      ],
      "isOpen": true,
      "freeParking": false,
      "membership": ['휴맥스EV', 'EVinfra'],
      "providers": "Kepco"
    },
    {
      "stationId": "ST654321",
      "name": "양재 시민의 숲 주차장 충전소",
      "location": {
        "latitude": 37.4704,
        "longitude": 127.0385
      },
      "distanceKm": 8.1,
      "connectors": [
        {
          "type": "CHAdeMO",
          "speeds":{
            min: 100,
            max: 200
          },
          "available": true
        },
        {
          "type": "CCS1",
          "speeds": {
            min: 100,
            max: 200
          },
          "available": false
        }
      ],
      "isOpen": true,
      "freeParking": true,
      "membership": ['휴맥스EV', 'EVinfra'],
      "providers": "Tesla"
    }
  ]
  }


  // 처음 접속했을때 req
  useEffect(()=>{}, [])
  const firstpgReq = async() =>{
    try{
      await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}/map/post/stations`, requestBody);
    } catch(err) {
      console.error("firstpgReq error: ", err)
    }
  }
  // firstpgReq();

  // 충전소정보 resp
  useEffect(()=>{
    const stationInfo = async()=>{
      try{
        const res = await axios.get<ChargingStationResponseDto>(`http://${process.env.NEXT_PUBLIC_BACKIP}/map/post/stations`);
        
        setList(Array.isArray(res.data) ? res.data : []);
        console.log(res.data); 
      } catch(err){
        console.error("stationInfo error: ", err);
        setList([]);
      }
    }
  },[]) //

  // 받은 list markers에 넣기
  const markers = respBody.chargingStations.map((item) => ({
    id: item.stationId,
    name: item.name,
    lat: item.location.latitude,
    lng: item.location.longitude,
    available: item.connectors.some(conn => conn.available),
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
            <span className='text-[24px]' style={{color:'#666'}}><HiOutlineAdjustmentsHorizontal/></span>
          </div>
          <input type="text" placeholder="검색" className="w-full p-2 border rounded mb-4"/>
          <h4>충전소 목록</h4>
          <ul>
            {/* list.map */}
            {respBody.chargingStations.map((item) => (
              <li key={item.stationId} className={style.listSection}>
                <h4 className='font-bold text-[19px]' style={{color:'#232323'}}>{item.name}</h4>
                <div className='flex gap-3'>
                  <p className='text-[12px]' style={{color:'#666'}}>{item.distanceKm}km</p>
                  <p className='text-[12px]' style={{color:'#666'}}>{item.connectors.map(c => `${c.type}(${c.available ? '사용가능' : '사용불가'})`)}</p>
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
