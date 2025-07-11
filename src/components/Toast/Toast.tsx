import { useEffect } from 'react';
import style from './Toast.module.css'; // 아래 CSS를 포함하는 파일

interface ToastProps {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function Toast({ message, setMessage }: ToastProps) {
    // 메시지가 바뀔 때마다 실행
    useEffect(() => {
        if (message) {
            // 3초 후에 메시지를 자동으로 지우는 타이머 설정
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);

            // 컴포넌트가 사라지거나 메시지가 바뀌면 타이머를 정리
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    if (!message) return null;

    return (
        <div className={style.toast}>
            {message}
        </div>
    );
}
