import { useState, useEffect } from 'react';
import type { Coordinates } from '../types/bin';

// 서울 안국역 중심 기본 좌표 (GPS 미지원 또는 권한 거부 시 기본값)
export const DEFAULT_ANGUK_COORDS: Coordinates = {
  lat: 37.57685,
  lng: 126.98565,
};

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_ANGUK_COORDS);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보(GPS)를 지원하지 않습니다.');
      setIsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // 서울 외곽이나 해외 위치일 경우 안국/서촌 탐색 편의를 위해 시뮬레이션 지원 가능
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // 종로구 일대(37.5~37.6, 126.9~127.0)에 가까운지 확인
        const isNearJongno =
          userLat > 37.55 && userLat < 37.61 && userLng > 126.95 && userLng < 127.02;

        if (isNearJongno) {
          setCoords({ lat: userLat, lng: userLng });
          setIsSimulated(false);
        } else {
          // 멀리 있더라도 기본은 실제 위치 표시하되 원터치로 안국으로 이동할 수 있도록 함
          setCoords({ lat: userLat, lng: userLng });
        }

        setAccuracy(position.coords.accuracy);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Geolocation error, defaulting to Anguk:', err.message);
        setError(err.message);
        setCoords(DEFAULT_ANGUK_COORDS);
        setIsSimulated(true);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 안국/서촌 핫스팟으로 빠른 위치 이동 (테스트 & 데모용)
  const jumpToLocation = (targetCoords: Coordinates) => {
    setCoords(targetCoords);
    setIsSimulated(true);
  };

  return {
    coords,
    accuracy,
    error,
    isLoading,
    isSimulated,
    jumpToLocation,
  };
}
