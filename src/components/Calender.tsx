import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { ClassNames } from 'react-day-picker';
import { Formatters } from 'react-day-picker'; 

// dayPicker에 적용할 css
const customClassNames: Partial<ClassNames> = {
    // 전체 DayPicker container
    root: 'w-full p-4 rounded-xl shadow-lg bg-white',
    
    // 헤더 (월/년도, 이전/다음 버튼 포함)
    caption: 'flex justify-center py-2 relative items-center',
    caption_label: 'text-lg font-semibold text-gray-800', // 월/년도 텍스트

    // 이전/다음 버튼
    nav: 'flex gap-1',
    nav_button: 'flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-600',
    nav_button_previous: 'absolute left-2',
    nav_button_next: 'absolute right-2',

    // 요일 헤더 (Mo, Tu, We...)
    head: 'flex justify-between font-medium text-sm text-gray-500 mb-2',
    head_row: 'flex w-full',
    head_cell: 'flex-1 text-center py-1',

    // 날짜 그리드
    month: 'space-y-4',
    // months: 'flex', // 여러 달 표시 시 사용 (mode='single' 이면 보통 한달만 보임)
    table: 'w-full border-collapse',
    // tbody: 'divide-y divide-gray-100', // 날짜 행 구분선 (옵션)
    tfoot: '', // 푸터 (사용하지 않는다면 비워둠)

    // 날짜 셀 (개별 날짜)
    row: 'flex w-full',
    cell: 'flex-1 p-0.5', // 셀 자체의 패딩 조절

    // 개별 날짜 버튼
    day: 'w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium text-gray-800 cursor-pointer rounded-full hover:bg-gray-100',
    day_selected: 'bg-black text-white', // 선택된 날짜
    day_today: 'border border-gray-300 ', // 오늘 날짜 (선택되지 않았을 때)
    day_disabled: 'text-gray-400 opacity-60 cursor-not-allowed', // 비활성화된 날짜
    day_outside: 'text-gray-400 opacity-60', // 현재 달이 아닌 날짜
    day_range_start: '',
    day_range_end: '',
    day_range_middle: '',
    day_hidden: '', // display: none 된 날짜
}

interface CustomDayPickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  handleTimeslots: (date: Date) => void; // 부모 컴포넌트에서 전달받는 함수
}


export default function Calender({ selectedDate, onSelectDate, handleTimeslots }: CustomDayPickerProps) {
    const today = new Date();   // 이전날짜 선택안되도록
    today.setHours(0, 0, 0, 0);

    return (
        <DayPicker mode='single' selected={selectedDate} disabled={{before:today}} classNames={customClassNames}
                    onSelect={(date) => {
        if (date) {
          onSelectDate(date);
          if (date >= today) {
            handleTimeslots(date);
          }
        } else {
          onSelectDate(undefined);
        }
      }} />
    )
}
