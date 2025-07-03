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
// // 충전소별
// export interface ChargingStationResponseDto {
//   statNm: string;          // 충전소 이름
//   statId: string;          // 충전소 ID
//   addr: string;            // 주소
//   lat: number;            
//   lng: number;            
//   parkingFree: boolean;    // 주차 무료 여부
//   limitYn: boolean;        // 이용 제한 여부
//   totalChargeNum: number;  // 전체 충전기 수
//   chargeNum: number;       // 사용 가능한 충전기 수
//   enabledCharger: number | null; // (예비용 필드, 현재 null)
//   busiId: string;          // 사업자 코드
//   busiNm: string;          // 사업자 이름 (충전사)
// }






