'use client'

import React, {useState, createContext, useContext, ReactNode} from 'react'
import Image from 'next/image';
import SidebarItem from './SidebarItem';
import { 
    LuLayoutDashboard, LuFileText
} from "react-icons/lu";
import { FiUser, FiSettings, FiCalendar   } from "react-icons/fi";


// 메뉴 아이템 데이터구조
const navItems = [
    {
        name: 'Dashboard', 
        icon: <LuLayoutDashboard size={20}/>, 
        path:'/admin/dashboard',
    },
    {
        name: 'Reservation',
        icon: <FiCalendar size={20}/>,
        path: 'admin/manageReserv'
    },
    {
        name: 'Customers',
        icon: <FiUser size={20}/>,
        path: 'admin/manageMem'
    },
    {
        name: 'Setting',
        icon: <FiSettings size={20}/>,
        path: 'admin/setting'
    }
]

// Context를 사용하여 상태 공유 - props없이 바로 전달가능
export const SidebarContext = createContext<{ expanded: boolean }>({ expanded: true });


export default function Sidebar() {
    const [expanded, setExpanded] = useState(true);

    return (
        <aside className= {`h-screen transition-all duration-300 ease-in-out ${expanded ? 'w-72' : 'w-20'}`}>
            <nav className='h-full flex flex-col bg-white shadow-sm'>
                <div className={` ${expanded? 'p-8 pb-8' : 'p-7'}`}>
                    {expanded
                        ?<Image src="/gwLogo.png" alt='gw로고lg' width={180} height={80} priority />
                        :<Image src="/logo_small.png" alt='gw로고sm' width={30} height={30} priority />
                    }
                </div>
                {/* Context Provider로 expanded 상태를 하위 컴포넌트에 전달 */}
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className='flex-1 px-3' onClick={()=>setExpanded(!expanded)}>
                        {navItems.map((item, idx) => (
                            <SidebarItem  key={idx} item={item}/>
                        ))}
                    </ul>
                </SidebarContext.Provider>

                <div className="border-t flex p-3">
                    <img src="https://via.placeholder.com/40" alt="Avatar" className="w-10 h-10 rounded-md" />
                    <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? 'w-52 ml-3' : 'w-0'}`}>
                        <div className="leading-4">
                            <h4 className="font-semibold">John Doe</h4>
                            <span className="text-xs text-gray-600">johndoe@gmail.com</span>
                        </div>
                        <LuFileText size={20} />
                    </div>
                </div>

            </nav>
        </aside>
    )
}
