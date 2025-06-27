'use client'

import { useEffect } from "react"
import style from './FilterModal.module.css'

interface Props{
    isOpen: boolean;
    onClose: () => void;
}

export default function Filter({isOpen, onClose}: Props) {
    useEffect(() => {
        // 모달 열릴 때 스크롤 방지
        if(isOpen) {
            document.body.style.overflow = 'hidden';
        } else{
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if(!isOpen) return null;

  return (
    <div className="modalContainer">
      
    </div>
  )
}
