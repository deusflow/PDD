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
    promptRu: 'Покажите бачок тормозной жидкости и объясните, как проверяется её уровень.',
    options: [
      {
        ru: 'Уровень должен быть строго между отметками MIN и MAX без подтёков в бачке.',
        da: 'Væskestanden skal ligge mellem MIN og MAX i beholderen.',
      },
      {
        ru: 'Бачок должен быть залит до самого горлышка (выше MAX), иначе пропадёт давление.',
        da: 'Beholderen skal være fyldt helt op til låget over MAX.',
      },
      {
        ru: 'Тормозную жидкость проверяют щупом на заведённом двигателе.',
        da: 'Bremsevæske kontrolleres med målepind med motoren tændt.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Уровень тормозной жидкости проверяется визуально по стенке бачка (между MIN и MAX). Падение ниже MIN указывает на износ колодок или утечку — ехать опасно.',
    normDa:
      'Standen skal være mellem MIN og MAX. Er den under MIN, kan der være utæthed eller slidte bremsebelægninger.',
  },
  {
    id: 'k2_motorolie',
    tab: 'motorrum',
    hotspot: 'motorolie',
    promptDa: 'Hvordan kontrollerer du, at der er tilstrækkelig motorolie på bilen?',
    promptRu: 'Как вы проверяете, достаточно ли моторного масла в двигателе?',
    options: [
      {
        ru: 'Только на заведённом двигателе смотрю, чтобы из заливной горловины шел пар.',
        da: 'Med motoren i gang og åbent oliedæksel.',
      },
      {
        ru: 'На ровной площадке при выключенном моторе: вытащить щуп, протереть, вставить и убедиться, что след между MIN и MAX.',
        da: 'På vandret underlag med slukket motor: tør oliepinden af, sæt den i igen og tjek, at olien er mellem MIN og MAX.',
      },
      {
        ru: 'Масло проверяют только по синей лампе на приборной панели.',
        da: 'Kun via den blå kontrollampe i instrumentpanelet.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Авто стоит ровно, двигатель заглушен (остужен пару минут). Вынимаете щуп (oliepind), протираете тряпкой, вставляете до упора и снова достаёте — след должен быть между MIN и MAX.',
    normDa:
      'Bilen skal stå vandret med slukket motor. Olien skal ligge mellem mærkerne MIN og MAX på oliepinden.',
  },
  {
    id: 'k3_koelervaeske',
    tab: 'motorrum',
    hotspot: 'koelervaeske',
    promptDa: 'Hvor sidder kølervæsken, og hvad skal du passe på ved kontrol?',
    promptRu: 'Где находится охлаждающая жидкость и о чём важно помнить при её проверке?',
    options: [
      {
        ru: 'Открывать крышку сразу после поездки, чтобы стравить давление.',
        da: 'Åbn altid låget straks efter kørsel.',
      },
      {
        ru: 'Уровень между MIN и MAX смотрят снаружи; пробку открывают только на холодном двигателе (риск ожога паром).',
        da: 'Standen skal være mellem MIN og MAX; åbn aldrig beholderen på varm motor pga. skoldningsfare.',
      },
      {
        ru: 'Заливается обычная вода из-под крана без антифриза.',
        da: 'Der bruges kun almindeligt postevand.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Смотрим уровень через полупрозрачный бачок (между MIN и MAX). На горячем двигателе система под давлением — откручивать крышку запрещено, кипяток вырвется вверх.',
    normDa:
      'Kontrollér standen udvendigt mellem MIN og MAX. Varm kølervæske er under tryk og kan give alvorlige forbrændinger.',
  },
  {
    id: 'k4_bremser_vacuum',
    tab: 'daek_bremser',
    hotspot: 'bremser',
    promptDa: 'Hvordan kontrollerer du bremseforstærkeren (vakuumforstærkeren) og at bremserne er tætte?',
    promptRu: 'Как проверить вакуумный усилитель тормозов и герметичность тормозной системы?',
    options: [
      {
        ru: 'Заглушить мотор, нажать на тормоз 4–5 раз (педаль станет твёрдой), удерживая её запустить мотор — педаль должна слегка провалиться вниз.',
        da: 'Pump pedalen hård med slukket motor, hold trykket og start motoren – pedalen skal synke en smule.',
      },
      {
        ru: 'Разогнаться до 80 км/ч и дёрнуть ручной тормоз.',
        da: 'Kør 80 km/t og træk håndbremsen.',
      },
      {
        ru: 'Педаль при удержании в течение 30 секунд должна медленно уйти в самый пол.',
        da: 'Pedalen skal langsomt synke helt i bund under konstant tryk.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Два теста на Kontrolprøven: 1) При удерживании педали она НЕ должна опускаться (герметичность). 2) Если накачать её на заглушенном авто и завести мотор — она чуть уходит вниз (вакуумный усилитель работает).',
    normDa:
      'Ved konstant tryk må pedalen ikke synke (tæthed). Når motoren startes med foden på pedalen, skal den synke let (vakuumforstærkeren virker).',
  },
  {
    id: 'k5_daek_twi',
    tab: 'daek_bremser',
    hotspot: 'daek',
    promptDa: 'Hvad er lovkravet til dækmønster, og hvordan tjekker du dækkene inden kørsel?',
    promptRu: 'Какое законное требование к протектору шин и как вы их проверяете?',
    options: [
      {
        ru: 'Минимум 1,0 мм, если нет дождя.',
        da: 'Mindst 1,0 mm i tørt vejr.',
      },
      {
        ru: 'Минимум 1,6 мм по основным канавкам (по индикаторам TWI), одинаковый тип шин на всех 4 колёсах, правильное давление и отсутствие грыж/порезов.',
        da: 'Mindst 1,6 mm hovedmønster (TWI-indikatorer), samme dæktype på alle 4 hjul, korrekt dæktryk og ingen skader/revner.',
      },
      {
        ru: 'Главное, чтобы на передней оси были зимние шины, на задней — летние.',
        da: 'Vinterdæk foran og sommerdæk bagpå er påbudt.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Закон Дании требует минимум 1,6 мм по всему главному рисунку протектора (перемычки TWI). В зимних условиях (снег/лёд) летняя резина запрещена (штраф 1.000 kr за колесо): нужна маркировка минимум M+S, а лучше 3PMSF и ≥ 3 мм.',
    normDa:
      'Lovkravet er mindst 1,6 mm dækmønster (TWI). I vinterføre (sne/is) er sommerdæk forbudt (1.000 kr. bøde pr. dæk) — brug min. M+S / 3PMSF og helst ≥ 3 mm.',
  },
  {
    id: 'k6_stoddaempere',
    tab: 'daek_bremser',
    hotspot: 'stoddaempere',
    promptDa: 'Hvordan kontrollerer du til kontrolprøven, at bilens støddæmpere virker korrekt?',
    promptRu: 'Как на экзамене проверяют исправность амортизаторов (støddæmpere)?',
    options: [
      {
        ru: 'Сильно надавить на каждый угол авто и отпустить: кузов должен подняться и сразу остановиться без повторного раскачивания.',
        da: 'Tryk kraftigt ned over hvert hjul og slip: bilen skal falde hurtigt til ro uden at gynge efter.',
      },
      {
        ru: 'Машина должна мягко качнуться вверх-вниз 3–4 раза после отпускания.',
        da: 'Bilen skal gynge 3-4 gange op og ned bagefter.',
      },
      {
        ru: 'Амортизаторы проверяют только по уровню жидкости в багажнике.',
        da: 'Kontrolleres kun via en beholder i bagagerummet.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Нажимаем всем весом на крыло над каждым колесом и отпускаем: исправный амортизатор гасит колебание за 1 возврат (авто не прыгает как мячик), амортизатор также не должен быть в масляных подтёках.',
    normDa:
      'Tryk bilen ned ved hvert hjørne og slip – den skal falde straks til ro uden eftersving og uden olielækage.',
  },
  {
    id: 'k7_styretoej',
    tab: 'daek_bremser',
    hotspot: 'styretoej',
    promptDa: 'Hvad kontrollerer du ved styretøjet (rattet), når motoren er tændt?',
    promptRu: 'Что вы проверяете в рулевом управлении (styretøj)?',
    options: [
      {
        ru: 'Допускается свободный люфт руля до 5 см, пока колёса начнут поворачивать.',
        da: 'Op til 5 cm rat-slør er helt normalt.',
      },
      {
        ru: 'Свободного люфта (slør) быть не должно: колёса сразу реагируют на поворот руля, без стуков и заеданий.',
        da: 'Der må ikke være slør i rattet: hjulene skal straks følge ratbevægelsen uden mislyde.',
      },
      {
        ru: 'При повороте руля до упора должен загораться аварийный сигнал.',
        da: 'Havariblinket skal tænde ved fuldt ratudslag.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Встаньте у водительской двери, приоткройте окно, запустите двигатель (усилитель включён) и слегка покачайте руль влево-вправо: переднее колесо должно откликаться мгновенно, без люфта (ingen slør) и стуков.',
    normDa:
      'Med tændt motor drejes rattet let fra side til side – forhjulene skal følge med øjeblikkeligt uden døgang (slør).',
  },
  {
    id: 'k8_naerlys',
    tab: 'lygter',
    hotspot: 'naerlys',
    promptDa: 'Hvad er kravene til bilens nærlys (blændfrit lys)?',
    promptRu: 'Каковы законные требования к ближнему свету фар (nærlys)?',
    options: [
      {
        ru: 'Освещает дорогу минимум на 30 м вперёд, имеет асимметричный луч с наклоном вниз 1% (не слепит встречных).',
        da: 'Skal oplyse vejen mindst 30 meter frem med et fald på 1 % (1 cm pr. meter) uden at blænde.',
      },
      {
        ru: 'Освещает минимум на 100 м и горит только ночью.',
        da: 'Oplyser mindst 100 meter frem og må kun bruges om natten.',
      },
      {
        ru: 'Всегда включает синюю лампу на приборной панели.',
        da: 'Tænder altid en blå kontrollampe i instrumentpanelet.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Nærlys освещает дорогу не менее чем на 30 м, правый край светит чуть дальше для обочины, световой пучок снижается на 1% (1 см на 1 м), чтобы не слепить встречный транспорт.',
    normDa:
      'Nærlyset skal lyse mindst 30 m frem, have asymmetrisk lysbillede og et fald på ca. 1 % uden at blænde modkørende.',
  },
  {
    id: 'k9_fjernlys',
    tab: 'lygter',
    hotspot: 'fjernlys',
    promptDa: 'Hvad skal du vide og vise prøvesagkyndigen om bilens fjernlys ved kontrolprøven?',
    promptRu: 'Что обязательно нужно знать и показать инспектору о дальнем свете (fjernlys)?',
    options: [
      {
        ru: 'Дальний свет светит минимум на 100 м вперёд, а на приборной панели обязательно горит СИНЯЯ контрольная лампа.',
        da: 'Skal oplyse vejen mindst 100 meter frem, og en BLÅ kontrollampe skal lyse i instrumentbrættet.',
      },
      {
        ru: 'На приборной панели должна гореть зелёная лампа.',
        da: 'En grøn kontrollampe skal lyse på instrumentpanelet.',
      },
      {
        ru: 'Дальний свет проверяют только включением аварийки.',
        da: 'Kontrolleres sammen med katastrofeblink.',
      },
    ],
    correctIndex: 0,
    normRu:
      'Две обязательные цифры/факта для дальнего света: дистанция освещения минимум 100 м + обязательная СИНЯЯ лампа на приборной панели (blå kontrollampe).',
    normDa:
      'Fjernlyset skal oplyse mindst 100 m frem og have en synlig blå kontrollampe i instrumentbrættet.',
  },
  {
    id: 'k10_red_warning',
    tab: 'instrumentpanel',
    hotspot: 'olie_lampe',
    promptDa: 'Under kørslen begynder den røde olielampe (eller røde bremselampe) at lyse. Hvad gør du?',
    promptRu: 'Во время движения загорелась красная лампа давления масла или тормозной системы. Ваши действия?',
    options: [
      {
        ru: 'Ехать дальше до ближайшего автосервиса (до 50 км).',
        da: 'Kør videre til nærmeste værksted.',
      },
      {
        ru: 'Немедленно и безопасно остановиться и заглушить двигатель — красный символ означает критическую неисправность!',
        da: 'Stands bilen øjeblikkeligt på en sikker måde og sluk motoren – rød lampe betyder alvorlig fejl.',
      },
      {
        ru: 'Игнорировать, пока не загорится ещё и жёлтая лампа.',
        da: 'Vent til en gul lampe også tænder.',
      },
    ],
    correctIndex: 1,
    normRu:
      'Золотое правило приборной панели: КРАСНЫЙ знак = остановиться немедленно (давление масла / тормоза / перегрев)! ЖЁЛТЫЙ = можно осторожно доехать до сервиса (ABS, Check Engine).',
    normDa:
      'Rød kontrollampe = stands øjeblikkeligt (risiko for motorhavari eller bremsetab). Gul lampe = kør forsigtigt til værksted.',
  },
];

export const KontrolSimulatorModal: React.FC<KontrolSimulatorModalProps> = ({
  isOpen,
  languageMode,
  onClose,
}) => {
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

  const q = KONTROL_QUESTIONS[index];
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
                Опрос инспектора · Kontrolprøven
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                10 реальных устных вопросов перед выездом на практический экзамен
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!finished && (
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                Вопрос {index + 1} / {KONTROL_QUESTIONS.length} · Верно: {correctCount}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть тренажёр Kontrolprøven"
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
                Результат Kontrolprøven: {correctCount} из {KONTROL_QUESTIONS.length}
              </h3>
              <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                {correctCount >= 9
                  ? 'Отлично! Вы уверенно знаете устройство автомобиля, нормы света и критические ошибки — готовы к устной части экзамена.'
                  : 'Хорошая тренировка! На реальном экзамене инспектор задаёт 2–4 вопроса, и незнание базовых норм может стоить допуска к выезду.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                Пройти заново
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Закрыть
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
                    Инспектор спрашивает (Sagkyndig)
                  </div>
                  {languageMode !== 'da_only' && (
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {q.promptRu}
                    </p>
                  )}
                  <p
                    className={`${
                      languageMode === 'da_only'
                        ? 'text-sm font-bold text-zinc-900 dark:text-zinc-50'
                        : 'text-xs font-medium text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    «{q.promptDa}»
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {extractOrdnetLookupWords(q.promptDa, 3).map((word) => (
                      <a
                        key={word}
                        href={getOrdnetUrl(word)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-amber-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-amber-800 transition-colors hover:bg-amber-100/70 dark:border-amber-800/70 dark:bg-zinc-900/80 dark:text-amber-300 dark:hover:bg-amber-950/60"
                        title={`Открыть слово «${word}» в Den Danske Ordbog (ordnet.dk)`}
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
                  compact
                />
                {!isAnswered && (
                  <p className="mt-2 text-center text-[11px] text-zinc-400">
                    После ответа нужный узел подсветится на схеме автоматически
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
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${cardClass}`}
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
                            className={`${
                              languageMode === 'da_only'
                                ? 'text-xs font-semibold text-zinc-900 dark:text-zinc-100'
                                : 'text-[11px] text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {opt.da}
                          </div>
                        </div>
                      </button>
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
                    <div className="mb-1 font-bold">
                      {isCorrect ? 'Верный ответ · Норма закона:' : 'Запомните точную норму:'}
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
                ? 'Нажмите «Дальше» для следующего вопроса инспектора'
                : 'Выберите правильный вариант ответа'}
            </span>
            <button
              type="button"
              disabled={!isAnswered}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {index + 1 >= KONTROL_QUESTIONS.length ? 'Завершить опрос' : 'Дальше'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
