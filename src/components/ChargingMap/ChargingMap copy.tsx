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


export default function ChargingMap({ markers, myPos, radius, selectedStationId, posHere, mapCenter }: ChargingMapProps) {
    const [isMapReady, setIsMapReady] = useState(false);    // 지도준비상태 추적
    const mapRef = useRef<any>(null);                       // map객체 저장용
    const mapInstance = useRef<any>(null);                  // 카카오지도 인스턴스 저장
    // key: marker.id, value: kakao.maps.Marker 인스턴스
    const markerInstances = useRef<Map<string, any>>(new Map());
    const circleRef = useRef<any | null>(null);             //반경ref
    const [zIndex, setZIndex] = useState<number>(1);        // 커스텀 오버레이 // 선택된마커 앞으로
    const clustererInstance = useRef<any>(null);            // MarkerClusterer 인스턴스 저장용 // kakao.maps.MarkerClusterer 타입
    const [currentMapLevel, setCurrentMapLevel] = useState<number>(3); // 지도의 현재 줌 레벨 상태 _ 클러스터링시 오버레이 제거를 위해서

    // 1. 지도 초기화(컴포넌트 마운트시)
    useEffect(() => {
        if (!myPos) return; // 위치가 없으면 실행x

        if (window.kakao && window.kakao.maps && mapRef.current) {
            console.log('[✅ 지도 초기화 시작]', myPos);
            window.kakao.maps.load(() => {
                console.log('[✅ 지도 API 로드 성공]');
                const mapOption = {
                    center: new window.kakao.maps.LatLng(myPos[0], myPos[1]),
                    level: 6,
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


    // 4-3. 지도 레벨 변경 이벤트 리스너 추가 (useEffect 바깥, Map 컴포넌트 마운트 시 한 번만)
    useEffect(() => {
        if (isMapReady && mapInstance.current) {
            const map = mapInstance.current;
            const handleZoomChanged = () => {
                setCurrentMapLevel(map.getLevel());
                console.log(`[🔍 지도 줌 레벨 변경]: ${map.getLevel()}`);
            };

            window.kakao.maps.event.addListener(map, 'zoom_changed', handleZoomChanged);

            // 초기 줌 레벨 설정
            setCurrentMapLevel(map.getLevel());

            return () => {
                window.kakao.maps.event.removeListener(map, 'zoom_changed', handleZoomChanged);
            };
        }
    }, [isMapReady, mapInstance]);

    // 4. markers 또는 selectedStationId 변경 시 마커 업데이트
    useEffect(() => {
        console.log('[🎯 마커 그리기 시작]');
        console.log('[🧩 마커 데이터]', markers);
        if (!isMapReady || !mapInstance.current) {
            console.warn('[❌ 마커 못 그림: 지도 없음]');
            return;
        } else if ( !window.kakao.maps.MarkerClusterer){
            console.warn('[❌ 클러스터러 못 그림: 클러스터러 없음]');
            return;
        }
        const map = mapInstance.current;
        const MIN_CLUSTER_LEVEL = 6;    // 클러스터링을 시작할 최소 지도 레벨


        // MarkerClusterer 인스턴스 초기화 (한 번만)
        if (!clustererInstance.current) {
            clustererInstance.current = new window.kakao.maps.MarkerClusterer({
                map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
                averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커로 설정
                minClusterSize: 2, // ⭐️ 클러스터링을 시작할 최소 마커 개수 (기본값: 2)
                minLevel: MIN_CLUSTER_LEVEL, // ⭐️ 클러스터링 할 최소 지도 레벨 (기본값: 7, 숫자가 작을수록 확대)
                // 줌 레벨 6 (확대) 이하에서는 클러스터링을 하지 않고 개별 마커를 표시
                // 줌 레벨 7 이상 (축소)에서는 클러스터링 시작
                disableClickZoom: true, // ⭐️ 클러스터 마커를 클릭했을 때 지도가 확대되지 않도록 설정 (선택 사항)
                styles: [{ // ⭐️ 클러스터의 스타일을 정의
                    width: '50px', height: '50px',
                    background: '#51cf66',
                    borderRadius: '25px',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '31px',
                    fontSize: '10px'
                },
                {
                    width: '60px', height: '60px',
                    background: '#86e492',
                    borderRadius: '30px',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '41px',
                    fontSize: '12px'
                },
                {
                    width: '70px', height: '70px',
                    background: '#b0ffb8',
                    borderRadius: '35px',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '51px',
                    fontSize: '14px'
                }]
            });

            // 클러스터 마커에 클릭 이벤트를 등록합니다 (필요에 따라)
            // 보통 클러스터 클릭 시 해당 위치로 지도 이동/확대
            window.kakao.maps.event.addListener(clustererInstance.current, 'clusterclick', function(cluster:any) {
                // 현재 지도 레벨에서 1 레벨 감소 (확대)
                const level = 5 //map.getLevel() - 1;
                // 새로운 줌 레벨로 이동
                map.setLevel(level, { anchor: cluster.getCenter() });
            });
        }

        // 현재 지도에 있는 마커 ID집합
        const currentMarkerIds = new Set(markerInstances.current.keys());
        // 새로 받아온 마커 ID집합
        const newMarkerIds = new Set(markers.map(m => m.id));

        console.log('[🔁 현재 마커]', [...currentMarkerIds]);
        console.log('[🔁 새 마커]', [...newMarkerIds]);

        const markersToAdd: any[] = []; // 새로 추가할 카카오 마커 객체 배열
        const markersToRemove: any[] = []; // 제거할 카카오 마커 객체 배열

        // 4-1. 사라진 마커 제거
        currentMarkerIds.forEach(id => {
            if(!newMarkerIds.has(id)){
                const {marker, customOverlay} = markerInstances.current.get(id);
                if(marker) markersToRemove.push(marker);      // 제거할 마커 리스트에 추가       //marker.setMap(null); // 지도에서 마커제거
                if(customOverlay) customOverlay.setMap(null);   // 지도에서 커스텀 오버레이 제거
                markerInstances.current.delete(id);             // map에서도 제거
            }
        });
        // 클러스터러에서 제거할 마커들을 한 번에 처리
        if (markersToRemove.length > 0) {
            clustererInstance.current.removeMarkers(markersToRemove);
        }

        // 4-2. 새로운 마커 추가 / 기존마커 업데이트
        markers.forEach(markerDt => {
            // console.log(`[📌 ${markerDt.id}] 위도: ${markerDt.lat}, 경도: ${markerDt.lng}`);
            const existingMarker = markerInstances.current.get(markerDt.id);
            const isSelected = markerDt.id === selectedStationId;
            const isAvailable = markerDt.availableCnt > 0;

            // - 이미지 생성
            let imageUrl: string;
            let imageSize: any;
            if(isSelected){
                imageUrl = '/isSelected.png';
                imageSize = new window.kakao.maps.Size(50, 50);
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

            // - 커스텀오버레이 내용
            let overlayContentDiv : HTMLElement;

            if(isSelected){
                // 선택된 말풍선
                const selectedDiv = document.createElement('div');
                selectedDiv.className = style.customOverlaySelected;

                const title = document.createElement('div');
                title.className = style.overlayTitle;
                title.innerText = markerDt.name;

                const count = document.createElement('div');
                count.className = style.overlayCount;
                count.innerText = `${markerDt.availableCnt}개 가능`;

                const btnWrap = document.createElement('div');
                btnWrap.className = style.overlayButtons;

                // const startBtn = document.createElement('button');
                // startBtn.innerText = '출발';
                // startBtn.onclick = () => handleStart(markerDt);

                // const endBtn = document.createElement('button');
                // endBtn.innerText = '도착';
                // endBtn.onclick = () => handleEnd(markerDt);

                // btnWrap.append(startBtn, endBtn);
                selectedDiv.append(title, count, btnWrap);
                overlayContentDiv = selectedDiv;
            } else{
                // 기본(DOM 요소 직접 생성)
                const basicDiv = document.createElement('div');
                basicDiv.className = style.customOverlayDefault; //기본 스타일 클래스
                basicDiv.textContent = markerDt.availableCnt.toString();
                overlayContentDiv = basicDiv;
            }
                


            const currentZIndex = isSelected ? 999 : isAvailable ? 2 : 1;
            setZIndex(currentZIndex);

            if(existingMarker){
                // 이미 존재하는 마커는 업데이트(보통 이미지)
                const { marker, customOverlay } = existingMarker;
                const markerStatus = isSelected ? 'selected' : isAvailable ? 'available' : 'unavailable';
                // 마커 이미지 변경이 필요한 경우만 업데이트
                if ((marker as any).status !== markerStatus) {
                    marker.setImage(markerImg);
                    (marker as any).status = markerStatus;
                }
                marker.setZIndex(currentZIndex);
                // if (marker.getImage().getImageSrc() !== markerImg.getImageSrc()) {
                //     marker.setImage(markerImg);
                // }

                // 커스텀 오버레이 추가/제거
                if(isAvailable && currentMapLevel < MIN_CLUSTER_LEVEL){
                    if(customOverlay){
                        // 기존에 있고 내용이 바뀌면 업데이트
                        if(customOverlay.getContent() !== overlayContentDiv){
                            customOverlay.setContent(overlayContentDiv);
                        }
                        customOverlay.setMap(map); // 클러스터링으로 인해 잠시 null이 될 수 있으므로 다시 설정
                        customOverlay.setZIndex(currentZIndex);
                        customOverlay.setYAnchor(isSelected ? 1.8 : 1.35); // YAnchor도 업데이트
                    } else {
                        // 새로운 커스텀 오버레이
                        const newOverlay = new window.kakao.maps.CustomOverlay({
                            map: mapInstance.current,
                            position: marker.getPosition(), // 마커와 동일한 위치
                            content: overlayContentDiv,
                            yAnchor: isSelected? 1.8 :1.35,      // 0-1(1에 가까울수록 위)
                            clickable: true, // 클릭 가능 여부 (필요에 따라)
                            zIndex: zIndex,
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
                const markerPosition = new window.kakao.maps.LatLng(markerDt.lat, markerDt.lng); 
                
                const newKakaoMarker = new window.kakao.maps.Marker({
                    map: mapInstance.current,
                    position: markerPosition,
                    titile: markerDt.name,
                    image: markerImg,
                    zIndex: currentZIndex,
                });
                 // ⭐️ 마커를 클러스터러에 추가
                markersToAdd.push(newKakaoMarker);

                let newCustomOverlay = undefined;
                if (isAvailable && currentMapLevel < MIN_CLUSTER_LEVEL) {
                    newCustomOverlay = new window.kakao.maps.CustomOverlay({
                        map: mapInstance.current,
                        position: markerPosition,
                        content: overlayContentDiv,
                        yAnchor: isSelected? 1.8 :1.35, // 0-1(1에 가까울수록 위)
                        clickable: true,
                        zIndex: zIndex,
                    });
                }
                // Map에 마커 및 오버레이 인스턴스 저장
                markerInstances.current.set(markerDt.id, { marker: newKakaoMarker, customOverlay: newCustomOverlay });   // Map에 마커인스턴스 저장
            }
        }) 

         // ⭐️ 새로 생성된 마커들을 클러스터러에 한 번에 추가
        if (markersToAdd.length > 0) {
            clustererInstance.current.addMarkers(markersToAdd);
        }

        // 클린업 함수
        return () => {
            console.log('[🧹 마커 정리 시작]');
            if (clustererInstance.current) {
                // 클린업 시 모든 마커를 클러스터러에서 제거
                clustererInstance.current.clear();
            }
            // 모든 customOverlay도 수동으로 제거
            markerInstances.current.forEach(({ customOverlay }) => {
                if (customOverlay) {
                    customOverlay.setMap(null);
                }
            });
            markerInstances.current.clear();
            console.log('[✅ 마커 정리 완료]');
        };
    }, [markers, selectedStationId, isMapReady, mapInstance, currentMapLevel])

    // 5. 현재맵 중심
    const handleSearchHere = () => {
        if (mapRef.current) {
            const center = mapInstance.current.getCenter();
            posHere(center); // 부모로 전달
    }
    }

    // 6. 스테이션선택시 지도 레벨변경
    useEffect(() => {
        if (isMapReady && mapInstance.current && selectedStationId) {
            const selectedMarkerInfo = markerInstances.current.get(selectedStationId);
            if (selectedMarkerInfo && selectedMarkerInfo.marker) {
                const map = mapInstance.current;
                const position = selectedMarkerInfo.marker.getPosition();

                // 줌 레벨을 2로 설정하면서 해당 위치로 지도 이동
                map.setLevel(3, { anchor: position });
                map.panTo(position); // 부드럽게 이동

                console.log(`[✨ 선택된 스테이션 이동]: ${selectedStationId}, 줌 레벨 2`);
            }
        }
    }, [selectedStationId, isMapReady, mapInstance]); 

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

