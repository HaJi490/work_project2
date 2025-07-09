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






