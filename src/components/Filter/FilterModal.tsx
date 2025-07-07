'use client'

import { useEffect, useState, useRef } from "react"
import axios from "axios"

import style from './FilterModal.module.css'
import Slider from "../Slider/Slider"
import TwowaySlider from '../Slider/TwowaySlider'
import { IoHandLeftSharp } from "react-icons/io5";

interface filterProps{
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: any) => void; // 부모로 필터데이터 전달할 콜백함수
    initialFilters?: any; // 초기 필터값
}

export default function Filter({isOpen, onClose, onApplyFilters, initialFilters}: filterProps) {
    const [canUse, setCanUse] = useState<boolean>(initialFilters.canUse);                // 사용가능
    const [parkingFree, setParkingFree] = useState<boolean>(initialFilters.parkingFree);      // 무료주차
    const [limitYn, setLimitYn] = useState<boolean>(initialFilters.limitYn);              // 개방
    const [selectedRange, setSelectedRange] = useState<number>(initialFilters.radius);
    const [selectedSpeedMin, setSelectedSpeedMin] = useState<number>(initialFilters.outputMin);
    const [selectedSpeedMax, setSelectedSpeedMax] = useState<number>(initialFilters.outputMin);
    const [selectedChargerTypes, setSelectedChargerTypes] = useState<string[]>(initialFilters.chargerTypes); // 커넥터타입 선택상태
    const [selectedChargerComps, setSelectedChargerComps] = useState<string[]>(initialFilters.chargerComps); // 충전사 선택상태
    // slider의 min/max값
    
    const [activeTab, setActiveTab] = useState<string>('속성');                     // 탭메뉴 선택상태(기본값 '속성')

    // 각 섹션 참조를 위한 useRef
    const propSectionRef = useRef<HTMLDivElement>(null);
    const rangeSectionRef = useRef<HTMLDivElement>(null);
    const speedSectionRef = useRef<HTMLDivElement>(null);
    const connectorSectionRef = useRef<HTMLDivElement>(null);
    // const membershipSectionRef = useRef<HTMLDivElement>(null); // 멤버십 섹션 (필요시 추가)
    const chargerCompSectionRef = useRef<HTMLDivElement>(null);

    // 섹션 참조를 맵으로 관리 (편리한 접근을 위함)
    const sectionRefs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {
        '속성': propSectionRef,
        '탐색반경': rangeSectionRef,
        '충전속도': speedSectionRef,
        '커넥터': connectorSectionRef,
        // '멤버십': membershipSectionRef,
        '운영기관': chargerCompSectionRef,
    };
    
    // 탭메뉴
    const tabMenu: {value: string}[] = [
        {value: "속성"},
        {value: '탐색반경'},
        {value: '충전속도'},
        {value: '커넥터'},
        {value: '운영기관'},
    ]

    // 탐색반경
    const range: {value: number}[]=[
        {value: 2000}, {value: 3000},
        {value: 5000}, {value: 10000},
        {value: 30000}, {value: 0} //전국
    ]

    // 충전사
    const chargingComp: {value: string}[] = [
        {value: "채비"}, {value: "레드이엔지"},
        {value: "스타코프"}, {value: "씨어스"},
        {value: "에버온"}, {value: "이지차저"},
        {value: "이카플러그"}, {value: "제주전기자동차서비스"},
        {value: "GS차지비"}, {value: "차지인"},
        {value: "클린일렉스"}, {value: "타디스테크놀로지"},
        {value: "파워큐브"}, {value: "플러그링크"},
        {value: "한국전력"}, {value: "환경부"},
        {value: "휴맥스이브이"}, {value: "기타"}
    ]

    // 커넥터 타입
    const connectorTypes = [
        { value: 'DC차데모', label: 'DC차데모' },
        { value: 'AC완속', label: 'AC완속' },
        { value: 'DC콤보', label: 'DC콤보' },
        { value: 'AC3상', label: 'AC3상' },
        { value: 'DC콤보(완속)', label: 'DC콤보(완속)' },
        { value: 'NACS', label: 'NACS' },
    ];

    useEffect(() => {
        // 모달 열릴 때 스크롤 방지
        if(isOpen) {
            document.body.style.overflow = 'hidden';
        } else{
            document.body.style.overflow = 'auto';
        } 
    }, [isOpen]);

    // 탭메뉴 클릭 핸들러
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
        const ref = sectionRefs[tabName];
        if(ref && ref.current){
            ref.current.scrollIntoView({behavior:'smooth', block:'start'});
        }
    };

    // 속성 버튼 클릭 핸들러
    const handlePropToggle = (propName: 'canUse' | 'parkingFree' | 'limitYn')=>{
        switch(propName){
            case 'canUse':
                setCanUse(prev => !prev); 
                break;
            case 'parkingFree':
                setParkingFree(prev => !prev);
                break;
            case 'limitYn':
                setLimitYn(prev => !prev);
                break;
        }
    }

    // 범위 슬라이더 핸들러
    const handleRange = (value: number) =>{
        setSelectedRange(value);
    }

    // 충전속도 슬라이더 핸들러
    const handleChargingSpeed = (min: number, max: number)=>{
        setSelectedSpeedMin(min);
        setSelectedSpeedMax(max);
    }

    // 커넥터 타입 체크박스 핸들러
    const handleConnectorType = (event: React.ChangeEvent<HTMLInputElement>)=>{
        const {value, checked} = event.target;
        setSelectedChargerTypes((prev) =>
            checked ? [...prev, value] : prev.filter((type) => type !== value)  // 이전 prev 배열의 모든 요소를 복사(스프레드 문법)하고, value를 그 뒤에 추가하여 새로운 배열을 만듭니다. 
                                                                                // type !== value는 현재 순회 중인 type이 event.target.value와 다르면 true를 반환합니다. 결과적으로, event.target.value와 같은 값만 필터링에서 제외되어 배열에서 제거
        );
    }

    // 충전사 체크박스 핸들러
    const handleChargerComp = (event:  React.ChangeEvent<HTMLInputElement>)=>{
        const {value, checked} = event.target;
        setSelectedChargerComps((prev) =>
            checked ? [...prev, value] : prev.filter((comp) => comp !== value)
        );
    }

    // '결과보기'버튼 클릭시 필터데이터를 부모로 전달
    const handleResultButton = () => {
        const filters = {
            canUse,
            parkingFree,
            limitYn,
            radius: selectedRange,
            outputMin: selectedSpeedMin,
            outputMax: selectedSpeedMax,
            chargerTypes: selectedChargerTypes,
            chargerComps: selectedChargerComps,
        }; 
        onApplyFilters(filters);
        onClose();
    }

    if(!isOpen) return null;

  return (
    <div className={style.modalBackdrop}>
        {/* 모달본체 */}
        <div className="bg-white rounded w-full max-w-xl p-6 relative flex flex-col h-[80vh]">
            {/* 헤더 */}
            <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>
                &times;
            </button>
            <h2 className="mb-4 font-bold">필터</h2>

            {/* 탭메뉴 */}
            <div className="flex gap-2 border-b pb-2 mb-4 sticky top-0 bg-white z-10" style={{borderColor:'#f2f2f2'}}> {/* sticky로 상단조정*/}
                { tabMenu.map((item) => (
                    <button key={item.value} className={`${style.filterList} ${activeTab === `${item.value}` ? style.active : ''}`}
                        onClick={() => handleTabClick(item.value)}>{item.value}</button> 
                ))}
            </div>
            
            {/* 스크롤 가능한 영역 */}
            <div className="scrollContent">
                {/* 속성설정 */}
                <div ref={propSectionRef} className="mb-8">  
                    <h4 className="mb-2" style={{color:'#666'}}>속성</h4>
                    <div className="flex gap-2 mb-4">
                        <button className={`${style.propYn} ${canUse ? style.active : ''}`} 
                                onClick={() => handlePropToggle('canUse')}>충전가능</button>
                        <button className={`${style.propYn} ${limitYn ? style.active : ''}`} 
                                onClick={() => handlePropToggle('limitYn')}>개방</button>
                        <button className={`${style.propYn} ${parkingFree ? style.active : ''}`} 
                                onClick={() => handlePropToggle('parkingFree')}>무료주차</button>
                    </div>
                </div>
                {/* 탐색반경 설정 */}
                <div ref={rangeSectionRef} className="mb-8">
                    <h4 className="mb-2" style={{color:'#666'}}>탐색반경</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {range.map((item) => (
                            <button key={item.value} className={`${style.propYn} ${selectedRange === item.value ? style.active : ''}`}
                                    onClick={(e)=>handleRange(item.value)}>
                                {item.value === 0 ? '전국' : `${item.value / 1000}km`}
                            </button>
                        ))}
                        {/* <Slider setRange={handleRange}/> */}
                    </div>
                </div>
                {/* 충전속도 설정 */}
                <div ref={speedSectionRef} className="mb-8">
                    <h4 className="mb-2" style={{color:'#666'}}>충전속도</h4>
                    <div className="mb-4">
                        <TwowaySlider min={selectedSpeedMin}
                                        max= {selectedSpeedMax}
                                        setMinMax={handleChargingSpeed}/>
                    </div>
                </div> 
                {/* 커넥터 설정 */}
                <div ref={connectorSectionRef} className="mb-8">
                    <h4 className="mb-2" style={{color:'#666'}}>커넥터</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {connectorTypes.map((item)=>(
                            <button key={item.value} className={`${style.propYn} ${selectedChargerTypes.includes(item.value) ? style.active : ''}`}
                                    onClick={()=> handleConnectorType({target: {value: item.value, checked: !selectedChargerTypes.includes(item.value)}} as React.ChangeEvent<HTMLInputElement>)}>
                                {item.value}
                            </button>
                            
                        ))}
                    </div>
                </div>
                {/* 충전사 설정 */}
                <div ref={chargerCompSectionRef} className="mb-8">
                    <h4 className="mb-2" style={{color:'#666'}}>운영기관</h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4"> 
                        {chargingComp.map((item, idx) => (
                            <label key={`${idx}-${item.value}`} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" key={item.value} value= {item.value}
                                        checked={selectedChargerComps.includes(item.value)}
                                        onChange={handleChargerComp}
                                        className="form-checkbox h-4 w-4 text-[#4FA969] rounded border-gray-300 focus:ring-[#4FA969]" /> 
                                <span>{item.value}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div> 
            <div className="pt-4 border-t sticky bottom-0 bg-white z-10" style={{borderColor:'#f2f2f2'}}> {/* mt-auto와 sticky, z-10 추가 */}
                <button className="w-full bg-[#4FA969] text-white rounded py-3 mt-3" onClick={()=>handleResultButton()}>n개의 결과보기</button>
            </div>
        </div>
    </div>
  )
    }
