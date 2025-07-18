import React from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full h-screen flex">
            <Sidebar />
            <main className="flex-1 p-4">
                {children}
            </main>
        </div>
    );
}
