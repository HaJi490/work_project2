'use client'

import React, { ReactElement, useState, useEffect } from 'react'
import axios from 'axios';

import style from '../signup/signup.module.css'
import Nav from '@/components/Nav/Nav';
import { FiEdit } from "react-icons/fi";
import { BiSolidCar } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";

type StepItem = {
    label: string;
    icon: ReactElement;
}

export default function page() {
    const [brand, setBrand] = useState<string>('');
    const [brandDt, setBrandDt] = useState<string[]>();
    const [showBrand, setShowBrand] = useState<boolean>(false);

    const [model, setModel] = useState<string>('');
    const [modelDt, setModelDt] = useState<string[]>();
    const [showModel, setShowModel] = useState<boolean>(false);

    const [chulgoYear, setChulgoYear] = useState<string>();

    
    const steps: StepItem[] = [
            {label: "회원정보", icon: <FiEdit/> },
            {label: "차량정보", icon: <BiSolidCar/> },
            {label: "가입완료", icon: <FiCheckCircle/> }
    ]

    
    const brandResp = () => {
        try{
            //const res = await axios.get(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080`);
            setBrandDt(res.data);
            setShowBrand(true);
        } catch(error){
            console.error("brandResp:: ", error);
        }
    }

    const modelResp = (brand: string) => {
        try{
            //const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080`, {brand: brand});
            setModelDt(res.data);
            setShowModel(true);
        } catch(error){
            console.error("brandResp:: ", error);
        }
    }



  return (
    <>
        <main className="w-full py-25 flex flex-col justify-center items-center px-4">
            <h2 className='text-center font-medium text-[28px] tracking-wide mb-6'>회원가입</h2>
            {/* step UI */}
            <div className="flex justify-center items-center gap-8 mb-10 text-[#afafaf]">
                {steps.map((step, i, arr) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center text-center">
                            {/* <p>STEP</p> */}
                            <div className="font-semibold text-[15px]">
                                0{i + 1}
                            </div>
                            <span className= {`text-[24px] my-2 ${i === 1 ? 'text-[#4FA969]' : ''}`}>{step.icon}</span>
                            <p className="text-[15px]">{step.label}</p>
                        </div>
                        {/* /마지막이 아닌 경우에만 선 추가 */}
                        { i < arr.length - 1 && (
                            <hr className="w-8 border-[#f2f2f2] "/>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="w-7/10 max-w-[1100px] mb-5">
                <h3 className='text-left font-medium text-[28px]'>필수입력 정보</h3>
                <span className="text-left text-[15px] text-[#666] mb-7">필수항목이므로 반드시 입력해 주시기 바랍니다.</span>
                <hr className="border-[#afafaf] border-[1.5px] mb-3"/>
                <div className="grid grid-cols-[1fr_3fr] justify-center items-center gap-4 mb-15">
                    {/* 브랜드 */}
                    <label className=""> 차량브랜드</label>
                    <input type="text" value={brand} className={`${style.inputbox} max-w-[450px]`}//onChange={(e) => setBrand(e.target.value.trim())} 
                            onClick={()=>brandResp()}  onBlur={() => setTimeout(() => setShowBrand(false), 100)}/>
                    {showBrand && brandDt?.map(item => (
                        <button key={item} className={`propYn ${brand === item? 'active' : ''}`}
                                onMouseDown={() => setBrand(item)}> 
                                {/* onClick={(e) => setBrand(brand)}  */}
                            {item}
                        </button>
                    ))}
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    {/* 모델 */}
                    <label className=""> 차량모델</label>
                    <input type="text" value={model} className={`${style.inputbox} max-w-[450px]`} 
                            onClick={()=>modelResp(brand)}  onBlur={() => setTimeout(() => setShowBrand(false), 100)}/>
                    {showModel && modelDt?.map(m =>(
                        <button key={m} className={`propYn ${model === m? 'active' : ''}`} 
                                onMouseDown={() => setModel(m)}>
                            {m}
                        </button>
                    ))}
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    
                </div>
                <h3 className='text-left font-medium text-[28px]'>선택입력 정보</h3>
                <hr className="border-[#afafaf] border-[1.5px] mb-3"/>
                <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 justify-center items-center">
                    <label className=""> 충전선호 시간</label>
                    <div className="flex gap-3 items-center">
                        <input type="text" value={chulgoYear} onChange={(e) => setChulgoYear(e.target.value.trim())} className={`${style.inputbox} max-w-[200px]`} /> ~
                        <input type="text" value={chulgoYear} onChange={(e) => setChulgoYear(e.target.value.trim())} className={`${style.inputbox} max-w-[200px]`} />
                    </div>
                        <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                </div>
            </div>
            <div className="flex gap-5">
                <button className={`${style.btn} ${style.cancel}`}>이전</button>
                <button onClick={()=> {}} className={`${style.btn} ${style.confirm}`}>가입</button>
            </div>
        </main>
    </>
  )
}
