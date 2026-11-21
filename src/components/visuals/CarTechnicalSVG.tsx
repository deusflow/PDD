import React, { useEffect, useId, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { LanguageMode, TechnicalTabId } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';

interface CarTechnicalSVGProps {
  initialTab?: TechnicalTabId;
  activeHotspot?: string;
  languageMode?: LanguageMode;
  compact?: boolean;
  className?: string;
}

interface HotspotInfo {
  id: string;
  tab: TechnicalTabId;
  labelDa: string;
  labelRu: string;
  lookDa: string;
  lookRu: string;
  checkDa: string;
  checkRu: string;
}

const HOTSPOTS: HotspotInfo[] = [
  // 0. Kabine & Pedaler (Beginner zero-to-one)
  {
    id: 'pedaler',
    tab: 'kabine',
    labelDa: 'Pedaler: Kobling · Bremse · Speeder',
    labelRu: '3 педали: Сцепление · Тормоз · Газ',
    lookDa: 'Fra venstre mod højre på manuelt gear: K (Kobling) helt til venstre, B (Bremse) i midten, S (Speeder) til højre. På automatgear mangler K.',
    lookRu: 'Слева направо на «механике»: левая — сцепление (K, только для левой ноги), средняя — тормоз (B), правая — газ (S) для правой ноги. На «автомате» (P-R-N-D) левой педали нет!',
    checkDa: 'Venstre fod styrer KUN koblingen; højre fod skifter mellem bremse og gas. På automatgear hviler venstre fod altid på fodhvileren.',
    checkRu: 'Левая нога нажимает ТОЛЬКО сцепление (до упора). Правая нога работает поочерёдно с тормозом и газом. На автомате левая нога вообще не касается педалей!',
  },
  {
    id: 'motorhjelm',
    tab: 'kabine',
    labelDa: 'Motorhjelm (Åbning i 3 trin)',
    labelRu: 'Как открыть капот (3 простых шага)',
    lookDa: 'Indvendigt håndtag sidder nede ved venstre fod (ofte med et bilikon med åben hjelm). Ude foran sidder en lille sikkerhedslås midt under forkanten.',
    lookRu: '1) Рычажок/ручка в самом низу слева у левой ноги водителя (рисунок авто с открытым капотом). 2) Под приподнятой кромкой капота спереди по центру — вторая защёлка.',
    checkDa: '1) Træk i håndtaget ved venstre fod (klikkelyd) · 2) Skub sikkerhedslåsen til siden/op under midten af hjelmen · 3) Løft og sæt støttepinden i hak.',
    checkRu: 'Шаг 1: потяните рычаг у левой ноги (капот чуть щёлкнет). Шаг 2: подойдите спереди, просуньте руку по центру под кромку, сдвиньте предохранительный язычок вбок/вверх. Шаг 3: поднимите капот и уприте в штангу.',
  },
  {
    id: 'lyskontakt',
    tab: 'kabine',
    labelDa: 'Lyskontakt & Blinklysarm (Venstre)',
    labelRu: 'Свет и левый рычажок поворотников',
    lookDa: 'Venstre arm bag rattet styrer blinklys og fjernlys. Drejeknappen til lys sidder enten til venstre på instrumentbrættet eller som ring på venstre arm.',
    lookRu: 'Левый подрулевой рычаг = поворотники (вверх — направо, вниз — налево) и дальний свет (от себя — загорится синий значок). Круглый переключатель слева от руля — режимы света (0 / Auto / Габариты / Ближний).',
    checkDa: 'Blink op = højre, ned = venstre; skub armen frem = fjernlys (blå lampe!). Drej på lyskontakten til nærlys (grøn lampe) i regn, tunnel og skumring.',
    checkRu: 'В дождь, сумерки и туннель вручную поверните переключатель в крайнее положение «Ближний свет» (nærlys), чтобы гарантированно горели и задние фонари!',
  },
  {
    id: 'visker_havari',
    tab: 'kabine',
    labelDa: 'Vinduesvisker, Sprinkler & Havariblink',
    labelRu: 'Дворники (правый рычаг) и кнопка «Аварийка»',
    lookDa: 'Højre arm bag rattet har ikoner af en forrude med visker. Midt på instrumentbrættet sidder en stor rød knap med to trekanter indeni (havariblink).',
    lookRu: 'Правый рычажок за рулём — дворники и омыватель. В центре торпедо — заметная кнопка с красным треугольником (аварийная сигнализация — havariblink).',
    checkDa: 'Højre arm op/ned = viskerhastighed; træk armen ind mod dig selv = sprøjt sprinklervæske på forruden. Tryk på den røde trekant ved motorstop eller uheld.',
    checkRu: 'Правый рычаг вверх/вниз меняет скорость щёток; потянуть на себя — побрызгать омывателем на стекло. Красный треугольник включают при поломке, ДТП или резком хвосте пробки на трассе.',
  },
  {
    id: 'saede_spejle',
    tab: 'kabine',
    labelDa: 'Sæde, Nakkestøtte & 3 Spejle',
    labelRu: 'Посадка, подголовник и 3 зеркала перед стартом',
    lookDa: 'Håndtag under sædets forkant flytter det frem/tilbage; håndtag/hjul på siden justerer ryglæn og højde. Spejlknap sidder ofte på førerdøren (L / R).',
    lookRu: 'Скоба под сиденьем двигает кресло вперёд/назад; рычаг сбоку — наклон спинки. Джойстик регулировки боковых зеркал (L / R) — обычно на подлокотнике водительской двери.',
    checkDa: 'Træd kobling helt i bund (knæ stadig let bøjet), håndled når rattets top, nakkestøtte i højde med issen, og spejle indstillet med blot ~1–2 cm af egen bil.',
    checkRu: 'Выжмите сцепление до упора — колено должно оставаться чуть согнутым, а запястья доставать до верха руля; верх подголовника — вровень с макушкой головы.',
  },

  // 1. Motorrum (over real engine bay photo)
  {
    id: 'koelervaeske',
    tab: 'motorrum',
    labelDa: 'Kølervæske (Ekspansionsbeholder)',
    labelRu: 'Охлаждающая жидкость (антифриз)',
    lookDa: 'Gennemsigtig rund plastikbeholder med LYSRØD væske og blåt/sort tryklåg øverst til venstre under hjelmen.',
    lookRu: 'Прозрачный округлый бачок с РОЗОВОЙ (иногда зелёной/синей) жидкостью слева под капотом; на крышке нарисована книжка/термометр.',
    checkDa: 'Standen skal være mellem MIN og MAX på beholderens side. Åbn ALDRIG låget, mens motoren er varm — risiko for skoldning!',
    checkRu: 'Уровень смотрят снаружи между MIN и MAX. НИКОГДА не откручивайте крышку на горячем моторе — давление выбьет кипяток!',
  },
  {
    id: 'sprinklervaeske',
    tab: 'motorrum',
    labelDa: 'Sprinklervæske (Blåt låg)',
    labelRu: 'Бачок омывателя (синяя крышка)',
    lookDa: 'Lille BLÅT flip-låg helt fremme til venstre ved forlygten — ofte med et symbol af en forrude med vandstråle.',
    lookRu: 'Яркая СИНЯЯ крышечка спереди слева (у передней кромки), на ней нарисовано лобовое стекло с фонтанчиком воды.',
    checkDa: 'Skal indeholde væske (med frostsikring om vinteren), så forruden altid kan vaskes ren.',
    checkRu: 'Просто откройте крышку и убедитесь, что жидкость есть (зимой обязательно морозостойкая незамерзайка до −20 °C).',
  },
  {
    id: 'motorolie',
    tab: 'motorrum',
    labelDa: 'Motorolie & Oliepind',
    labelRu: 'Щуп и горловина моторного масла',
    lookDa: 'OLIEPIND: den lille GULE (eller orange) løkke foran på selve motoren. Lige ved siden af sidder det sorte oliedæksel med oliekande-symbol.',
    lookRu: 'Ищите яркое ЖЁЛТОЕ колечко (ручка щупа) прямо по центру двигателя. Рядом с ним чёрная пробка с символом маслёнки — это заливная горловина.',
    checkDa: 'Bilen skal stå plant med slukket motor. Træk pinden op, tør den af, sæt helt ned igen, træk op: oliestreg mellem MIN og MAX.',
    checkRu: 'Авто стоит ровно, мотор заглушен. Выньте жёлтый щуп, протрите тряпкой/салфеткой, вставьте обратно до упора, снова выньте и проверьте след между MIN и MAX.',
  },
  {
    id: 'bremsevaeske',
    tab: 'motorrum',
    labelDa: 'Bremsevæskebeholder',
    labelRu: 'Бачок тормозной жидкости',
    lookDa: 'Lille firkantet lys beholder bagerst under forruden (til højre mellem motoren og batteriet) med gult/sort bremse-symbol på låget.',
    lookRu: 'Небольшой светлый бачок глубже у лобового стекла справа (между двигателем и аккумулятором), крышка часто с чёрно-жёлтым значком `(!)`.',
    checkDa: 'Væskestanden skal stå mellem MIN og MAX (kontrolleres udefra). Hurtigt fald = utæt bremsesystem (kør ikke videre!).',
    checkRu: 'Уровень между MIN и MAX виден через полупрозрачную стенку (открывать крышку не нужно!). Резкое падение = утечка, ехать запрещено!',
  },
  {
    id: 'batteri',
    tab: 'motorrum',
    labelDa: '12V Batteri (Startbatteri)',
    labelRu: 'Аккумулятор 12V (АКБ)',
    lookDa: 'Sort firkantet kasse til højre under hjelmen med to tykke kabler (+ under rød kappe og − sort).',
    lookRu: 'Крупный чёрный прямоугольный блок справа; сверху подходят клеммы: красный плюсовой провод (+) и чёрный минус (−).',
    checkDa: 'Skal sidde helt fast spændt uden løse eller stærkt irrerede polsko på kablerne.',
    checkRu: 'Корпус должен быть надёжно закреплён и не болтаться, а клеммы — плотно затянуты без сильного налёта.',
  },

  // 2. Dæk, Bremser & Styretøj
  {
    id: 'daek',
    tab: 'daek_bremser',
    labelDa: 'Dækmønster (min. 1,6 mm & TWI)',
    labelRu: 'Протектор шин (мин. 1,6 мм и метки TWI)',
    lookDa: 'Kig ned i dækkets dybe langsgående riller efter de små forhøjede gummiklodser (TWI) — ofte markeret med "TWI" eller en lille trekant på dæksiden.',
    lookRu: 'Загляните внутрь глубоких канавок протектора: на дне есть маленькие резиновые «перемычки» высотой ровно 1,6 мм (на боковине напротив них стоит надпись TWI или треугольник).',
    checkDa: 'Mindst 1,6 mm i hovedrillerne hele vejen rundt (ikke slidt helt ned til TWI). Samme dæktype på alle 4 hjul; i sne/is mindst M+S / 3PMSF.',
    checkRu: 'Если поверхность шины стёрлась вровень с перемычкой TWI — шина лысая и вне закона (<1,6 мм)! Все 4 шины одного типа; зимой при снеге/льде нужна маркировка M+S / 3PMSF (и ≥ 3 мм).',
  },
  {
    id: 'bremser',
    tab: 'daek_bremser',
    labelDa: 'Driftsbremse & Vakuumforstærker',
    labelRu: 'Педаль тормоза и вакуумный усилитель',
    lookDa: 'Den midterste (på automatgear venstre) brede pedal ved dine fødder.',
    lookRu: 'Средняя широкая педаль под правой ногой (на автомате — широкая левая педаль).',
    checkDa: '1) Sluk motor → pump pedalen 3-4 gange (bliver hård) · 2) Hold tryk & start motoren → pedalen synker let · 3) Hold hårdt i 10 sek → må ikke synke mod bunden!',
    checkRu: '1) На заглушенном моторе накачайте педаль 3–4 раза (станет тугой). 2) Удерживая ногу на тормозе, заведите мотор → педаль мягко опустится вниз. 3) Удерживайте сильно 10 сек → проваливаться до пола НЕ должна.',
  },
  {
    id: 'haandbremse',
    tab: 'daek_bremser',
    labelDa: 'Parkeringsbremse (Håndbremse)',
    labelRu: 'Стояночный тормоз (ручник)',
    lookDa: 'Enten et klassisk håndtag mellem forsæderne eller en lille knap med "(P)" symbol i midterkonsollen.',
    lookRu: 'Классический рычаг между передними сиденьями (щелкает при поднятии) либо небольшая клавиша со значком `(P)` на центральной консоли.',
    checkDa: 'Skal kunne holde bilen sikkert på en bakke uafhængigt af det hydrauliske system.',
    checkRu: 'Затяните ручник и проверьте (или поставьте P) — машина обязана стоять неподвижно на уклоне без отката.',
  },
  {
    id: 'stoddaempere',
    tab: 'daek_bremser',
    labelDa: 'Støddæmpere (4 hjørner)',
    labelRu: 'Амортизаторы (проверка углов кузова)',
    lookDa: 'Kontrolleres udefra over hvert af bilens 4 hjul / hjørner (forskærm eller bagskærm).',
    lookRu: 'Проверяются снаружи машины: подойдите к каждому из 4 углов кузова над колесом (левое/правое крыло спереди и сзади).',
    checkDa: 'Tryk kraftigt ned over hvert hjørne og slip: bilen skal straks rejse sig 1 gang og falde til ro uden eftergyngen.',
    checkRu: 'Упритесь руками в крыло над колесом, резко качните вниз и отпустите: машина должна подняться 1 раз и сразу замереть, не прыгая как мячик.',
  },
  {
    id: 'styretoej',
    tab: 'daek_bremser',
    labelDa: 'Styretøj & Ratslør (0 cm)',
    labelRu: 'Рулевое управление и люфт (0 см)',
    lookDa: 'Rul førerdørens rude helt ned, så du kan se forhjulet udefra, mens du drejer let i rattet.',
    lookRu: 'Опустите водительское стекло, встаньте снаружи у двери и, держась одной рукой за верх руля, смотрите прямо на переднее левое колесо.',
    checkDa: 'Med startet motor (aktiv servostyring) skal forhjulet reagere øjeblikkeligt, når rattet drejes let fra side til side (0 cm ratslør).',
    checkRu: 'При ЗАВЕДЁННОМ двигателе слегка покачайте руль влево-вправо: колесо обязано поворачиваться мгновенно, без холостого хода (0 см люфта).',
  },

  // 3. Lygter
  {
    id: 'positionslys',
    tab: 'lygter',
    labelDa: 'Positionslys (2 hvide + 2 røde)',
    labelRu: 'Габаритные огни (видимость 300 м)',
    lookDa: 'Det svage lys foran og bagpå, når lyskontakten stilles på de to små modstående lygtepiktogrammer.',
    lookRu: 'Слабые контурные огни (2 белых спереди + 2 красных сзади), значок на переключателе — два маленьких фонарика «в разные стороны».',
    checkDa: 'Skal kunne ses tydeligt på mindst 300 m i klart mørke uden at blænde. Bruges bl.a. ved parkering på uoplyst landevej.',
    checkRu: 'Должны быть видны в темноте минимум с 300 м. Сами дорогу НЕ освещают, зато включаются при стоянке ночью на неосвещённой трассе.',
  },
  {
    id: 'naerlys',
    tab: 'lygter',
    labelDa: 'Nærlys (min. 30 m & 1% fald)',
    labelRu: 'Ближний свет (мин. 30 м, уклон 1%)',
    lookDa: 'Ikon på lyskontakten med nedadvendte lysstråler (ofte grøn lampe på instrumentpanelet). Lyskeglen peger skråt nedad og længere ud mod højre rabat.',
    lookRu: 'Значок фары с лучами, направленными вниз. Луч асимметричный — правая обочина освещена дальше левой встречной полосы.',
    checkDa: 'Skal oplyse vejen mindst 30 m frem med et fald på 1 % (1 cm pr. meter) uden at blænde modkørende.',
    checkRu: 'Освещает минимум 30 м дороги вперёд, наклон вниз 1% (1 см на каждый метр расстояния), чтобы не слепить встречных водителей.',
  },
  {
    id: 'fjernlys',
    tab: 'lygter',
    labelDa: 'Fjernlys (min. 100 m & Blå lampe)',
    labelRu: 'Дальний свет (мин. 100 м, синяя лампа)',
    lookDa: 'Skub venstre blinklysarm væk fra dig — på instrumentpanelet tænder altid en markant BLÅ kontrollampe med lige stråler.',
    lookRu: 'Включается толчком левого рычага «от себя» (при включённом ближнем свете); на панели загорается яркая СИНЯЯ лампа с прямыми лучами.',
    checkDa: 'Lyser mindst 100 meter frem og tænder blå kontrollampe. Blænd ned til nærlys ca. 200–300 m før modkørende og 100–150 m bag forankørende!',
    checkRu: 'Светит минимум на 100 м вперёд; обязательна СИНЯЯ лампа. Переключайте обратно на ближний за 200–300 м до встречной машины и за 100–150 м сзади попутной.',
  },
  {
    id: 'stoplys',
    tab: 'lygter',
    labelDa: 'Stoplys (3 røde lygter)',
    labelRu: 'Стоп-сигналы (3 красных фонаря)',
    lookDa: '2 kraftige røde lygter i baglygterne + 1 højt i midten ved bagruden. På Kontrolprøven ber du prøvesagkyndigen se bagud (eller spejler i en rude), mens du træder på bremsen.',
    lookRu: 'Три красных фонаря сзади (левый, правый и верхний по центру). Удобно проверять, попросив инспектора посмотреть сзади или в отражении витрины/стены.',
    checkDa: 'Alle 3 stoplygter skal lyse straks ved tryk på bremsen og være væsentligt kraftigere end almindelige røde baglygter.',
    checkRu: 'Все 3 стоп-сигнала должны загораться одновременно при нажатии тормоза и светить заметно ярче обычных задних габаритов.',
  },
  {
    id: 'blinklys',
    tab: 'lygter',
    labelDa: 'Blinklys & Havariblink (60–120/min)',
    labelRu: 'Поворотники и аварийка (6 фонарей)',
    lookDa: '6 gule/orange lygter: 2 foran, 2 på forskærme/spejle, 2 bagpå. Alle 6 blinker samtidig ved tryk på den røde havariknap.',
    lookRu: '6 жёлтых фонарей (по 3 на каждом борту: перед, бок/зеркало, зад). Проще всего проверить все 6 разом, нажав красную кнопку аварийки и обойдя машину.',
    checkDa: 'Skal blinke ensartet 60–120 gange i minuttet. Blinker lampen inde i bilen dobbelt så hurtigt = én udvendig pære er sprunget!',
    checkRu: 'Частота 60–120 миганий в минуту. Если стрелка в салоне защёлкала вдвое быстрее — перегорела одна из ламп снаружи!',
  },
  {
    id: 'nummerplade',
    tab: 'lygter',
    labelDa: 'Nummerpladelys (20 m) & Reflekser',
    labelRu: 'Подсветка номера (20 м) и катафоты',
    lookDa: 'Små hvide lamper lige over den bagerste nummerplade + to RØDE ikke-trekantede reflekser integreret i bagkofanger/baglygter.',
    lookRu: 'Белые лампочки прямо над задним номерным знаком + два красных светоотражателя (катафота) в задних фонарях/бампере.',
    checkDa: 'Hvidt nummerpladelys skal gøre pladen læsbar på min. 20 m i mørke. Personbilens 2 bagreflekser må ALDRIG være trekantede (trekanter er kun til trailere!).',
    checkRu: 'Белая подсветка должна делать номер читаемым минимум с 20 м. Катафоты легковушки НЕ могут быть треугольными (треугольные — только для прицепов!).',
  },
  {
    id: 'horn',
    tab: 'lygter',
    labelDa: 'Horn (Kun ved fare)',
    labelRu: 'Звуковой сигнал / клаксон',
    lookDa: 'Midterpuden i selve rattet (ikon af et lille horn/trompet).',
    lookRu: 'Нажим на центральную подушку руля (значок гудка). На Kontrolprøven инспектор может попросить коротко нажать для проверки звука.',
    checkDa: 'Klar ensartet tone — må efter færdselsloven KUN bruges for at afværge overhængende fare (aldrig for at hilse eller skynde på nogen!).',
    checkRu: 'Должен давать чёткий ровный звук; в Дании использовать в городе/на трассе можно ТОЛЬКО для предотвращения немедленной опасности!',
  },

  // 4. Instrumentpanel
  {
    id: 'olie_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød oliekande — Olietryk',
    labelRu: 'Красная маслёнка — нет давления масла',
    lookDa: 'Rødt ikon formet som en gammeldags oliekande med en dråbe på spidsen.',
    lookRu: 'Красный значок в виде старинной лейки/маслёнки с капелькой масла.',
    checkDa: 'STANDS STRAKS på et sikkert sted og sluk motoren! Manglende olietryk kan ødelægge motoren på få sekunder.',
    checkRu: 'КРИТИЧЕСКАЯ ОШИБКА: немедленно безопасно остановитесь и заглушите двигатель! Ехать даже 5 км до АЗС нельзя — мотор заклинит.',
  },
  {
    id: 'bremse_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød (!) — Bremsefejl / Håndbremse',
    labelRu: 'Красный (!) — ручник или ошибка тормозов',
    lookDa: 'Rød cirkel med udråbstegn `(!)` — lyser normalt, når håndbremsen er trukket op.',
    lookRu: 'Красный круг с восклицательным знаком `(!)`. Нормально горит на стоянке, пока поднят ручник.',
    checkDa: 'Hvis den lyser under kørsel med håndbremsen helt nede: for lidt bremsevæske eller bremsefejl — stands straks!',
    checkRu: 'Если вы полностью опустили ручник и поехали, а красная `(!)` продолжает гореть — уровень тормозной жидкости упал или утечка. Остановитесь немедленно!',
  },
  {
    id: 'temp_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød Temperatur / Batteri',
    labelRu: 'Красный термометр (перегрев) / АКБ',
    lookDa: 'Rødt termometer over bølger (motortemperatur) eller rødt batteri med + og −.',
    lookRu: 'Красный значок градусника в волнах (кипит мотор) или красный значок аккумулятора (нет зарядки от генератора).',
    checkDa: 'Rød lampe = stands sikkert hurtigst muligt og sluk motoren. (Åbn IKKE varm kølervæske-låg!).',
    checkRu: 'Красная лампа = остановиться как можно скорее и заглушить мотор! При красном термометре НЕ открывайте крышку антифриза на горячем моторе.',
  },
  {
    id: 'abs_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Gul ABS / ESP / Motorlampe',
    labelRu: 'Жёлтая лампа (ABS / ESP / Check Engine)',
    lookDa: 'Gult/orange symbol: bogstaver "ABS", slingrende bil (ESP) eller en lille motorblok (Check Engine).',
    lookRu: 'Жёлтый или оранжевый значок (кружок «ABS», машинка на змейке ESP или контур двигателя).',
    checkDa: 'Gul advarsel = systemet (fx blokeringssikring ABS) kan være ude af drift, men almindelige bremser virker stadig — kør forsigtigt til værksted.',
    checkRu: 'Жёлтый индикатор допускает осторожное движение до СТО своим ходом. Но помните: при горящем жёлтом ABS антиблокировка отключена — на резком торможении колёса могут пойти юзом.',
  },
];

const ENGINE_BAY_PINS: Array<{
  id: string;
  num: string;
  left: string;
  top: string;
  color: string;
}> = [
  { id: 'koelervaeske', num: '1', left: '22.5%', top: '50%', color: '#E11D48' },
  { id: 'sprinklervaeske', num: '2', left: '29%', top: '80%', color: '#0284C7' },
  { id: 'motorolie', num: '3', left: '39.5%', top: '52%', color: '#10B981' },
  { id: 'bremsevaeske', num: '4', left: '63%', top: '37%', color: '#F59E0B' },
  { id: 'batteri', num: '5', left: '72%', top: '47%', color: '#475569' },
];

const TABS: Array<{ id: TechnicalTabId; da: string; ru: string }> = [
  { id: 'kabine', da: '0. Kabine & Pedaler', ru: 'Салон и педали' },
  { id: 'motorrum', da: '1. Motorrum', ru: 'Под капотом' },
  { id: 'daek_bremser', da: '2. Dæk & Bremser', ru: 'Шины и тормоза' },
  { id: 'lygter', da: '3. Lygter & Horn', ru: 'Фары и сигналы' },
  { id: 'instrumentpanel', da: '4. Instrumentpanel', ru: 'Приборная панель' },
];

export const CarTechnicalSVG: React.FC<CarTechnicalSVGProps> = ({
  initialTab = 'motorrum',
  activeHotspot,
  languageMode = 'both',
  compact = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const [tab, setTab] = useState<TechnicalTabId>(initialTab);
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (activeHotspot) return activeHotspot;
    return HOTSPOTS.find((h) => h.tab === initialTab)?.id ?? 'bremsevaeske';
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeHotspot) {
      setSelectedId(activeHotspot);
      const found = HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) setTab(found.tab);
    }
  }, [activeHotspot]);

  const tabHotspots = HOTSPOTS.filter((h) => h.tab === tab);
  const currentInfo =
    HOTSPOTS.find((h) => h.id === selectedId && h.tab === tab) ?? tabHotspots[0];

  const handleSelectTab = (nextTab: TechnicalTabId) => {
    setTab(nextTab);
    const first = HOTSPOTS.find((h) => h.tab === nextTab);
    if (first) setSelectedId(first.id);
  };

  const hotspotCircle = (id: string, cx: number, cy: number, label: string, color = '#0284C7') => {
    const active = currentInfo?.id === id;
    return (
      <g
        key={id}
        onClick={() => setSelectedId(id)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
      >
        {active && (
          <circle cx={cx} cy={cy} r="22" fill={color} opacity="0.24" className="animate-pulse-soft" />
        )}
        <circle
          cx={cx}
          cy={cy}
          r="14"
          fill={active ? color : '#18181B'}
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        <text x={cx} y={cy + 3.5} textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="800">
          {label}
        </text>
      </g>
    );
  };

  const renderDiagram = () => {
    switch (tab) {
      case 'kabine':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            {/* Windshield frame & dashboard shelf */}
            <path d="M 18 14 Q 220 4 422 14 L 422 132 Q 220 120 18 132 Z" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
            <rect x="34" y="132" width="372" height="80" rx="10" fill="#111827" stroke="#27272A" strokeWidth="1.4" />

            {/* Light dial left of steering wheel */}
            <circle cx="52" cy="84" r="16" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
            <text x="52" y="64" textAnchor="middle" fill="#FACC15" fontSize="7.5" fontWeight="800">
              LYS (0 / Auto / Nær)
            </text>

            {/* Left & Right Stalks behind steering wheel */}
            <rect x="76" y="76" width="46" height="8" rx="4" fill="#475569" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="180" y="76" width="46" height="8" rx="4" fill="#475569" stroke="#CBD5E1" strokeWidth="1" />

            {/* Steering wheel */}
            <circle cx="151" cy="84" r="40" fill="none" stroke="#334155" strokeWidth="10" />
            <circle cx="151" cy="84" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <text x="151" y="34" textAnchor="middle" fill="#CBD5E1" fontSize="8" fontWeight="800">
              RAT &amp; SPEJLE
            </text>

            {/* Center Console + Red Hazard Triangle Button */}
            <rect x="260" y="40" width="94" height="80" rx="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <rect x="292" y="54" width="30" height="24" rx="5" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
            <polygon points="307,59 316,74 298,74" fill="none" stroke="#FCA5A5" strokeWidth="2" />
            <text x="307" y="92" textAnchor="middle" fill="#FCA5A5" fontSize="7.5" fontWeight="800">
              HAVARIBLINK
            </text>

            {/* Hood Release Lever near bottom-left footwell */}
            <rect x="24" y="160" width="76" height="36" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M 38 178 L 58 178 L 54 170" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="190" textAnchor="middle" fill="#FDE68A" fontSize="7" fontWeight="800">
              MOTORHJELM
            </text>

            {/* 3 Foot Pedals Left -> Right: K (Kobling), B (Bremse), S (Speeder) */}
            <g transform="translate(124, 146)">
              <rect x="0" y="0" width="160" height="58" rx="10" fill="#09090B" stroke="#334155" strokeWidth="1.5" />
              {/* Left pedal K */}
              <rect x="14" y="10" width="32" height="32" rx="6" fill="#0284C7" opacity="0.8" stroke="#BAE6FD" strokeWidth="1.5" />
              <text x="30" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">K</text>
              <text x="30" y="52" textAnchor="middle" fill="#7DD3FC" fontSize="6.5" fontWeight="700">Kobling</text>
              {/* Middle pedal B */}
              <rect x="64" y="10" width="34" height="32" rx="6" fill="#DC2626" opacity="0.85" stroke="#FECACA" strokeWidth="1.5" />
              <text x="81" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">B</text>
              <text x="81" y="52" textAnchor="middle" fill="#FCA5A5" fontSize="6.5" fontWeight="700">Bremse</text>
              {/* Right pedal S */}
              <rect x="116" y="6" width="28" height="38" rx="6" fill="#10B981" opacity="0.8" stroke="#A7F3D0" strokeWidth="1.5" />
              <text x="130" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">S</text>
              <text x="130" y="52" textAnchor="middle" fill="#6EE7B7" fontSize="6.5" fontWeight="700">Speeder</text>
            </g>

            {/* Gear stick / Auto reminder box on bottom right */}
            <g transform="translate(300, 146)">
              <rect x="0" y="0" width="102" height="58" rx="10" fill="#09090B" stroke="#334155" strokeWidth="1.5" />
              <text x="51" y="22" textAnchor="middle" fill="#E2E8F0" fontSize="8" fontWeight="800">
                GEARSTANG
              </text>
              <text x="51" y="36" textAnchor="middle" fill="#94A3B8" fontSize="7" fontWeight="700">
                Man: K+B+S · Auto: P-R-N-D
              </text>
              <text x="51" y="49" textAnchor="middle" fill="#FDE047" fontSize="6.8" fontWeight="700">
                Venstre fod kun K!
              </text>
            </g>

            {hotspotCircle('lyskontakt', 88, 80, 'LYS', '#F59E0B')}
            {hotspotCircle('saede_spejle', 151, 84, 'SÆDE', '#14B8A6')}
            {hotspotCircle('visker_havari', 240, 74, 'VISK', '#0284C7')}
            {hotspotCircle('motorhjelm', 62, 174, 'ÅBN', '#D97706')}
            {hotspotCircle('pedaler', 205, 174, 'K B S', '#10B981')}
          </g>
        );

      case 'daek_bremser':
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}_carBody`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            <line x1="16" y1="190" x2="424" y2="190" stroke="#3F3F46" strokeWidth="2.5" />
            <path
              d="M 46 148 Q 48 116 74 102 L 138 66 Q 198 54 276 58 L 352 94 L 392 104 Q 404 114 404 148 L 372 152 A 36 36 0 0 0 296 152 L 160 152 A 36 36 0 0 0 84 152 Z"
              fill={`url(#${uid}_carBody)`}
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
            <path d="M 142 74 L 222 68 L 222 100 L 116 100 Z" fill="#0F172A" opacity="0.85" />
            <path d="M 230 68 L 274 68 L 330 96 L 230 100 Z" fill="#0F172A" opacity="0.85" />
            <line x1="148" y1="98" x2="122" y2="148" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="4 2" />
            <path d="M 206 128 L 122 154 M 266 132 L 334 154" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M 352 98 L 344 112 L 358 118 L 344 124 L 358 130 L 348 142" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />

            {[122, 334].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="154" r="35" fill="#18181B" stroke="#71717A" strokeWidth="4" />
                <circle cx={cx} cy="154" r="24" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx={cx} cy="154" r="15" fill="#CBD5E1" opacity="0.7" />
                <path d={`M ${cx + 8} 142 A 14 14 0 0 1 ${cx + 12} 162`} fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx={cx} cy="154" r="5" fill="#0F172A" />
              </g>
            ))}

            {/* Zoomed TWI Tread Callout */}
            <g transform="translate(14, 14)">
              <rect x="0" y="0" width="132" height="48" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <rect x="10" y="10" width="28" height="28" rx="4" fill="#27272A" />
              <rect x="16" y="10" width="4" height="22" fill="#09090B" />
              <rect x="26" y="10" width="4" height="22" fill="#09090B" />
              <rect x="16" y="25" width="4" height="4" fill="#34D399" />
              <text x="46" y="23" fill="#34D399" fontSize="9.5" fontWeight="800">
                Min. 1,6 mm
              </text>
              <text x="46" y="36" fill="#CBD5E1" fontSize="8">
                TWI · 4 ens dæk
              </text>
            </g>

            {hotspotCircle('daek', 122, 154, 'DÆK', '#10B981')}
            {hotspotCircle('styretoej', 152, 96, 'RAT', '#38BDF8')}
            {hotspotCircle('bremser', 206, 128, 'PEDAL', '#EF4444')}
            {hotspotCircle('haandbremse', 266, 128, 'HÅND', '#F59E0B')}
            {hotspotCircle('stoddaempere', 354, 102, 'STØD', '#8B5CF6')}
          </g>
        );

      case 'lygter':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            <polygon points="122,74 16,32 16,104" fill="#FEF08A" opacity="0.22" />
            <polygon points="122,146 16,116 16,188" fill="#FEF08A" opacity="0.22" />
            <polygon points="122,74 42,60 42,88" fill="#FEF9C3" opacity="0.34" />
            <polygon points="122,146 42,132 42,160" fill="#FEF9C3" opacity="0.34" />
            <polygon points="322,110 385,92 385,128" fill="#FFFFFF" opacity="0.22" />
            <path
              d="M 122 72 Q 124 54 148 54 L 300 54 Q 322 54 322 74 L 322 146 Q 322 166 300 166 L 148 166 Q 124 166 122 148 Z"
              fill="#334155"
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
            <rect x="164" y="66" width="114" height="88" rx="14" fill="#0F172A" />
            <rect x="192" y="72" width="66" height="76" rx="8" fill="#475569" opacity="0.65" />
            <rect x="172" y="47" width="14" height="7" rx="3" fill="#475569" />
            <rect x="172" y="166" width="14" height="7" rx="3" fill="#475569" />
            <rect x="316" y="64" width="6" height="18" rx="2" fill="#EF4444" />
            <rect x="316" y="138" width="6" height="18" rx="2" fill="#EF4444" />
            <path d="M 146 102 A 10 10 0 0 0 146 118 M 138 96 A 16 16 0 0 0 138 124" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />

            <text x="16" y="24" fill="#FEF08A" fontSize="10" fontWeight="700">
              FORAN (Hvid / Gul)
            </text>
            <text x="424" y="24" textAnchor="end" fill="#FCA5A5" fontSize="10" fontWeight="700">
              BAGPÅ (Rød + Hvid nr.plade)
            </text>
            {hotspotCircle('positionslys', 132, 68, 'POS', '#94A3B8')}
            {hotspotCircle('naerlys', 96, 110, '30m', '#FACC15')}
            {hotspotCircle('fjernlys', 46, 110, '100m', '#3B82F6')}
            {hotspotCircle('horn', 180, 110, 'HORN', '#10B981')}
            {hotspotCircle('blinklys', 224, 54, '60-120', '#F59E0B')}
            {hotspotCircle('stoplys', 316, 78, 'STOP', '#EF4444')}
            {hotspotCircle('nummerplade', 348, 128, '20m', '#EC4899')}
          </g>
        );

      case 'instrumentpanel':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            <path d="M 18 198 L 36 42 Q 220 8 404 42 L 422 198 Z" fill="#18181B" stroke="#3F3F46" strokeWidth="2.5" />
            <circle cx="106" cy="116" r="56" fill="#09090B" stroke="#475569" strokeWidth="3" />
            <path d="M 64 142 A 50 50 0 1 1 148 142" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 6" opacity="0.6" />
            <line x1="106" y1="116" x2="82" y2="82" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="106" cy="116" r="6" fill="#CBD5E1" />
            <text x="106" y="142" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              50 · 80 · 130
            </text>
            <text x="106" y="156" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="700">
              km/t
            </text>

            <circle cx="334" cy="116" r="56" fill="#09090B" stroke="#475569" strokeWidth="3" />
            <path d="M 294 140 A 48 48 0 0 1 322 72" fill="none" stroke="#22C55E" strokeWidth="5" opacity="0.7" />
            <line x1="334" y1="116" x2="310" y2="86" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
            <circle cx="334" cy="116" r="6" fill="#CBD5E1" />
            <text x="334" y="142" textAnchor="middle" fill="#4ADE80" fontSize="9.5" fontWeight="800">
              Øko ~2.000
            </text>
            <text x="334" y="156" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="700">
              o/min
            </text>

            <rect x="174" y="38" width="92" height="148" rx="14" fill="#09090B" stroke="#334155" strokeWidth="2" />
            <circle cx="220" cy="150" r="9" fill="#1D4ED8" opacity="0.35" stroke="#60A5FA" strokeWidth="1" />
            <text x="220" y="153" textAnchor="middle" fill="#93C5FD" fontSize="7" fontWeight="800">
              FJERN
            </text>
            {hotspotCircle('olie_lampe', 200, 72, 'OLIE', '#DC2626')}
            {hotspotCircle('bremse_lampe', 240, 72, '(!)', '#DC2626')}
            {hotspotCircle('temp_lampe', 200, 114, 'TEMP', '#EF4444')}
            {hotspotCircle('abs_lampe', 240, 114, 'ABS', '#F59E0B')}
            <text x="220" y="176" textAnchor="middle" fill="#FCA5A5" fontSize="8" fontWeight="800">
              RØD = STANDS STRAKS!
            </text>
          </g>
        );

      default:
        return null;
    }
  };

  const labelLookupWords = currentInfo ? extractOrdnetLookupWords(currentInfo.labelDa, 2) : [];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 5 Beginner-to-Pro Tabs */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTab(t.id)}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs transition-all ${
                isActive
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="font-semibold leading-tight">{t.da}</div>
              {languageMode !== 'da_only' && (
                <div className={`mt-0.5 text-[10px] leading-tight ${isActive ? 'opacity-80' : 'text-zinc-400'}`}>
                  {t.ru}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Viewport: Real Annotated Engine Bay Photo for motorrum, Schematic SVG for other tabs */}
      {tab === 'motorrum' ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
          <img
            src="./images/rules/engine-bay-fluids.jpg"
            alt="Реальное фото подкапотного пространства учебного автомобиля"
            className="h-full w-full select-none object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-zinc-950/20" />
          <div className="pointer-events-none absolute left-3 top-2.5 rounded-lg bg-zinc-950/75 px-2.5 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur-sm">
            {compact ? 'Нажмите на метку (1–5)' : 'Нажмите на любую метку прямо на фото (1–5)'}
          </div>

          {ENGINE_BAY_PINS.map((pin) => {
            const isActive = currentInfo?.id === pin.id;
            const pinInfo = HOTSPOTS.find((h) => h.id === pin.id);
            return (
              <div
                key={pin.id}
                style={{ left: pin.left, top: pin.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {isActive && (
                  <span
                    className="pointer-events-none absolute inset-0 -m-1.5 rounded-full opacity-45 animate-ping"
                    style={{ backgroundColor: pin.color }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(pin.id)}
                  aria-label={pinInfo?.labelDa ?? pin.num}
                  style={{ backgroundColor: isActive ? pin.color : 'rgba(24,24,27,0.92)' }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-extrabold text-white shadow-lg transition-transform ${
                    isActive ? 'scale-115 border-white ring-2 ring-white/50' : 'border-white/85 hover:scale-110'
                  }`}
                >
                  {pin.num}
                </button>
                {!compact && isActive && pinInfo && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 w-max max-w-[190px] -translate-x-1/2 rounded-lg bg-zinc-950/90 px-2.5 py-1 text-center text-[11px] font-semibold leading-tight text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                    {languageMode === 'da_only' ? pinInfo.labelDa : pinInfo.labelRu}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
          <svg viewBox="0 0 440 220" className="h-auto w-full select-none">
            {renderDiagram()}
          </svg>
        </div>
      )}

      {/* Interactive pills for hotspots in active tab */}
      <div className="flex flex-wrap gap-1.5">
        {tabHotspots.map((item) => {
          const isSelected = currentInfo?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-200'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {item.labelDa}
            </button>
          );
        })}
      </div>

      {/* Selected hotspot specification card (hidden when compact=true in exams) */}
      {!compact && currentInfo && (
        <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-zinc-50/90 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/75">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <BilingualText
                da={currentInfo.labelDa}
                ru={currentInfo.labelRu}
                mode={languageMode}
                daClassName="text-sm font-semibold"
                ruClassName="text-xs"
              />
              {labelLookupWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {labelLookupWords.map((w) => (
                    <a
                      key={w}
                      href={getOrdnetUrl(w)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-teal-200/80 bg-teal-50/70 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-800/70 dark:bg-teal-950/50 dark:text-teal-300"
                    >
                      <span>DDO: {w}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <SpeakButton
              id={`tech_${currentInfo.id}`}
              text={`${currentInfo.labelDa}. ${currentInfo.checkDa}`}
            />
          </div>

          <div className="rounded-lg border border-sky-200/70 bg-sky-50/50 px-3 py-2 dark:border-sky-900/50 dark:bg-sky-950/30">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              {languageMode === 'da_only' ? 'Sådan finder du den' : 'Как узнать на глаз'}
            </div>
            <BilingualText
              da={currentInfo.lookDa}
              ru={currentInfo.lookRu}
              mode={languageMode}
              daClassName="text-xs font-normal"
              ruClassName="text-[11px]"
            />
          </div>

          <div className="border-t border-zinc-200/80 pt-2 dark:border-zinc-800">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {languageMode === 'da_only' ? 'Kontrol på prøven' : 'Как проверить руками'}
            </div>
            <BilingualText
              da={currentInfo.checkDa}
              ru={currentInfo.checkRu}
              mode={languageMode}
              daClassName="text-xs sm:text-sm font-normal"
              ruClassName="text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
