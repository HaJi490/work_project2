'use client';

import { useEffect, useRef, useState } from "react";
interface ChargingMapProps {
  markers: MarkerType[];
  myPos: [number, number] | null;
}

type MarkerType= {   
    id: string;
    name: string;
    lat: number;
    lng: number;
    availableCnt: number;
};

export default function ChargingMap({markers, myPos} : ChargingMapProps) {
    const mapRef = useRef<any>(null); // map객체 저장용
    

    // 1. 현재위치로 map 로드 및 현재위치로
    useEffect(()=>{
        if(!myPos ) return; // 위치가 없으면 실행x

        if(window.kakao && window.kakao.maps){
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("map");
                if (!mapContainer || !window.kakao || !window.kakao.maps ) return;  // dom(#map)과 sdk(kakaoMap) 로드여부체크
    
                const mapOption = {
                center: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                level: 3,
                };
    
                const map = new window.kakao.maps.Map(mapContainer, mapOption);
                mapRef.current = map; // map 저장

                // 현재 위치 마커 찍기
                new window.kakao.maps.Marker({
                map,
                position: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                });


                // 💡 강제로 리사이즈 발생 (화면 제대로 갱신되도록)
                setTimeout(() => {
                map.relayout();
                }, 100);
            });
        }
        }, [myPos]);

        // 2. 충전소 마커 그리기(마커안와도 지도는 그릴 수 있게 분리)
        useEffect(()=>{
            if(!mapRef.current || markers.length === 0) return;
            
                  // 충전소 위치 표시
                markers.forEach(mark => {
                    const pos = new window.kakao.maps.LatLng(mark.lat, mark.lng);
                    const marker = new window.kakao.maps.Marker({
                        map: mapRef.current,
                        position: pos,
                        title: mark.name,
                        image: 
                        mark.availableCnt === 0 ?                                                   // FIXME
                            new window.kakao.maps.MarkerImage(
                                '/marker1.png',
                                new window.kakao.maps.Size(30, 40)) :
                            new window.kakao.maps.MarkerImage(
                                '/marker1.png',
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
                            ${mark.availableCnt}
                        </div>
                        `;
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        content: content,
                        position: pos,
                        yAnchor: 1.5,
                        zIndex: 3,
                        });
                    customOverlay.setMap(mapRef.current);

                    // 마커 눌렀을때 info
                    const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:8px;">${mark.name}</div>`,
                    });

                    window.kakao.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(mapRef.current, marker);
                    });
                })

        },[markers])

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
        <div id="map" style={{ width: "100%", height: "100%" }}/>
    </div>
  )
}

