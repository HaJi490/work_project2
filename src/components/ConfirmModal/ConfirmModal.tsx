import React from 'react'

import style from './ConfirmModal.module.css'
import { AiOutlineExclamationCircle } from "react-icons/ai";

interface ConfirmModalProps {
    message: string;
    submsg: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ message, submsg, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="flex flex-col bg-white rounded-xl p-6 shadow-lg min-w-sm min-h-80 text-center">
                <div className='flex-1 flex flex-col justify-center items-center'>
                    <span className='text-[#4FA969] bg-[#a2f3b93d] rounded-full p-2 mb-4'><AiOutlineExclamationCircle size={30}/></span>
                    <p className="text-lg font-bold mb-1">{message}</p>
                    <p className="text-sm text-[#666]">{submsg}</p>
                </div>
                <div className="flex bottom-2 justify-center gap-4">
                    <button onClick={onCancel} className="btn cancel">취소</button>
                    <button onClick={onConfirm} className="btn confirm">확인</button>
                </div>
            </div>
        </div>
    )
}
