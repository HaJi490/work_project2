'use client'

import { useState, useRef } from 'react'
import style from './SpeedSlider.module.css'

const max = 300
const min = 0

export default function SpeedSlider() {
  const [minValue, setMinValue] = useState<number>(min);
  const [maxValue, setMaxValue] = useState<number>(max);

  // // 핸들위치 저장
  // const minRef = useRef<HTMLInputElement>(null);
  // const maxRef = useRef<HTMLInputElement>(null);

  // // 핸들 위치를 저장할 상태 (tooltip 위치 계산용)
  // const [minHandlePos, setMinHandlePos] = useState(0);
  // const [maxHandlePos, setMaxHandlePos] = useState(0);


  // 1. 핸들 값 업데이트
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 50); //최소간격 확보
    setMinValue(value);
  }
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 50); //최소간격 확보
    setMaxValue(value);
  }

  // // 2. 핸들 위치 업데이트 -------------------------FIXME 슬라이더 핸들위에 수치가 뜰수있게
  // const updateHandlePositions = () => {
  //   if(minRef.current){
  //     const minVal = Number(minRef.current.value);
      
  //   }
  // }

  return (
    <div className="w-full px-4">
      
      <div className="relative h-6">
        {/* 트랙 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 rounded-full -translate-y-1/2" />
        {/* 선택된 범위 */}
        <div
          className="absolute top-1/2 h-1 bg-[#4FA969] rounded-full -translate-y-1/2"
          style={{
            left: `${(minValue / max) * 100}%`,
            right: `${100 - (maxValue / max) * 100}%`,
            pointerEvents: 'none', 
          }}
        />
        {/* 슬라이더 입력 */}
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          step="50"
          onChange={handleMinChange}
          className={style.handleChg}
          style={{ zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          step="50"
          onChange={handleMaxChange}
          className={style.handleChg}
          style={{ zIndex: 2 }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{minValue === 0 ? '완속' : `${minValue}kW`}</span>
        <span>{maxValue >= 300 ? '300kW+' : `${maxValue}kW`}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        선택 범위: {minValue === 0 ? '완속' : `${minValue}kW`} ~{' '}
        {maxValue >= 300 ? '300kW+' : `${maxValue}kW`}
      </p>
    </div>
  )
}
