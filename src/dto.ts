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

// 충전기 상세정보
export interface ConnectorInfo {
  type: string;
  speeds: {
    min: number;
    max: number;
  };
  available: boolean;
}
// export interface ChargerInfo{
//     resultCode: string;             // 예: "00"
//     resultMsg: string;              // 예: "성공"
//     chargeTp: string;               // 예: "1" (완속/급속 구분 등)
//     cpTp: string;                   // 예: "5" (충전기 타입)
//     csId: string;                   // 충전소 ID
//     csNm: string;                   // 충전소 이름
//     cpStat: string;                 // 충전기 상태 코드
//     addr: string;                   // 주소
//     lat: number;                    // 위도
//     longi: number;                  // 경도
//     startUpdatetime: string;        // ISO 날짜 문자열
// }

// // 전기차충전소 응답dto
// export interface ChargingStationResponseDto{
//     cpNums: number;
//     totalNum: number;
//     evStoreResults: ChargerInfo[];
//}


export interface ChargingStationResponseDto{
    chargingStations:{
        stationId: string;
        name: string;
        location:{
            latitude: number;
            longitude: number;
        }
        distanceKm: number;
        connectors: ConnectorInfo[];
        isOpen: boolean;
        freeParking: boolean;
        membership: string[];
        providers: string;
    }[];
}



