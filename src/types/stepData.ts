import { ReactElement } from "react";
import { FiEdit } from "react-icons/fi";
import { BiSolidCar } from "react-icons/bi";
import { LiaCarSideSolid } from "react-icons/lia";
import { FiCheckCircle } from "react-icons/fi";

import React from 'react'

export type StepItem = {
    label: string;
    icon: ReactElement;
}

export const steps: StepItem[] = [
    { label: "회원정보", icon: <FiEdit/> },
    { label: "차량정보", icon: <BiSolidCar/> },
    { label: "가입완료", icon: <FiCheckCircle/> }
];