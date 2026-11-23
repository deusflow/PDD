import React from 'react';
import { Disc, Gauge, Lightbulb, Wrench } from 'lucide-react';
import { useUiLang } from '../../i18n/UiLangContext';
import { DictionaryEntry, UiLanguage } from '../../types';
import { DanishRoadSignSVG, PSkiveSVG } from './DanishRoadSignSVG';
import { TrafficSceneSVG } from './TrafficSceneSVG';

const TERM_SCENE_MAP: Record<string, string> = {
  term_ubetinget_vigepligt: 'pov_hajtaender_b11',
  term_hoejrevigepligt: 'pov_hojre_vigepligt',
  term_hajtaender: 'pov_hajtaender_b11',
  term_overkoersel: 'pov_overkoersel_sidewalk',
  term_fletning: 'pov_fletning_vs_skift',
  term_vognbaneskift: 'pov_fletning_vs_skift',
  term_rundkoersel: 'pov_rundkoersel',
  term_spejl_skulder: 'pov_spejl_skulder',
  term_blind_vinkel: 'cockpit_blind_spot',
  term_reaktionslaengde: 'pov_stopping_math',
  term_bremselaengde: 'pov_stopping_math',
  term_standselangde: 'pov_stopping_math',
  term_afstandsmaaling: 'pov_distance_2s',
  term_vognbane: 'curb_departure',
  term_spejl_indstilling: 'cockpit_seat_mirror',
  term_miljoe_oekokoersel: 'pov_parking_night_tomgang',
  term_vandsprøjt_koereteknik: 'pov_glass_wiper_exhaust',
  term_cykelsti: 'pov_right_turn_solid_cykelsti',
  term_fodgaengerfelt: 'pov_zebra_trap',
  term_bloede_trafikanter: 'children_school_a22',
  term_knallert_45: 'pov_knallert_cykelgade',
  term_cykelboks: 'pov_right_turn_dashed_opmarch',
  term_blind_vinkel_lastbil: 'cockpit_blind_spot',
  term_spaerrrelinje: 'pov_spaerrelinje_spaerreflade',
  term_varslingslinje: 'road_markings_lines',
  term_vognbanelinje: 'road_markings_lines',
  term_undertavle: 'pov_undertavler',
  term_jernbaneoverskaering: 'pov_rail_no_barrier',
  term_byzone: 'pov_bus_byzone',
  term_landevej: 'pov_sign_country',
  term_motorvej: 'pov_motorvej_merge',
  term_noedspor: 'pov_motorvej_breakdown_100m',
  term_paahaengsvogn: 'pov_trailer_weight',
  term_overhaling_hoeire: 'overtaking_right_exception',
  term_traek_bil_havari: 'pov_towing_max30',
  term_standsning: 'pov_parking_meters',
  term_parkering: 'pov_parking_meters',
  term_gul_kantsten: 'pov_parking_meters',
  term_3m_spaerrelinje: 'parking_5m_10m_rules',
  term_12m_busstop: 'parking_bus_driveway',
  term_30m_jernbane: 'railway_crossing',
  term_tomgang_hojre_side: 'pov_parking_night_tomgang',
  term_koerelys: 'pov_night_fog_lights',
  term_taagebaglygte: 'fog_and_aquaplaning',
  term_akvaplaning: 'fog_and_aquaplaning',
  term_promille: 'pov_alcohol_klip_law',
  term_klip: 'pov_alcohol_klip_law',
  term_koerselsforbud: 'pov_alcohol_klip_law',
  term_advarselstrekant: 'accident_triangle_112',
  term_sikkerhedssele: 'pov_child_seat_airbag',
  term_ja_nej_regel: 'pov_school_roadmap',
};

const MODULE_DEFAULT_SCENE: Record<number, string> = {
  1: 'pov_glass_wiper_exhaust',
  2: 'pov_spejl_skulder',
  3: 'pov_hajtaender_b11',
  4: 'pov_bus_byzone',
  5: 'pov_sign_shapes_abcde',
  6: 'pov_motorvej_merge',
  7: 'pov_parking_meters',
  8: 'pov_night_fog_lights',
};

function getHotspotBadge(
  hotspot?: string,
  uiLang: UiLanguage = 'ru'
): { label: string; icon: React.ReactNode } {
  const isUk = uiLang === 'uk';
  if (!hotspot) {
    return { label: 'Kontrol', icon: <Wrench className="h-5 w-5" /> };
  }
  if (hotspot.includes('lampe')) {
    return { label: 'Панель', icon: <Gauge className="h-5 w-5" /> };
  }
  if (
    hotspot.includes('lys') ||
    hotspot === 'nummerplade' ||
    hotspot === 'horn'
  ) {
    return { label: isUk ? 'Вогні' : 'Огни', icon: <Lightbulb className="h-5 w-5" /> };
  }
  if (
    hotspot === 'daek' ||
    hotspot === 'bremser' ||
    hotspot === 'haandbremse' ||
    hotspot === 'stoddaempere' ||
    hotspot === 'styretoej'
  ) {
    return { label: isUk ? 'Ходова' : 'Ходовая', icon: <Disc className="h-5 w-5" /> };
  }
  return { label: 'Капот', icon: <Wrench className="h-5 w-5" /> };
}

interface DictionaryVisualThumbnailProps {
  entry: DictionaryEntry;
  size?: 'sm' | 'lg';
}

export const DictionaryVisualThumbnail: React.FC<DictionaryVisualThumbnailProps> = ({
  entry,
  size = 'sm',
}) => {
  const { uiLang } = useUiLang();
  if (entry.signCode) {
    return (
      <div
        className={
          size === 'lg'
            ? 'mb-4 flex justify-center'
            : 'flex w-20 shrink-0 justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950'
        }
      >
        <DanishRoadSignSVG
          code={entry.signCode}
          subPlaque={entry.subPlaque}
          size={size === 'lg' ? 104 : 60}
        />
      </div>
    );
  }

  if (entry.id === 'term_p_skive') {
    return (
      <div
        className={
          size === 'lg'
            ? 'mb-4 flex justify-center'
            : 'flex w-20 shrink-0 justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950'
        }
      >
        <PSkiveSVG size={size === 'lg' ? 104 : 60} />
      </div>
    );
  }

  if (entry.category === 'kontrol' || entry.technicalHotspot) {
    const { label, icon } = getHotspotBadge(entry.technicalHotspot, uiLang);
    return (
      <div
        className={
          size === 'lg'
            ? 'mb-4 inline-flex items-center gap-2 rounded-2xl border border-teal-200/80 bg-teal-50/70 px-3.5 py-2 text-xs font-bold text-teal-800 dark:border-teal-800/70 dark:bg-teal-950/50 dark:text-teal-300'
            : 'flex h-[68px] w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-teal-200/80 bg-teal-50/70 p-2 text-center text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
        }
      >
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
    );
  }

  const presetId =
    TERM_SCENE_MAP[entry.id] ?? MODULE_DEFAULT_SCENE[entry.moduleId] ?? 'pov_spejl_skulder';

  return (
    <div className={size === 'lg' ? 'mb-4 w-full max-w-[260px]' : 'w-24 shrink-0 sm:w-28'}>
      <TrafficSceneSVG presetId={presetId} />
    </div>
  );
};
