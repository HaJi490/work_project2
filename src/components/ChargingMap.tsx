'use client';

import { useEffect, useRef, useState } from "react";
interface ChargingMapProps {
  markers: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    available: boolean;
  }[];
//   onMapReady?: (panTo: (lat: number, lng: number) => void) => void;
}

export default function ChargingMap({markers} : ChargingMapProps) {
    const mapRef = useRef<any>(null); // map객체 저장용
    const [myPos, setMyPos] = useState<[Number, number] | null>(null); // 현재위치 저장용

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

    // 2. 현재위치로 map 로드
    useEffect(()=>{
        if(!myPos) return; // 위치가 없으면 실행x

        if(window.kakao && window.kakao.maps){
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("map");
                if (!mapContainer) return;
    
                const mapOption = {
                center: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                level: 3,
                };
    
                const map = new window.kakao.maps.Map(mapContainer, mapOption);
                mapRef.current = map; // map 저장

                // // 부모에 panTo 함수 전달
                // onMapReady?.((lat: number, lng: number) => {
                //     const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
                //     map.panTo(moveLatLng);  // 지도 부드럽게 이동
                // }) 
    
                // 현재 위치 마커 찍기
                new window.kakao.maps.Marker({
                map,
                position: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                });


                // 충전소 위치 표시
                markers.forEach(mark => {
                    const pos = new window.kakao.maps.LatLng(mark.lat, mark.lng);
                    const marker = new window.kakao.maps.Marker({
                        map: map,
                        position: pos,
                        title: mark.name,
                        image: 
                        mark.available ? 
                            undefined :
                            new window.kakao.maps.MarkerImage(
                                new window.kakao.maps.Size(30, 40)
                            ),
                    })

                    /// 가능한 개수 표시,  ${mark.availableCount}
                    const content = `
                        <div style="
                            position: relative;
                            text-align: center;
                            font-size: 14px;
                            font-weight: bold;
                            color: white;
                            background: rgba(0,0,0,0.6);
                            padding: 2px 6px;
                            border-radius: 12px;
                        ">
                           2
                        </div>
                        `;
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        content: content,
                        position: pos,
                        yAnchor: 1.5,
                        zIndex: 3,
                        });
                    customOverlay.setMap(map);

                    // 마커 눌렀을때 info
                    const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:8px;">${mark.name}</div>`,
                    });

                    window.kakao.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map, marker);
                    });
                })

                

    
                // 💡 강제로 리사이즈 발생 (화면 제대로 갱신되도록)
                setTimeout(() => {
                map.relayout();
                }, 100);
            });
        }
        }, [myPos, markers]);

   

        // 키워드로 주소검색(강남역)
        // const ps = new window.kakao.maps.services.Places();
        // ps.keywordSearch("강남역", function (data, status) {
        // if (status === window.kakao.maps.services.Status.OK) {
        //     const coords = new window.kakao.maps.LatLng(data[0].y, data[0].x);
        //     mapRef.current.setCenter(coords);

        //     new window.kakao.maps.Marker({
        //     mapRef,
        //     position: coords,
        //     });
        // }
        // });


  return (
    <div style={{width: "100%", height: "100%"}}>
        <div id="map" style={{ width: "100%", height: "100%" }}>
            {/* 마커 뿌리기
            {markers.map(marker => (
                <div key={marker.id}>{marker.name}</div>
            ))} */}
        </div>

    </div>
  )
}

