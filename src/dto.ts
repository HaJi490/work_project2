// 전기차충전소 요청dto
export interface ChargingStationRequestDto{
  carModel: string;
  batteryLevel: number;
  currentLocation: {
    latitude: number
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  }
  searchRadiusKm: number; // 탐색반경
  connectorTypes: string[];
  chargingSpeeds: {
    min: number;
    max: number;
  }
  availableOnly: boolean;
  isOpen: boolean;
  freeParking: boolean;
  membership: string[]; // 멤버십
  providers: string[];  // 충전사
}

// 전기차충전소 응답dto
// 충전소별
export interface ChargingStationResponseDto {
  statNm: string;          // 충전소 이름
  statId: string;          // 충전소 ID
  addr: string;            // 주소
  lat: number;            
  lng: number;            
  parkingFree: boolean;    // 주차 무료 여부
  limitYn: boolean;        // 이용 제한 여부
  totalChargeNum: number;  // 전체 충전기 수
  chargeNum: number;       // 사용 가능한 충전기 수
  enabledCharger: number | null; // (예비용 필드, 현재 null)
  busiId: string;          // 사업자 코드
  busiNm: string;          // 사업자 이름 (충전사)
}

// export interface ChargingStationResponseDto {
//   statNm: string;
//   statId: string;
//   chgerId: string;
//   chgerType: string;
//   addr: string;
//   addrDetail: string | null;
//   location: string | null;
//   useTime: string;
//   lat: string;
//   lng: string;
//   busiId: string;
//   bnm: string;
//   busiNm: string;
//   busiCall: string;
//   stat: string;
//   statUpdDt: string;
//   lastTsdt: string;
//   lastTedt: string;
//   nowTsdt: string;
//   powerType: string;
//   output: string;
//   method: string;
//   zcode: string;
//   zscode: string;
//   kind: string;
//   kindDetail: string;
//   parkingFree: string;
//   note: string;
//   limitYn: string;
//   limitDetail: string;
//   delYn: string;
//   delDetail: string;
//   trafficYn: string;
//   year: string;
//   floorNum: string;
//   floorType: string;
// }

// // 🔹 items 객체 안의 item 배열
// export interface ItemsWrapper {
//   item: ChargingStationResponseDto[];
// }

// // 🔹 전체 응답 타입
// export interface ChargerResponse {
//   resultMsg: string;
//   totalCount: number;
//   items: ItemsWrapper;
//   pageNo: number;
//   resultCode: string;
//   numOfRows: number;
// }





