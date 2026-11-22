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
    titleRu: 'Контрольная проверка (Kontrolprøven) перед практическим экзаменом',
    titleDa: 'Kontrolprøven før praktisk køreprøve',
    captionRu:
      'Капот открыт перед экзаменом по вождению: нужно уметь показать омывающую жидкость, охлаждающую жидкость и масляный щуп, а также проверить тормоза, шины и световые приборы.',
    captionDa:
      'Motorhjelmen er åben før køreprøven: du skal kunne udpege sprinklervæske, kølervæske og oliepind samt kontrollere bremser, dæk og lygter.',
  },
  2: {
    imageSrc: './images/lessons/module-2.jpg',
    titleRu: 'Обзор: салонное зеркало, боковое зеркало и взгляд через плечо',
    titleDa: 'Orientering: bakspejl, sidespejl og skulderkig',
    captionRu:
      'С водительского места велодорожка в боковом зеркале кажется пустой, но взгляд через правое плечо (skulderkig) раскрывает велосипедиста прямо в слепой зоне.',
    captionDa:
      'Set fra førersædet ser cykelstien tom ud i sidespejlet, men et skulderkig til højre afslører cyklisten lige i den blinde vinkel.',
  },
  3: {
    imageSrc: './images/lessons/module-3.jpg',
    titleRu: 'Указания: сигналы полиции, светофор и дорожная разметка',
    titleDa: 'Anvisninger: politiets tegn, lyssignal og afmærkning',
    captionRu:
      'Иерархия правил дорожного движения: сигналы полиции всегда стоят выше светофоров, дорожных знаков, разметки и общих правил.',
    captionDa:
      'Færdselsreglernes rækkefølge: politiets tegn står altid over lyssignaler, færdselstavler, afmærkning og almindelige regler.',
  },
  4: {
    imageSrc: './images/lessons/module-4.jpg',
    titleRu: 'Безусловная уступка по «акульим зубам» и знаку B11',
    titleDa: 'Ubetinget vigepligt ved hajtænder og tavle B11',
    captionRu:
      'Знак B11 и белые «акульи зубы» на проезжей части означают безусловную обязанность уступить как автомобилям, так и велосипедистам справа и слева.',
    captionDa:
      'Tavle B11 og hvide hajtænder på kørebanen betyder ubetinget vigepligt for både biler og cyklister fra højre og venstre.',
  },
  5: {
    imageSrc: './images/lessons/module-5.jpg',
    titleRu: 'Городская зона: пешеходный переход, велодорожка и автобус с остановки',
    titleDa: 'Byzone: fodgængerfelt, cykelsti og bus fra stoppested',
    captionRu:
      'В городской зоне (50 км/ч) нужно уступать пешеходам на переходе и уступать дорогу автобусу, который мигает при выезде с остановки.',
    captionDa:
      'I byzone (50 km/t) skal du holde tilbage for fodgængere ved fodgængerfeltet og give plads til bussen, der blinker ud fra stoppestedet.',
  },
  6: {
    imageSrc: './images/lessons/module-6.jpg',
    titleRu: 'Автомагистраль: полоса разгона, слияние и аварийная полоса',
    titleDa: 'Motorvej: tilkørselsbane, fletning og nødspor',
    captionRu:
      'На автомагистрали вы подстраиваете скорость на полосе разгона и вливаетесь в поток по принципу «молнии»; аварийную полосу можно использовать только в экстренных случаях.',
    captionDa:
      'På motorvej tilpasser du farten på tilkørselsbanen og fletter ind efter lynlåsprincippet; nødsporet må kun bruges i nødstilfælde.',
  },
  7: {
    imageSrc: './images/lessons/module-7.jpg',
    titleRu: 'Остановка и стоянка: знаки, правило 5 м и парковочный диск (P-skive)',
    titleDa: 'Standsning og parkering: tavler, 5 m-regel og P-skive',
    captionRu:
      'При городской парковке действует отступ 5 м до пешеходного перехода и 10 м от перекрёстка; при ограниченной по времени стоянке P-skive выставляется вперёд до ближайших 15 минут.',
    captionDa:
      'Ved byparkering gælder 5 m afstand før fodgængerfelt og 10 m fra vejkryds; ved tidsbegrænset parkering indstilles P-skiven til nærmeste kvarter frem.',
  },
  8: {
    imageSrc: './images/lessons/module-8.jpg',
    titleRu: 'Темнота, туман и аварийная ситуация на краю дороги',
    titleDa: 'Mørke, tåge og nødsituation ved vejkanten',
    captionRu:
      'Переключайтесь на ближний свет за 200–300 м до встречного транспорта; при поломке включается аварийка и заметно выставляется аварийный треугольник (мин. 50 м / 100 м на автомагистрали).',
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
