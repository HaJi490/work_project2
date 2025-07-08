'use client'

import {useState} from 'react';
import { DayPicker, DateRange } from 'react-day-picker';

export default function page() {
    const [openDropdown, setOpenDropdown] = useState<string|null>(null);
    const [selectedStation, setSelectedStation] = useState<string>('충전소 선택');
    const [selectedCharger, setSelectedCharger] = useState<string>('충전기 선택');
    const [selectedDate, setSelectedDate] = useState<string>('시간대 선택');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('시간대 선택');

    const toggleDropdown = (type: string) => {
        setOpenDropdown(prev => (prev === type ? null : type));
    }

  return (
    <div className='relative flex flex-col items-center'>
        {/* 상단바 */}
        <div className="flex gap-4 border rounded-full px-4 py-2 shadow-md">
            <button onClick={() => toggleDropdown('station')} className="px-2">
                {selectedStation}
            </button>
            <button onClick={() => toggleDropdown('charger')} className="px-2">
                {selectedCharger}
            </button>
            <button onClick={() => toggleDropdown('date')} className="px-2">
                {/* {formatDate(dateRange)} */}
            </button>
            <button onClick={() => toggleDropdown('time')} className="px-2">
                {selectedTimeSlot}
            </button>
        </div>
        {/* 드롭다운 */}
        <div className="absolute top-16 bg-white border rounded shadow-md p-4 w-[300px]">
            {openDropdown === 'station' && (
                <div>
                    <p>근처 충전소, 즐겨찾기, 최근 이용한, 검색 - 지도리스트==</p>
                </div>
            )}
            {openDropdown === 'charger' &&
                <div className="absolute top-16 bg-white border rounded shadow-md p-4 w-[300px]">
                    <p>충전기 리스트 - 지도상세 =</p>
                </div>
            }
            {openDropdown === 'date' &&
                <div className="absolute top-16 bg-white border rounded shadow-md p-4 w-[300px]">
                    <p>충전기 리스트 - 지도상세 =</p>
                </div>
            }

            
        </div>
    </div>
  )
}
