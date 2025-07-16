// 전기차충전소 요청dto
export interface CoordinatesDto {
  lat: number;
  lon: number;
  radius: number;
}

export interface MapQueryDto {
  useMap: boolean;
  limitYn: boolean;
  parkingFree: boolean;
  canUse: boolean;
  outputMin: number;
  outputMax: number;
  busiId: string[];     // 사업자 ID 리스트
  chgerType: string[];  // 충전기 타입 리스트
  keyWord?: string;
}

export interface ChargingStationRequestDto {
  coorDinatesDto: CoordinatesDto;
  mapQueryDto: MapQueryDto;
}

// 전기차충전소 응답dto
export interface ChargerInfoItem {
  statNm: string;
  statId: string;
  chgerId: string;
  chgerType: string;
  addr: string;
  lat: number;
  lng: number;
  useTime: string;
  location: string | null;
  startUpdatetime: string | null;
  stat: string;
  statUpdDt: string;
  lastTsdt: string;
  lastTedt: string;
  nowTsdt: string;
  output: string;
  method: string;
  kind: string;
  kindDetail: string;
  parkingFree: string;
  note: string;
  limitYn: string;
  limitDetail: string;
  delYn: string;
  busiId: string;
  busiNm: string;
}

export interface ChargerInfoMap {
  [chgerId: string]: ChargerInfoItem;
}

export interface ChargingStationResponseDto {
  statNm: string;
  statId: string;
  addr: string;
  lat: number;
  lng: number;
  parkingFree: boolean;
  limitYn: boolean;
  totalChargeNum: number;
  totalFastNum: number;
  totalSlowNum: number;
  chargeFastNum: number;
  chargeSlowNum: number;
  totalMidNum: number;
  chargeMidNum: number;
  chargeNum: number;
  enabledCharger: string[];
  busiId: string;
  busiNm: string;
  chargerInfo: ChargerInfoMap;
  useTime: string;
}


// 회원가입 reqest
export interface SignupRequest {
  username: string;
  nickname: string;
  password: string;
  phoneNumber: string;
  email: string;
  sex: 'male' | 'female'| undefined;
  zipcode?: string; // 선택 입력이므로 optional로 처리
  roadAddr?: string; // 선택 입력이므로 optional로 처리
  detailAddr?: string; // 선택 입력이므로 optional로 처리
  createAt: string | Date; // Date 객체일 수도 있고, ISO 문자열일 수도 있음
}


// 예약현황 request
export interface ReservationStatusRequestDto {
  statId: string;
  date: string;      // 예: "2025-07-06"
  chgerId: string;
}

// 예약현황 response
export interface TimeInfo {
  statId: string;
  chgerId: string;
  timeId: number;
  date: string;         // 예: "2025-07-06"
  startTime: string;    // 예: "00:00:00"
  endTime: string;      // 예: "00:29:59"
  enabled: boolean;
}

// 충전스케줄링 - 예약정보
// chargerId 타입
interface ChargerId {
  statId: string;
  chgerId: string;
}

// storeInfo 타입
interface StoreInfo {
  statId: string;
  statNm: string;
  addr: string;
  lat: number;
  lng: number;
  parkingFree: boolean;
  limitYn: boolean;
  enabledCharger: string[];
  busiId: string;
  busiNm: string;
  chargerNm: number | null;
}

// charger 타입
export interface Charger {
  chargerId: ChargerId;
  chgerType: string;
  output: number;
  storeInfo: StoreInfo;
}

// slot 타입
export interface Slot {
  timeId: number;
  charger: Charger;
  date: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

// 예약데이터
export interface Reservation {
  reserveId: number;
  username: string;
  slot: Slot;
  reserveDate: string;
  updateDate: string;
  reseverState: string;
}

// 찐디티오 ---- 삭제
export interface MyReservationDto{
  [date: string]: Reservation[];
}


// 마이페이지 - 회원정보
export interface User {
  username: string;         // 사용자 아이디
  nickname: string;         // 닉네임
  password: string | null;  // 비밀번호 (null 허용)
  phoneNumber: string;      // 전화번호
  email: string;            // 이메일
  sex: 'male' | 'female';   // 성별
  address: string;          // 주소
  enabled: boolean;         // 활성화 여부
  createAt: string;         // 생성일시 (ISO 형식 문자열)
};


// 마이페이지 - 충전히스토리
// 충전히스토리 타입 선언
export interface ChargingHistoryItem  {
  statNm: string;            // 충전소 이름
  chgerId: string;           // 충전기 ID
  chargeDate: string;        // 충전 날짜 (YYYY.MM.DD)
  chargeSTime: string;       // 충전 시작 시간 (HH:mm)
  chargeETime: string;       // 충전 완료 시간 (HH:mm)
  chargeAmount: number;      // 충전량 (kWh)
  chargeCost: number;        // 충전 금액
  chargeDuration: number;    // 충전 시간 (분)
  isReserved: boolean;       // 예약 여부
  reservedSTime: string;     // 예약 시작 시간 (HH:mm)
  reservedETime: string;     // 예약 완료 시간 (HH:mm)
  chgerType: string;         // 충전기 종류
  busiNm: string;            // 사업자명
  // 결제수단, 충전기위치 등 추가 가능
};

export interface History {
  monthlyChargeCount: number;           // 월 충전 횟수
  monthlyChargeAmount: number;          // 월 충전량 (kWh)
  monthlyChargeCost: number;            // 월 충전 금액
  chargingHistory: ChargingHistoryItem[]; // 충전 내역 리스트
};


