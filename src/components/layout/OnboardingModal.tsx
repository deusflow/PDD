import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldAlert,
  Volume2,
  X,
} from 'lucide-react';

import { useUiLang } from '../../i18n/UiLangContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getSteps = (pick: <T>(ru: T, uk: T) => T) => [
  {
    badge: pick('Шаг 1 из 3 • Teoriprøven', 'Крок 1 з 3 • Teoriprøven'),
    title: pick('Правила реального экзамена в Дании', 'Правила реального іспиту в Данії'),
    subtitle: pick(
      'Почему нельзя угадывать и как работает оценка «Ja / Nej»',
      'Чому не можна вгадувати і як працює оцінювання «Ja / Nej»'
    ),
    icon: <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    points: [
      {
        title: pick('25 дорожных ситуаций за 25 минут', '25 дорожніх ситуацій за 25 хвилин'),
        desc: pick(
          'На официальном экзамене Færdselsstyrelsen вы решаете 25 билетов. В каждом 3–4 утверждения «Ja» (Да) или «Nej» (Нет).',
          'На офіційному іспиті Færdselsstyrelsen ви розв’язуєте 25 білетів. У кожному 3–4 твердження «Ja» (Так) або «Nej» (Ні).'
        ),
      },
      {
        title: pick('Жёсткое правило оценки', 'Жорстке правило оцінювання'),
        desc: pick(
          'Ошибка хотя бы в одном подпункте «Ja / Nej» обнуляет весь билет (0 баллов за ситуацию). Для сдачи нужно минимум 20 из 25 полностью верных билетов.',
          'Помилка хоча б в одному підпункті «Ja / Nej» обнулює весь білет (0 балів за ситуацію). Для складання потрібно мінімум 20 з 25 повністю правильних білетів.'
        ),
      },
      {
        title: pick('Плюс устный Kontrolprøven', 'Плюс усний Kontrolprøven'),
        desc: pick(
          'Перед выездом на практический экзамен инспектор проверит ваши знания устройства авто (шины 1,6 мм, вакуумный усилитель, фары и красные лампы панели).',
          'Перед виїздом на практичний іспит інспектор перевірить ваші знання будови авто (шини 1,6 мм, вакуумний підсилювач, фари та червоні лампи панелі).'
        ),
      },
    ],
  },
  {
    badge: pick('Шаг 2 из 3 • Алгоритм 100% запоминания', 'Крок 2 з 3 • Алгоритм 100% запам’ятовування'),
    title: pick('5 коробок Лейтнера (SRS)', '5 коробок Лейтнера (SRS)'),
    subtitle: pick(
      'Система сама следит за вашими слабыми местами до автоматизма',
      'Система сама стежить за вашими слабкими місцями до автоматизму'
    ),
    icon: <Layers className="h-6 w-6 text-sky-600 dark:text-sky-400" />,
    points: [
      {
        title: pick('От Box 0 (Не изучено) до Box 5 (Готов к экзамену)', 'Від Box 0 (Не вивчено) до Box 5 (Готово до іспиту)'),
        desc: pick(
          'Верный ответ без единой ошибки продвигает карточку вверх: Box 2 (4 ч) → Box 3 (1 день) → Box 4 (3 дня) → Box 5 (7 дней).',
          'Правильна відповідь без жодної помилки просуває картку вгору: Box 2 (4 год) → Box 3 (1 день) → Box 4 (3 дні) → Box 5 (7 днів).'
        ),
      },
      {
        title: pick('Мгновенный сброс при ошибке', 'Миттєве скидання при помилці'),
        desc: pick(
          'Если даже в выученном вопросе из Box 4 или Box 5 вы ошибётесь хотя бы в одном «Ja / Nej», билет сразу падает в Box 1 (Критическая зона).',
          'Якщо навіть у вивченому питанні з Box 4 або Box 5 ви помилитеся хоча б в одному «Ja / Nej», білет одразу падає в Box 1 (Критична зона).'
        ),
      },
      {
        title: pick('Одна кнопка «Умная тренировка»', 'Одна кнопка «Розумне тренування»'),
        desc: pick(
          'Просто жмите главную кнопку на обзоре — алгоритм сам соберёт сет из ваших ошибок, подошедших повторений и ещё не открытых тем.',
          'Просто тисніть головну кнопку на огляді — алгоритм сам збере сет із ваших помилок, повторень, що наспіли, та ще не відкритих тем.'
        ),
      },
    ],
  },
  {
    badge: pick('Шаг 3 из 3 • Dansk / Русский и Озвучка', 'Крок 3 з 3 • Dansk / Українська та Озвучка'),
    title: pick('Тренировка языка и слуха (da-DK)', 'Тренування мови та слуху (da-DK)'),
    subtitle: pick(
      'Плавный переход от понимания смысла к сдаче на чистом датском',
      'Плавний перехід від розуміння сенсу до складання чистою данською'
    ),
    icon: <Volume2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    points: [
      {
        title: pick('Режим 1: Dansk / Русский (Сразу оба)', 'Режим 1: Dansk / Українська (Одразу обидві)'),
        desc: pick(
          'Идеален на старте: видите естественную экзаменационную формулировку на датском и сразу точный русский перевод.',
          'Ідеальний на старті: бачите природне екзаменаційне формулювання данською та одразу точний український переклад.'
        ),
      },
      {
        title: pick('Режим 2: Spoiler Mode (Русский по клику)', 'Режим 2: Spoiler Mode (Українська за кліком)'),
        desc: pick(
          'Перевод скрыт за аккуратной плашкой — читаете на датском, проверяете себя и при сомнении открываете перевод в один клик.',
          'Переклад прихований за акуратною плашкою — читаєте данською, перевіряєте себе та за сумніву відкриваєте переклад в один клік.'
        ),
      },
      {
        title: pick('Режим 3: Kun Dansk + Кнопка озвучки', 'Режим 3: Kun Dansk + Кнопка озвучки'),
        desc: pick(
          'Чистый датский экзамен (перевод виден только в разборе после ответа). Нажимайте на иконку динамика возле любого текста для прослушивания da-DK.',
          'Чистий данський іспит (переклад видно лише в розборі після відповіді). Натискайте на іконку динаміка біля будь-якого тексту для прослуховування da-DK.'
        ),
      },
    ],
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { pick } = useUiLang();
  const steps = getSteps(pick);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStep(0);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleDone = () => {
    setStep(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleDone}
      role="dialog"
      aria-modal="true"
      aria-label={pick('Как работает тренажёр', 'Як працює тренажер')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl animate-slide-up dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Top progress strip */}
        <div className="flex gap-1.5 px-6 pt-5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx)}
              aria-label={pick(`Перейти к шагу ${idx + 1}`, `Перейти до кроку ${idx + 1}`)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx <= step ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleDone}
          aria-label={pick('Закрыть обучение', 'Закрити навчання')}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              {current.icon}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {current.badge}
              </div>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {current.title}
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{current.subtitle}</p>

          <div className="mt-5 space-y-3">
            {current.points.map((pt, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {pt.title}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {pick('Назад', 'Назад')}
            </button>

            <div className="flex items-center gap-2">
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {pick('Далее', 'Далі')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDone}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500"
                >
                  {pick('Начать подготовку', 'Почати підготовку')}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
