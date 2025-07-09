'use client';

import { useEffect, useRef, useState } from "react";
import style from './ChargingMap.module.css'

interface ChargingMapProps {
    markers: MarkerType[];
    myPos: [number, number] | null;
    radius: number;
    selectedStationId?: string | null;
    posHere: (center: any) => void;
    mapCenter: [number, number] | null;
}

type MarkerType = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    availableCnt: number;
};

// 기본 마커 이미지
// const DEFAULT_MARKER_IMAGE_URL = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
// // 선택된 마커 이미지
// const SELECTED_MARKER_IMAGE_URL = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
// // 마커 이미지 크기
// const MARKER_IMAGE_SIZE = new window.kakao.maps.Size(24, 35);

export default function ChargingMap({ markers, myPos, radius, selectedStationId, posHere, mapCenter }: ChargingMapProps) {
    const [isMapReady, setIsMapReady] = useState(false);    // 지도준비상태 추적
    const mapRef = useRef<any>(null);       // map객체 저장용
    const mapInstance = useRef<any>(null);  // 지도 인스턴스 저장
    // key: marker.id, value: kakao.maps.Marker 인스턴스
    const markerInstances = useRef<Map<string, any>>(new Map());
    const circleRef = useRef<any | null>(null);   //반경ref

    // 1. 지도 초기화(컴포넌트 마운트시)
    useEffect(() => {
        if (!myPos) return; // 위치가 없으면 실행x

        if (window.kakao && window.kakao.maps && mapRef.current) {
            console.log('[✅ 지도 초기화 시작]', myPos);
            window.kakao.maps.load(() => {
                console.log('[✅ 지도 API 로드 성공]');
                const mapOption = {
                    center: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                    level: 3,
                };

                const map = new window.kakao.maps.Map(mapRef.current, mapOption);
                mapInstance.current = map;
                setIsMapReady(true);
                
                console.log('[✅ 지도 생성 완료]', map);

                // 💡 강제로 리사이즈 발생 (화면 제대로 갱신되도록)
                setTimeout(() => {
                    map.relayout();
                    console.log('[✅ 지도 리레이아웃 완료]');
                }, 100);
            });
        } else{
            console.warn('[❌ mapRef 혹은 kakao API 없음]', mapRef.current);
        }
    }, []);

    // 2. mapCenter변경시 지도중심 이동
    useEffect(()=>{
        console.log('[mapCenter 체크]', mapCenter);
        if(isMapReady  && mapInstance.current && mapCenter){
            const moveLatLon = new window.kakao.maps.LatLng(mapCenter[0], mapCenter[1]);
            mapInstance.current.setCenter(moveLatLon);
            
        }
    },[mapCenter, isMapReady])

    // 3. myPos변경시 반경설정
    useEffect(() => {
    if (isMapReady && mapInstance.current && myPos) {
        const circleCenter = new window.kakao.maps.LatLng(myPos[0], myPos[1]);

        // 기존 원 제거
        if (circleRef.current) {
        circleRef.current.setMap(null);
        }

        // 새 원 생성
        const newCircle = new window.kakao.maps.Circle({
        center: circleCenter,
        radius: radius,
        strokeWeight: 2,
        strokeColor: '#4FA969',
        strokeOpacity: 0.5,
        fillColor: '#4FA969',
        fillOpacity: 0.3,
        });

        newCircle.setMap(mapInstance.current);
        circleRef.current = newCircle;
    }
    }, [myPos, radius, isMapReady]);

    // 3. markers 또는 selectedStationId 변경 시 마커 업데이트
    useEffect(() => {
        console.log('[🎯 마커 그리기 시작]');
        console.log('[🧩 마커 데이터]', markers);
        if (!isMapReady || !mapInstance.current) {
            console.warn('[❌ 마커 못 그림: 지도 없음]');
            return;
        }

        // 현재 지도에 있는 마커 ID집합
        const currentMarkerIds = new Set(markerInstances.current.keys());
        // 새로 받아온 마커 ID집합
        const newMarkerIds = new Set(markers.map(m => m.id));

        console.log('[🔁 현재 마커]', [...currentMarkerIds]);
        console.log('[🔁 새 마커]', [...newMarkerIds]);

        // 3-1. 사라진 마커 제거
        currentMarkerIds.forEach(id => {
            if(!newMarkerIds.has(id)){
                const {marker, customOverlay} = markerInstances.current.get(id);
                if(marker) marker.setMap(null);                 // 지도에서 마커제거
                if(customOverlay) customOverlay.setMap(null);   // 지도에서 커스텀 오버레이 제거
                markerInstances.current.delete(id);             // map에서도 제거
            }
        })

        // 3-2. 새로운 마커 추가 / 기존마커 업데이트
        markers.forEach(markerDt => {
            // console.log(`[📌 ${markerDt.id}] 위도: ${markerDt.lat}, 경도: ${markerDt.lng}`);
            const existingMarker = markerInstances.current.get(markerDt.id);
            const isSelected = markerDt.id === selectedStationId;
            const isAvailable = markerDt.availableCnt > 0;

            // 이미지 생성
            let imageUrl: string;
            let imageSize: any;
            if(isSelected){
                imageUrl = '/selectedmarker.jpg';
                imageSize = new window.kakao.maps.Size(32, 32);
            } else if (isAvailable){
                imageUrl = '/available.png';
                imageSize = new window.kakao.maps.Size(32, 32);
            } else {
                imageUrl = '/unavailable.png';
                imageSize = new window.kakao.maps.Size(12, 12);
            }

            // MarkerImage 생성
            const markerImg = new window.kakao.maps.MarkerImage(
                imageUrl,
                imageSize
            );

            // 커스텀오버레이 내용
            let overlayContent = '';
            let overlayClass = style.customOverlayDefault; //기본 스타일 클래스
            console.log(overlayClass);
            if(isAvailable){
                overlayContent=`<div className="${overlayClass}">${markerDt.availableCnt}</div>`
            }

            if(existingMarker){
                // 이미 존재하는 마커는 업데이트(보통 이미지)
                const { marker, customOverlay } = existingMarker;
                // 마커 이미지 변경이 필요한 경우만 업데이트
                // if (marker.getImage().getImageSrc() !== markerImage.getImageSrc()) {
                //     marker.setImage(markerImage);
                // }

                // 커스텀 오버레이 추가/제거
                if(isAvailable){
                    if(customOverlay){
                        // 기존에 있고 내용이 바뀌면 업데이트
                        if(customOverlay.getContent() !== overlayContent){
                            customOverlay.setContent(overlayContent);
                        }
                    } else {
                        // 새로운 커스텀 오버레이
                        const newOverlay = new window.kakao.maps.CustomOverlay({
                            map: mapInstance.current,
                            position: marker.getPosition(), // 마커와 동일한 위치
                            content: overlayContent,
                            yAnchor: 2.2, // 마커 이미지에 따라 조정
                            clickable: true, // 클릭 가능 여부 (필요에 따라)
                        });
                        existingMarker.customOverlay = newOverlay; // Map에 저장
                    }
                } else {
                    // availableCnt가 0이 되었는데 오버레이가 있다면 제거
                    if (customOverlay) {
                        customOverlay.setMap(null);
                        delete existingMarker.customOverlay;
                    }
                }

            } else {
                // 새로운 마커 생성
                const markerPosition = new window.kakao.maps.LatLng(markerDt.lat, markerDt.lng);    //?
                const newKakaoMarker = new window.kakao.maps.Marker({
                    map: mapInstance.current,
                    position: markerPosition,
                    titile: markerDt.name,
                    image: markerImg,
                });

                let newCustomOverlay = undefined;
                if (isAvailable) {
                    newCustomOverlay = new window.kakao.maps.CustomOverlay({
                        map: mapInstance.current,
                        position: markerPosition,
                        content: overlayContent,
                        yAnchor: 2.2, // 마커 이미지에 따라 조정 (위로 올리기)
                        clickable: true,
                    });
                }
                // Map에 마커 및 오버레이 인스턴스 저장
                markerInstances.current.set(markerDt.id, { marker: newKakaoMarker, customOverlay: newCustomOverlay });   // Map에 마커인스턴스 저장
            }
        }) 
    }, [markers, selectedStationId, isMapReady])

    const handleSearchHere = () => {
        if (mapRef.current) {
            const center = mapInstance.current.getCenter();
            posHere(center); // 부모로 전달
    }
    }

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
            <button className="absolute bottom-4 right-4 bg-white border px-4 py-2 rounded shadow z-10"
                    onClick={handleSearchHere}>
                현 지도에서 검색
            </button>
        </div>
    )
}

