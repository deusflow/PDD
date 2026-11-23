import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { KONTROL_QUESTIONS_UK } from '../../data/uk/visualsUk';
import { useUiLang } from '../../i18n/UiLangContext';
import { LanguageMode, TechnicalTabId } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { SpeakButton } from '../common/SpeakButton';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';

interface KontrolSimulatorModalProps {
  isOpen: boolean;
  languageMode: LanguageMode;
  onClose: () => void;
}

interface KontrolQuestion {
  id: string;
  tab: TechnicalTabId;
  hotspot: string;
  promptDa: string;
  promptRu: string;
  options: {
    ru: string;
    da: string;
  }[];
  correctIndex: number;
  normRu: string;
  normDa: string;
}

const KONTROL_QUESTIONS: KontrolQuestion[] = [
  {
    id: 'k1_bremsevaeske',
    tab: 'motorrum',
    hotspot: 'bremsevaeske',
    promptDa: 'Vis mig beholderen til bremsevæske, og fortæl hvordan du kontrollerer standen.',
    promptRu: 'Покажите бачок тормозной жидкости и расскажите, как проверяется её уровень.',
    options: [
      {
        ru: 'Уровень жидкости должен быть между отметками MIN и MAX в бачке.',
        da: 'Væskestanden skal ligge mellem MIN og MAX i beholderen.',
      },
      {
        ru: 'Бачок должен быть заполнен до самой крышки выше отметки MAX.',
        da: 'Beholderen skal være fyldt helt op til låget over MAX.',
      },
      {
        ru: 'Тормозную жидкость проверяют измерительным щупом при заведённом двигателе.',
        da: 'Bremsevæske kontrolleres med målepind med motoren tændt.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Уровень должен быть между отметками MIN и MAX. Если он ниже MIN, возможна утечка или износ тормозных накладок.',
    normDa:
      'Standen skal være mellem MIN og MAX. Er den under MIN, kan der være utæthed eller slidte bremsebelægninger.',
  },
  {
    id: 'k2_motorolie',
    tab: 'motorrum',
    hotspot: 'motorolie',
    promptDa: 'Hvordan kontrollerer du, at der er tilstrækkelig motorolie på bilen?',
    promptRu: 'Как вы проверяете, достаточно ли моторного масла в автомобиле?',
    options: [
      {
        ru: 'При работающем двигателе и открытой масляной крышке.',
        da: 'Med motoren i gang og åbent oliedæksel.',
      },
      {
        ru: 'На горизонтальной поверхности при выключенном моторе: протереть щуп, вставить его снова и проверить, что масло между MIN и MAX.',
        da: 'På vandret underlag med slukket motor: tør oliepinden af, sæt den i igen og tjek, at olien er mellem MIN og MAX.',
      },
      {
        ru: 'Только по синей контрольной лампе на приборной панели.',
        da: 'Kun via den blå kontrollampe i instrumentpanelet.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Автомобиль должен стоять горизонтально с выключенным двигателем. Уровень масла должен находиться между отметками MIN и MAX на щупе.',
    normDa:
      'Bilen skal stå vandret med slukket motor. Olien skal ligge mellem mærkerne MIN og MAX på oliepinden.',
  },
  {
    id: 'k3_koelervaeske',
    tab: 'motorrum',
    hotspot: 'koelervaeske',
    promptDa: 'Hvor sidder kølervæsken, og hvad skal du passe på ved kontrol?',
    promptRu: 'Где находится охлаждающая жидкость и на что нужно обращать внимание при проверке?',
    options: [
      {
        ru: 'Всегда открывать крышку сразу после поездки.',
        da: 'Åbn altid låget straks efter kørsel.',
      },
      {
        ru: 'Уровень должен быть между MIN и MAX; никогда не открывайте бачок на горячем двигателе из-за опасности ожога.',
        da: 'Standen skal være mellem MIN og MAX; åbn aldrig beholderen på varm motor pga. skoldningsfare.',
      },
      {
        ru: 'Используется только обычная водопроводная вода.',
        da: 'Der bruges kun almindeligt postevand.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Проверяйте уровень снаружи между MIN и MAX. Горячая охлаждающая жидкость находится под давлением и может вызвать серьёзные ожоги.',
    normDa:
      'Kontrollér standen udvendigt mellem MIN og MAX. Varm kølervæske er under tryk og kan give alvorlige forbrændinger.',
  },
  {
    id: 'k4_bremser_vacuum',
    tab: 'daek_bremser',
    hotspot: 'bremser',
    promptDa: 'Hvordan kontrollerer du bremseforstærkeren (vakuumforstærkeren) og at bremserne er tætte?',
    promptRu: 'Как вы проверяете усилитель тормозов (вакуумный усилитель) и герметичность тормозов?',
    options: [
      {
        ru: 'Накачать педаль до жёсткости при выключенном моторе, удерживать нажатие и завести двигатель — педаль должна немного опуститься.',
        da: 'Pump pedalen hård med slukket motor, hold trykket og start motoren – pedalen skal synke en smule.',
      },
      {
        ru: 'Разогнаться до 80 км/ч и потянуть ручной тормоз.',
        da: 'Kør 80 km/t og træk håndbremsen.',
      },
      {
        ru: 'Педаль должна медленно уходить до самого пола при постоянном нажатии.',
        da: 'Pedalen skal langsomt synke helt i bund under konstant tryk.',
      },
    ],
    correctIndex: 0,
    normRu:
      'При постоянном нажатии педаль не должна опускаться (герметичность). Когда двигатель запускается с ногой на педали, она должна слегка опуститься (вакуумный усилитель работает).',
    normDa:
      'Ved konstant tryk må pedalen ikke synke (tæthed). Når motoren startes med foden på pedalen, skal den synke let (vakuumforstærkeren virker).',
  },
  {
    id: 'k5_daek_twi',
    tab: 'daek_bremser',
    hotspot: 'daek',
    promptDa: 'Hvad er lovkravet til dækmønster, og hvordan tjekker du dækkene inden kørsel?',
    promptRu: 'Какое законное требование к протектору шин и как вы проверяете шины перед поездкой?',
    options: [
      {
        ru: 'Минимум 1,0 мм в сухую погоду.',
        da: 'Mindst 1,0 mm i tørt vejr.',
      },
      {
        ru: 'Минимум 1,6 мм основного протектора (индикаторы TWI), одинаковый тип шин на всех 4 колёсах, правильное давление и отсутствие повреждений/трещин.',
        da: 'Mindst 1,6 mm hovedmønster (TWI-indikatorer), samme dæktype på alle 4 hjul, korrekt dæktryk og ingen skader/revner.',
      },
      {
        ru: 'Спереди обязательны зимние шины, а сзади — летние.',
        da: 'Vinterdæk foran og sommerdæk bagpå er påbudt.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Закон требует минимум 1,6 мм глубины протектора (TWI). В зимних условиях (снег/лёд) летние шины запрещены (штраф 1.000 kr за шину) — используйте минимум M+S / 3PMSF и желательно ≥ 3 мм.',
    normDa:
      'Lovkravet er mindst 1,6 mm dækmønster (TWI). I vinterføre (sne/is) er sommerdæk forbudt (1.000 kr. bøde pr. dæk) — brug min. M+S / 3PMSF og helst ≥ 3 mm.',
  },
  {
    id: 'k6_stoddaempere',
    tab: 'daek_bremser',
    hotspot: 'stoddaempere',
    promptDa: 'Hvordan kontrollerer du til kontrolprøven, at bilens støddæmpere virker korrekt?',
    promptRu: 'Как на контрольной проверке (kontrolprøve) проверить исправность амортизаторов автомобиля?',
    options: [
      {
        ru: 'Сильно надавить вниз над каждым колесом и отпустить: машина должна быстро успокоиться без последующей раскачки.',
        da: 'Tryk kraftigt ned over hvert hjul og slip: bilen skal falde hurtigt til ro uden at gynge efter.',
      },
      {
        ru: 'Машина должна раскачиваться вверх-вниз 3–4 раза после этого.',
        da: 'Bilen skal gynge 3-4 gange op og ned bagefter.',
      },
      {
        ru: 'Проверяются только через бачок в багажнике.',
        da: 'Kontrolleres kun via en beholder i bagagerummet.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Надавите на автомобиль вниз у каждого угла и отпустите — он должен сразу успокоиться без последующих колебаний и без утечек масла.',
    normDa:
      'Tryk bilen ned ved hvert hjørne og slip – den skal falde straks til ro uden eftersving og uden olielækage.',
  },
  {
    id: 'k7_styretoej',
    tab: 'daek_bremser',
    hotspot: 'styretoej',
    promptDa: 'Hvad kontrollerer du ved styretøjet (rattet), når motoren er tændt?',
    promptRu: 'Что вы проверяете в рулевом управлении (руле), когда двигатель заведён?',
    options: [
      {
        ru: 'До 5 см люфта руля — это совершенно нормально.',
        da: 'Op til 5 cm rat-slør er helt normalt.',
      },
      {
        ru: 'Люфта в руле быть не должно: колёса должны сразу следовать за поворотом руля без посторонних шумов.',
        da: 'Der må ikke være slør i rattet: hjulene skal straks følge ratbevægelsen uden mislyde.',
      },
      {
        ru: 'При полном вывороте руля должна включаться аварийная сигнализация.',
        da: 'Havariblinket skal tænde ved fuldt ratudslag.',
      },
    ],
    correctIndex: 1,
    normRu:
      'При заведённом двигателе руль слегка поворачивают из стороны в сторону — передние колёса должны следовать за ним мгновенно, без холостого хода (люфта).',
    normDa:
      'Med tændt motor drejes rattet let fra side til side – forhjulene skal følge med øjeblikkeligt uden døgang (slør).',
  },
  {
    id: 'k8_naerlys',
    tab: 'lygter',
    hotspot: 'naerlys',
    promptDa: 'Hvad er kravene til bilens nærlys (blændfrit lys)?',
    promptRu: 'Каковы требования к ближнему свету фар (ближнему неослепляющему свету)?',
    options: [
      {
        ru: 'Должен освещать дорогу минимум на 30 м вперёд с уклоном 1% (1 см на метр), не ослепляя.',
        da: 'Skal oplyse vejen mindst 30 meter frem med et fald på 1 % (1 cm pr. meter) uden at blænde.',
      },
      {
        ru: 'Освещает минимум на 100 м вперёд и может использоваться только ночью.',
        da: 'Oplyser mindst 100 meter frem og må kun bruges om natten.',
      },
      {
        ru: 'Всегда включает синюю контрольную лампу на приборной панели.',
        da: 'Tænder altid en blå kontrollampe i instrumentpanelet.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Ближний свет должен светить минимум на 30 м вперёд, иметь асимметричную картину света и уклон около 1%, не ослепляя встречный транспорт.',
    normDa:
      'Nærlyset skal lyse mindst 30 m frem, have asymmetrisk lysbillede og et fald på ca. 1 % uden at blænde modkørende.',
  },
  {
    id: 'k9_fjernlys',
    tab: 'lygter',
    hotspot: 'fjernlys',
    promptDa: 'Hvad skal du vide og vise prøvesagkyndigen om bilens fjernlys ved kontrolprøven?',
    promptRu: 'Что нужно знать и показать экзаменатору о дальнем свете автомобиля на контрольной проверке?',
    options: [
      {
        ru: 'Должен освещать дорогу минимум на 100 м вперёд, и на приборной панели должна гореть СИНЯЯ контрольная лампа.',
        da: 'Skal oplyse vejen mindst 100 meter frem, og en BLÅ kontrollampe skal lyse i instrumentbrættet.',
      },
      {
        ru: 'На приборной панели должна гореть зелёная контрольная лампа.',
        da: 'En grøn kontrollampe skal lyse på instrumentpanelet.',
      },
      {
        ru: 'Проверяется вместе с аварийной сигнализацией.',
        da: 'Kontrolleres sammen med katastrofeblink.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Дальний свет должен освещать минимум на 100 м вперёд и иметь видимую синюю контрольную лампу на приборной панели.',
    normDa:
      'Fjernlyset skal oplyse mindst 100 m frem og have en synlig blå kontrollampe i instrumentbrættet.',
  },
  {
    id: 'k10_red_warning',
    tab: 'instrumentpanel',
    hotspot: 'olie_lampe',
    promptDa: 'Under kørslen begynder den røde olielampe (eller røde bremselampe) at lyse. Hvad gør du?',
    promptRu: 'Во время движения загорается красная лампа масла (или красная тормозная лампа). Что вы делаете?',
    options: [
      {
        ru: 'Ехать дальше до ближайшего автосервиса.',
        da: 'Kør videre til nærmeste værksted.',
      },
      {
        ru: 'Немедленно безопасно остановить автомобиль и заглушить двигатель — красная лампа означает серьёзную неисправность.',
        da: 'Stands bilen øjeblikkeligt på en sikker måde og sluk motoren – rød lampe betyder alvorlig fejl.',
      },
      {
        ru: 'Подождать, пока не загорится ещё и жёлтая лампа.',
        da: 'Vent til en gul lampe også tænder.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Красная контрольная лампа = остановиться немедленно (риск поломки двигателя или потери тормозов). Жёлтая лампа = ехать осторожно в автосервис.',
    normDa:
      'Rød kontrollampe = stands øjeblikkeligt (risiko for motorhavari eller bremsetab). Gul lampe = kør forsigtigt til værksted.',
  },
];

export const KontrolSimulatorModal: React.FC<KontrolSimulatorModalProps> = ({
  isOpen,
  languageMode,
  onClose,
}) => {
  const { uiLang, pick } = useUiLang();
  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (finished) return;
      const currentQ = KONTROL_QUESTIONS[index];
      if (!currentQ) return;

      if (selectedIdx === null && ['1', '2', '3'].includes(e.key)) {
        const optIdx = Number(e.key) - 1;
        if (currentQ.options[optIdx]) {
          e.preventDefault();
          setSelectedIdx(optIdx);
          if (optIdx === currentQ.correctIndex) {
            setCorrectCount((prev) => prev + 1);
          }
        }
      } else if (e.key === 'Enter' && selectedIdx !== null) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON') return;
        e.preventDefault();
        if (index + 1 >= KONTROL_QUESTIONS.length) {
          setFinished(true);
        } else {
          setIndex((prev) => prev + 1);
          setSelectedIdx(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, finished, index, selectedIdx]);

  const handleRestart = () => {
    setIndex(0);
    setSelectedIdx(null);
    setCorrectCount(0);
    setFinished(false);
  };

  if (!isOpen) return null;

  const rawQ = KONTROL_QUESTIONS[index];
  const ukQ = uiLang === 'uk' ? KONTROL_QUESTIONS_UK[rawQ.id] : undefined;
  const q = ukQ
    ? {
        ...rawQ,
        promptRu: ukQ.promptUk,
        normRu: ukQ.normUk,
        options: rawQ.options.map((o, idx) => ({ ...o, ru: ukQ.optionsUk[idx] ?? o.ru })),
      }
    : rawQ;
  const isAnswered = selectedIdx !== null;
  const isCorrect = selectedIdx === q.correctIndex;

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedIdx(optIdx);
    if (optIdx === q.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 >= KONTROL_QUESTIONS.length) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
      setSelectedIdx(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kontrol-sim-title"
    >
      <div
        className="nordic-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="kontrol-sim-title"
                className="text-base font-bold text-zinc-900 dark:text-zinc-50"
              >
                {pick('Опрос инспектора · Kontrolprøven', 'Опитування інспектора · Kontrolprøven')}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {pick(
                  '10 реальных устных вопросов перед выездом на практический экзамен',
                  '10 реальних усних запитань перед виїздом на практичний іспит'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!finished && (
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {pick('Вопрос', 'Питання')} {index + 1} / {KONTROL_QUESTIONS.length} ·{' '}
                {pick('Верно', 'Вірно')}: {correctCount}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={pick('Закрыть тренажёр Kontrolprøven', 'Закрити тренажер Kontrolprøven')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {finished ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-5 px-6 py-10 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                correctCount >= 8
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {pick('Результат Kontrolprøven:', 'Результат Kontrolprøven:')} {correctCount}{' '}
                {pick('из', 'з')} {KONTROL_QUESTIONS.length}
              </h3>
              <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                {correctCount >= 9
                  ? pick(
                      'Отлично! Вы уверенно знаете устройство автомобиля, нормы света и критические ошибки — готовы к устной части экзамена.',
                      'Чудово! Ви впевнено знаєте будову автомобіля, норми світла та критичні помилки — готові до усної частини іспиту.'
                    )
                  : pick(
                      'Хорошая тренировка! На реальном экзамене инспектор задаёт 2–4 вопроса, и незнание базовых норм может стоить допуска к выезду.',
                      'Гарне тренування! На реальному іспиті інспектор ставить 2–4 запитання, і незнання базових норм може коштувати допуску до виїзду.'
                    )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                {pick('Пройти заново', 'Пройти знову')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {pick('Закрыть', 'Закрити')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((index + (isAnswered ? 1 : 0)) / KONTROL_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Inspector Prompt */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {pick('Инспектор спрашивает (Sagkyndig)', 'Інспектор запитує (Sagkyndig)')}
                  </div>
                  {languageMode !== 'da_only' && (
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {q.promptRu}
                    </p>
                  )}
                  <div
                    className={
                      languageMode === 'da_only'
                        ? 'text-sm font-bold text-zinc-900 dark:text-zinc-50'
                        : 'flex items-start gap-1.5 text-xs font-medium text-teal-950/90 dark:text-teal-200/90'
                    }
                  >
                    {languageMode !== 'da_only' && (
                      <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        DA
                      </span>
                    )}
                    <span>«{q.promptDa}»</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {extractOrdnetLookupWords(q.promptDa, 3).map((word) => (
                      <a
                        key={word}
                        href={getOrdnetUrl(word)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-amber-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-amber-800 transition-colors hover:bg-amber-100/70 dark:border-amber-800/70 dark:bg-zinc-900/80 dark:text-amber-300 dark:hover:bg-amber-950/60"
                        title={pick(
                          `Открыть слово «${word}» в Den Danske Ordbog (ordnet.dk)`,
                          `Відкрити слово «${word}» у Den Danske Ordbog (ordnet.dk)`
                        )}
                      >
                        <span>DDO: {word}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
                <SpeakButton id={`kontrol_speak_${q.id}`} text={q.promptDa} size="md" />
              </div>
            </div>

            {/* Visual Scheme + Options Grid */}
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <CarTechnicalSVG
                  key={q.id}
                  initialTab={q.tab}
                  activeHotspot={isAnswered ? q.hotspot : undefined}
                  languageMode={languageMode}
                  compact={!isAnswered}
                  lockedTab
                />
                {!isAnswered && (
                  <p className="mt-2 text-center text-[11px] text-zinc-400">
                    {pick(
                      'После ответа нужный узел подсветится на схеме автоматически',
                      'Після відповіді потрібний вузол підсвітиться на схемі автоматично'
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-3 lg:col-span-6">
                <div className="space-y-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isThisSelected = selectedIdx === optIdx;
                    const isThisCorrect = optIdx === q.correctIndex;

                    let cardClass =
                      'border-zinc-200/90 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600';
                    if (isAnswered) {
                      if (isThisCorrect) {
                        cardClass =
                          'border-teal-500 bg-teal-50/70 text-teal-950 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100';
                      } else if (isThisSelected) {
                        cardClass =
                          'border-rose-400 bg-rose-50/70 text-rose-950 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-100';
                      } else {
                        cardClass =
                          'border-zinc-200/60 bg-zinc-50/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40';
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex w-full items-start gap-2 rounded-xl border p-3 transition-all ${cardClass}`}
                      >
                        <button
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(optIdx)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-[11px] font-bold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                            {isAnswered && isThisCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            ) : isAnswered && isThisSelected ? (
                              <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            ) : (
                              optIdx + 1
                            )}
                          </span>
                          <div className="space-y-1">
                            {languageMode !== 'da_only' && (
                              <div className="text-xs font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                                {opt.ru}
                              </div>
                            )}
                            <div
                              className={
                                languageMode === 'da_only'
                                  ? 'text-xs font-semibold text-zinc-900 dark:text-zinc-100'
                                  : 'flex items-start gap-1.5 text-[11px] leading-snug text-teal-950/85 dark:text-teal-200/90'
                              }
                            >
                              {languageMode !== 'da_only' && (
                                <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1 py-0.5 text-[9px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                  DA
                                </span>
                              )}
                              <span>{opt.da}</span>
                            </div>
                          </div>
                        </button>
                        <SpeakButton id={`kontrol_opt_${q.id}_${optIdx}`} text={opt.da} />
                      </div>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div
                    className={`rounded-xl border p-3.5 text-xs leading-relaxed animate-slide-up ${
                      isCorrect
                        ? 'border-teal-200 bg-teal-50/70 text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200'
                        : 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 font-bold">
                      <span>
                        {isCorrect
                          ? pick('Верный ответ · Норма закона:', 'Правильна відповідь · Норма закону:')
                          : pick('Запомните точную норму:', 'Запам’ятайте точну норму:')}
                      </span>
                      <SpeakButton id={`kontrol_norm_${q.id}`} text={q.normDa} />
                    </div>
                    {languageMode !== 'da_only' && <p>{q.normRu}</p>}
                    <p className={languageMode !== 'da_only' ? 'mt-1 text-[11px] opacity-85' : ''}>
                      {q.normDa}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!finished && (
          <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/70 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAnswered
                ? pick(
                    'Нажмите «Дальше» для следующего вопроса инспектора',
                    'Натисніть «Далі» для наступного питання інспектора'
                  )
                : pick('Выберите правильный вариант ответа', 'Оберіть правильний варіант відповіді')}
            </span>
            <button
              type="button"
              disabled={!isAnswered}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {index + 1 >= KONTROL_QUESTIONS.length
                ? pick('Завершить опрос', 'Завершити опитування')
                : pick('Дальше', 'Далі')}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
