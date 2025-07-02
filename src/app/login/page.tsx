'use client'

import Nav from "@/components/Nav/Nav"

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import Image from "next/image"

import { IoMdHome } from "react-icons/io";

export default function page() {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  
  const route = useRouter();

  const login = async() =>{
    console.log(id, pwd);
    try{
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/login`,{
        username: id,
        password: pwd
      },{
        withCredentials: true
      })
      const token = res.headers.authorization 
      console.log(token);

      if(token){
        localStorage.setItem("accessToken", token);
      }

      route.push('/');
    } catch(error: any){
      console.error("로그인 에러: ", error.response || error)
      alert(error.response?.data?.message || "다시 로그인을 시도해주세요.")
      if (error.response && error.response.status === 401) {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
    }
  }

  return (
    <div className="min-h-screen flex flex-col"> 
      <Nav />
      <span className="text-[12px] text-[#afafaf] flex"><IoMdHome />&nbsp;{'>'} 로그인</span>
      <main className='w-screen flex-grow flex flex-col justify-center items-center bg-white px-4 pb-[50px]'>
        {/* <span className="text-red-500">OR에 border 안생김(크기조정하면 있긴함)</span> */}
        <form className="w-5/10 max-w-[400px] sm:w-96 px-6" onSubmit={e => {e.preventDefault(); login();}}>
          <h2 className='text-center font-medium text-[28px] tracking-wide mb-6'>로그인</h2>
          {/* <div className='grid gap-3 justify-center mb-3'> */}
            <div className="mb-4">
              <label className='block text-[12px] text-[#afafaf] mb-1'>Email</label>
              <input type='text' value={id} onChange={e=> setId(e.target.value.trim())} required
                    className='w-full px-4 py-3 border border-[#afafaf] focus:ouline-none focus:outline-[#4FA969]'/>
            </div>
            <div className="mb-4">
              <label className='block text-[12px] text-[#afafaf] mb-1'>Password</label>
              <input type='password' value={pwd} onChange={e=> setPwd(e.target.value.trim())} required  // 사용자가 입력안하면 브라우저가 경고
                    className='w-full px-4 py-3 border border-[#afafaf] focus:ouline-none focus:outline-[#4FA969]'/>
            </div>
              <button type='submit' className='w-full px-4 py-3 bg-[#4FA969] text-white text-center font-semibold mb-4'>로그인</button>
          {/* </div> */}
        </form>
        <div className='text-[#666] text-[15px] flex gap-3'>
            <span>회원가입</span>
            <span>비밀번호찾기</span>
        </div>
        <div className="flex justify-center my-4">
          <hr className="flex-grow border-t border-[#666]"/>
          <span className="text-[12px] text-[#666]">OR</span>
          <hr className="flex-grow border-t border-[#666]"/>
        </div>
        <div className="flex justify-center gap-6">
          <Image src="/Group 11.png" alt='gw로고' width={50} height={50} priority/>
          <Image src="/Group 12.png" alt='gw로고' width={50} height={50} priority/>
          <Image src="/Group 13.png" alt='gw로고' width={50} height={50} priority/>
        </div>
            
      </main>
    </div>
  )
}
