import React, { ReactElement } from "react";
import Nav from "@/components/Nav/Nav";
import { IoMdHome } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { BiSolidCar } from "react-icons/bi";
import { LiaCarSideSolid } from "react-icons/lia";
import { FiCheckCircle } from "react-icons/fi";

type StepItem = {
    label: string;
    icon: ReactElement;
}

export default function signup() {
    const steps: StepItem[] = [
        {label: "회원정보", icon: <FiEdit/> },
        {label: "차량정보", icon: <BiSolidCar/> },
        {label: "가입완료", icon: <FiCheckCircle/> }
    ]
  return (
    <div className="w-full min-h-screen flex flex-col">
        <Nav />
        <main className="w-full py-20 flex flex-col justify-center items-center px-4">
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
                            <span>{step.icon}</span>
                            <p className="text-[15px]">{step.label}</p>
                        </div>
                        {/* /마지막이 아닌 경우에만 선 추가 */}
                        { i < arr.length - 1 && (
                            <hr className="w-8 border-[#f2f2f2] "/>
                        )}
                    </React.Fragment>
                ))}
                {/* <div className="flex flex-col justify-center">
                    <p className="text-[9px] text-[#afafaf] text-center">STEP</p>
                    <p className="text-[15px] text-[#afafaf] text-center font-semibold">01</p>
                    <span className="text-2xl text-[#afafaf] text-center"><IoMdHome/></span>
                    <p className="text-[15px] text-[#afafaf] text-center font-medium">회원정보</p>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[9px] text-[#afafaf] text-center">STEP</p>
                    <p className="text-[15px] text-[#afafaf] text-center font-semibold">02</p>
                    <span className="text-2xl text-[#afafaf] text-center"><IoMdHome/></span>
                    <p className="text-[15px] text-[#afafaf] text-center font-medium">차량정보</p>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[9px] text-[#afafaf] text-center">STEP</p>
                    <p className="text-[15px] text-[#afafaf] text-center font-semibold">03</p>
                    <span className="text-2xl text-[#afafaf] text-center"><IoMdHome/></span>
                    <p className="text-[15px] text-[#afafaf] text-center font-medium">가입완료</p>
                </div> */}
                
            </div>

            {/* 필수입력 */}
            <div className="w-7/10">
                <h3 className='text-left font-medium text-[28px]'>필수입력 정보</h3>
                <span className="text-left text-[15px] text-[#666] mb-4">필수항목이므로 반드시 입력해 주시기 바랍니다.</span>
                <hr className="border-[#afafaf] border-[1.5px]"/>
                <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4">
                    {/* 이름 */}
                    <label className=""> 이름</label>
                    <input type="text" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none" />
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    {/* 아이디 */}
                    <label className="">아이디</label>
                    <div className="felx gap-2">
                        <input type='text' className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none" />
                        <button type="button" className="border px-4 py-3 ml-4"> 중복확인</button>
                    </div> 
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    {/* 비밀번호 */}
                    <label>비밀번호</label>
                    <input type="password" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none" />
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    <label>비밀번호 확인</label>
                    <input type="password" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none" />
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    {/* 휴대폰번호 */}
                    <label>휴대폰 번호</label>
                    <div>
                        <input type="number" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                        <input type="number" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                        <input type="number" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                    </div>
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    {/* 이메일 */}
                    <label>이메일</label>
                    <div className="">
                        <input type="text" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/> @ 
                        <input type="text" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                        <select>
                            <option>직접입력</option>
                            <option>naver.com</option>
                            <option>google.com</option>
                        </select>
                        <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                    </div>
                </div>

                {/* 선택입력 정보 */}
                <h3 className='text-left font-medium text-[28px]'>선택입력 정보</h3>
                <hr className="border-[#afafaf] border-[1.5px]"/>
                <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4">
                    <label>주소</label>
                    <div className="flex flex-col gap-4">
                        <div>
                            <input type="text" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                            <button type="button" className="border px-4 py-3 ml-4">우편번호 검색</button>
                        </div>
                        <input type="text" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                        <input type="text" placeholder="상세주소를 입력해주세요" className="px-4 py-3 rounded border border-[#afafaf] focus:ouline-none"/>
                    </div>
                    <div className="col-span-2 border-[0.5px] border-[#f2f2f2]" />
                </div>
            </div>
            <div className="flex">
                <button>취소</button>
                <button>가입</button>
            </div>
        </main>
    </div>
  )
}
