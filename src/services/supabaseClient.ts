import type { Coordinates, TrashBin, WasteCategory } from '../types/bin';
import { SEOUL_STREET_BINS } from '../data/seoulBinsData';
import { matchAndRankBins } from './matchingService';

/**
 * PostGIS SQL Schema Reference for Supabase (Production Setup):
 * 
 * ```sql
 * -- 1. PostGIS 익스텐션 활성화
 * create extension if not exists postgis;
 * 
 * -- 2. 쓰레기통 테이블 생성
 * create table public.trash_bins (
 *   id text primary key,
 *   name text not null,
 *   address text,
 *   detail_location text,
 *   area text not null,
 *   location geography(Point, 4326) not null,
 *   accepted_categories text[] not null,
 *   has_liquid_drain boolean default false,
 *   is_smart_bin boolean default false,
 *   fullness_level integer default 0,
 *   managed_by text default '종로구청',
 *   status text default 'available'
 * );
 * 
 * -- 3. 공간 인덱스(GIST) 생성으로 초고속 반경 쿼리 보장
 * create index trash_bins_location_idx on public.trash_bins using gist (location);
 * 
 * -- 4. PostGIS 최단거리 검색 RPC 함수
 * create or replace function find_nearest_bins(
 *   user_lat double precision,
 *   user_lng double precision,
 *   category_filter text default null,
 *   max_dist_meters double precision default 2000
 * )
 * returns table (
 *   id text,
 *   name text,
 *   dist_meters double precision
 * )
 * language sql stable as $$
 *   select 
 *     b.id,
 *     b.name,
 *     st_distance(b.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)) as dist_meters
 *   from public.trash_bins b
 *   where (category_filter is null or category_filter = any(b.accepted_categories))
 *     and st_dwithin(b.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326), max_dist_meters)
 *   order by dist_meters asc;
 * $$;
 * ```
 */

export class SupabaseService {
  private static supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  private static supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  public static isConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  }

  /**
   * 쓰레기통 목록 가져오기 (Supabase 연동 또는 로컬 PostGIS 시뮬레이션)
   */
  public static async fetchBins(): Promise<TrashBin[]> {
    if (!this.isConfigured()) {
      return SEOUL_STREET_BINS;
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/trash_bins?select=*`, {
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data as TrashBin[];
      }
      return SEOUL_STREET_BINS;
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local dataset:', e);
      return SEOUL_STREET_BINS;
    }
  }

  /**
   * 위치 및 품목 기준 최단거리 쓰레기통 검색
   */
  public static async findNearestBins(
    userLocation: Coordinates,
    category: WasteCategory | 'all' = 'all'
  ) {
    const bins = await this.fetchBins();
    return matchAndRankBins(bins, userLocation, {
      selectedCategory: category,
      onlyAvailable: true,
      requiresLiquidDrain: category === 'liquid',
      areaFilter: 'all',
    });
  }
}
