import React from 'react';
import { Camera } from 'lucide-react';
import { LanguageMode } from '../../types';
import { SpeakButton } from '../common/SpeakButton';
import { TheoryBilingual } from '../common/TheoryBilingual';

interface HeroSceneMeta {
  imageSrc: string;
  titleRu: string;
  titleDa: string;
  captionRu: string;
  captionDa: string;
}

const LESSON_HERO_META: Record<number, HeroSceneMeta> = {
  1: {
    imageSrc: './images/lessons/module-1.jpg',
    titleRu: 'Ситуация: проверка авто перед практическим экзаменом',
    titleDa: 'Kontrolprøven før praktisk køreprøve',
    captionRu:
      'На картинке открыт капот учебного автомобиля: перед выездом нужно уверенно показать бачок омывателя, антифриз, щуп масла, а также проверить тормоза, шины и все фары.',
    captionDa:
      'Motorhjelmen er åben før køreprøven: du skal kunne udpege sprinklervæske, kølervæske og oliepind samt kontrollere bremser, dæk og lygter.',
  },
  2: {
    imageSrc: './images/lessons/module-2.jpg',
    titleRu: 'Ситуация: зеркала и велосипедист в слепой зоне',
    titleDa: 'Orientering: bakspejl, sidespejl og skulderkig',
    captionRu:
      'Вид глазами водителя в городе: правое боковое зеркало показывает пустую велодорожку позади, но поворот головы через плечо (skulderkig) раскрывает велосипедиста прямо в слепой зоне!',
    captionDa:
      'Set fra førersædet ser cykelstien tom ud i sidespejlet, men et skulderkig til højre afslører cyklisten lige i den blinde vinkel.',
  },
  3: {
    imageSrc: './images/lessons/module-3.jpg',
    titleRu: 'Ситуация: регулировщик, светофор, стоп-линия и велодорожка',
    titleDa: 'Anvisninger: politiets tegn, lyssignal og afmærkning',
    captionRu:
      'Иерархия сигналов на дороге: жесты полицейского отменяют зелёный свет светофора, далее действуют знаки A–E и дорожная разметка (стоп-линия, сплошная, spærreflade и велодорожки).',
    captionDa:
      'Færdselsreglernes rækkefølge: politiets tegn står altid over lyssignaler, færdselstavler, afmærkning og almindelige regler.',
  },
  4: {
    imageSrc: './images/lessons/module-4.jpg',
    titleRu: 'Ситуация: знак B11 и «акульи зубы» перед главной дорогой',
    titleDa: 'Ubetinget vigepligt ved hajtænder og tavle B11',
    captionRu:
      'Вы подъезжаете к перекрёстку: перевёрнутый треугольник B11 и белые «акульи зубы» (hajtænder) на асфальте обязывают уступить всем машинам и велосипедистам слева и справа.',
    captionDa:
      'Tavle B11 og hvide hajtænder på kørebanen betyder ubetinget vigepligt for både biler og cyklister fra højre og venstre.',
  },
  5: {
    imageSrc: './images/lessons/module-5.jpg',
    titleRu: 'Ситуация: городская улица, зебра и отъезжающий автобус',
    titleDa: 'Byzone: fodgængerfelt, cykelsti og bus fra stoppested',
    captionRu:
      'В населённом пункте (50 км/ч) впереди пешеходный переход, где важно уступить пешеходам, а справа жёлтый автобус мигает левым поворотником при выезде с остановки — в городе ему уступают.',
    captionDa:
      'I byzone (50 km/t) skal du holde tilbage for fodgængere ved fodgængerfeltet og give plads til bussen, der blinker ud fra stoppestedet.',
  },
  6: {
    imageSrc: './images/lessons/module-6.jpg',
    titleRu: 'Ситуация: слияние с потоком и полоса Nødspor на автобане',
    titleDa: 'Motorvej: tilkørselsbane, fletning og nødspor',
    captionRu:
      'На автомагистрали автомобиль справа разгоняется на полосе разгона и встраивается в поток по правилу «молнии» (fletning), а правая полоса Nødspor остаётся свободной только для экстренной остановки.',
    captionDa:
      'På motorvej tilpasser du farten på tilkørselsbanen og fletter ind efter lynlåsprincippet; nødsporet må kun bruges i nødstilfælde.',
  },
  7: {
    imageSrc: './images/lessons/module-7.jpg',
    titleRu: 'Ситуация: городская парковка, знак запрета, P-skive и отступ 5 м',
    titleDa: 'Standsning og parkering: tavler, 5 m-regel og P-skive',
    captionRu:
      'Машины припаркованы по правому краю улицы, на стекле выставлен синий парковочный диск P-skive, рядом установлен знак запрета стоянки (C62 — кратковременная остановка ≤3 мин разрешена) и видна разметка зебры (отступ 5 м).',
    captionDa:
      'Ved byparkering gælder 5 m afstand før fodgængerfelt og 10 m fra vejkryds; ved tidsbegrænset parkering indstilles P-skiven til nærmeste kvarter frem.',
  },
  8: {
    imageSrc: './images/lessons/module-8.jpg',
    titleRu: 'Ситуация: сумерки, переключение фар и знак аварийной остановки',
    titleDa: 'Mørke, tåge og nødsituation ved vejkanten',
    captionRu:
      'Вечером на загородной дороге встречный автомобиль переключил свет на ближний, а остановившаяся на обочине машина включила аварийную сигнализацию и выставила позади красный предупреждающий треугольник.',
    captionDa:
      'Blænd ned til nærlys 200–300 m før modkørende; ved havari tændes havariblinket og advarselstrekanten stilles tydeligt op (min. 50 m / 100 m på motorvej).',
  },
};

interface LessonHeroIllustrationProps {
  moduleId: number;
  languageMode: LanguageMode;
  className?: string;
}

export const LessonHeroIllustration: React.FC<LessonHeroIllustrationProps> = ({
  moduleId,
  languageMode,
  className = '',
}) => {
  const meta = LESSON_HERO_META[moduleId] ?? LESSON_HERO_META[1];

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
        <img
          src={meta.imageSrc}
          alt={languageMode === 'da_only' ? meta.titleDa : meta.titleRu}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="border-t border-zinc-200/70 bg-zinc-50/80 p-3.5 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <Camera className="h-3.5 w-3.5" />
              <span>{languageMode === 'da_only' ? meta.titleDa : meta.titleRu}</span>
            </div>

            <TheoryBilingual
              ru={meta.captionRu}
              da={meta.captionDa}
              mode={languageMode}
              compact
              ruClassName="text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-200"
            />
          </div>

          <SpeakButton
            id={`hero_scene_${moduleId}`}
            text={`${meta.titleDa}. ${meta.captionDa}`}
          />
        </div>
      </div>
    </div>
  );
};
