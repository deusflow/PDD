import React, { useEffect, useId, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  HelpCircle,
  Wrench,
} from 'lucide-react';
import { LanguageMode, TechnicalTabId } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { SpeakButton } from '../common/SpeakButton';
import { TheoryBilingual } from '../common/TheoryBilingual';

interface CarTechnicalSVGProps {
  initialTab?: TechnicalTabId;
  activeHotspot?: string;
  languageMode?: LanguageMode;
  compact?: boolean;
  lockedTab?: boolean;
  className?: string;
}

interface HotspotInfo {
  id: string;
  tab: TechnicalTabId;
  labelDa: string;
  labelRu: string;
  whyDa: string;
  whyRu: string;
  lookDa: string;
  lookRu: string;
  checkDa: string;
  checkRu: string;
  okDa?: string;
  okRu?: string;
  failDa?: string;
  failRu?: string;
}

const HOTSPOTS: HotspotInfo[] = [
  // 0. Kabine & Pedaler (Beginner zero-to-one)
  {
    id: 'pedaler',
    tab: 'kabine',
    labelDa: 'Pedaler: Kobling · Bremse · Speeder',
    labelRu: '3 педали: Сцепление · Тормоз · Газ',
    whyDa: 'Det er helt afgørende, at dine fødder finder den rigtige pedal i blinde — især i en nødsituation, hvor du aldrig må forveksle bremse og speeder.',
    whyRu: 'Ваши ноги должны находить педали вслепую ещё до выезда со двора, чтобы в экстренный момент мгновенно нажать тормоз, а не газ.',
    lookDa: 'Fra venstre mod højre på manuelt gear: K (Kobling) helt til venstre, B (Bremse) i midten, S (Speeder) til højre. På automatgear (P-R-N-D) mangler K.',
    lookRu: 'Слева направо на «механике»: 1) Сцепление (K, крайняя левая), 2) Тормоз (B, широкая в центре), 3) Газ (S, крайняя правая). На «автомате» (P-R-N-D) левой педали вообще нет!',
    checkDa: 'Venstre fod styrer KUN koblingen; højre fod skifter mellem bremse og gas. På automatgear hviler venstre fod altid roligt på fodhvileren til venstre.',
    checkRu: 'На механике левая нога нажимает ТОЛЬКО сцепление, а правая работает с тормозом и газом. На автомате левая нога ВСЕГДА отдыхает на подставке слева — тормоз и газ жмёт только правая!',
    okDa: 'Hver fod har sine faste pedaler, og du sidder, så kobling eller bremse nemt kan trædes i bund.',
    okRu: 'Правая нога свободно переставляется с газа на тормоз с пятки; на автомате левая нога спокойно стоит на площадке.',
    failDa: 'At bremse med venstre fod i en bil med automatgear — man hugger næsten altid bremsen alt for hårdt i bund!',
    failRu: 'Попытаться притормозить левой ногой на автомате: по привычке ударите по тормозу со всей силы до резкого блока колёс.',
  },
  {
    id: 'motorhjelm',
    tab: 'kabine',
    labelDa: 'Motorhjelm (Åbning i 3 trin)',
    labelRu: 'Как открыть капот (3 простых шага)',
    whyDa: 'Både før køreturen og til den mundtlige kontrolprøve skal du selv kunne åbne motorhjelmen uden at famle, så du kan tjekke væsker.',
    whyRu: 'На первом уроке и на устном экзамене Kontrolprøven инспектор просит вас самого открыть капот, чтобы показать жидкости — никто не откроет его за вас.',
    lookDa: 'Indvendigt udløsergreb sidder nede ved venstre fod (ofte med et bilikon med åben hjelm). Ude foran sidder en lille sikkerhedskrog midt under forkanten.',
    lookRu: '1) Рычажок/ручка в самом низу у левой ноги водителя (значок авто с приподнятым капотом). 2) Снаружи по центру под кромкой капота — страховочный язычок.',
    checkDa: '1) Træk i grebet ved venstre fod (klikkelyd) · 2) Skub sikkerhedslåsen til side/op under midten af hjelmen · 3) Løft hjelmen og sæt støttepinden i hak.',
    checkRu: 'Шаг 1: потяните рычаг у левой ноги до щелчка (капот чуть приподнимется). Шаг 2: нащупайте защёлку по центру под кромкой и сдвиньте вбок/вверх. Шаг 3: поднимите капот и уприте штангу.',
    okDa: 'Hjelmen står sikkert på støttepinden (eller gasdæmperne) og klikker fast i begge låse, når den lukkes igen.',
    okRu: 'Капот надёжно зафиксирован штангой, а при закрытии опускается с ~20 см и защёлкивается без люфта.',
    failDa: 'At glemme den skjulte sikkerhedskrog ude foran eller køre af sted uden at hjelmen er klikket helt i lås.',
    failRu: 'Тянуть приподнятый капот силой, не нащупав вторую защёлку, либо недозакрыть капот перед поездкой.',
  },
  {
    id: 'lyskontakt',
    tab: 'kabine',
    labelDa: 'Lyskontakt & Blinklysarm (Venstre)',
    labelRu: 'Свет и левый рычажок поворотников',
    whyDa: 'Automatiske kørelys (DRL) tænder ofte kun forlygterne om dagen — i regn, tåge eller tunnel kan din bil være helt mørk bagtil, hvis du ikke drejer lyskontakten selv.',
    whyRu: 'Днём многие машины в режиме «Auto» включают только передние ходовые огни — в дождь, туман или туннель машина сзади остаётся невидимой без ручного ближнего света!',
    lookDa: 'Venstre arm bag rattet styrer blinklys og fjernlys. Lyskontakten sidder enten til venstre på instrumentbrættet eller som drejering på venstre arm.',
    lookRu: 'Левый подрулевой рычаг = поворотники (вниз — налево, вверх — направо) и дальний свет (толчок от себя). Переключатель света — слева от руля или кольцо на том же рычаге.',
    checkDa: 'Blink op = højre, ned = venstre; skub armen frem = fjernlys (blå lampe!). Drej lyskontakten til nærlys (grøn lampe) i regn, skumring og tunnel.',
    checkRu: 'Вверх = правый поворотник, вниз = левый (как направление поворота руля!). В дождь, сумерки и туннель вручную поверните тумблер на ближний свет (nærlys).',
    okDa: 'Grøn nærlyslampe lyser i regn/mørke, og blå lampe tænder kun, når fjernlyset er aktiveret uden blænding af andre.',
    okRu: 'В непогоду горят и передние фары, и задние красные фонари; при дальнем свете на приборке горит синяя лампа.',
    failDa: 'At stole blindt på «Auto» i regn/tåge, så baglygterne er helt slukkede og biler bagfra ser dig for sent.',
    failRu: 'Полагаться только на режим Auto в дождь или туман — задние габариты могут не включиться!',
  },
  {
    id: 'visker_havari',
    tab: 'kabine',
    labelDa: 'Vinduesvisker, Sprinkler & Havariblink',
    labelRu: 'Дворники (правый рычаг) и кнопка «Аварийка»',
    whyDa: 'Rent udsyn gennem forruden og hurtig advarsel med havariblink ved pludselig kø eller motorstop forebygger påkørsler på få sekunder.',
    whyRu: 'Брызнуть омывателем на грязное стекло или мгновенно включить аварийку перед внезапной пробкой на трассе вы должны уметь не глядя вниз.',
    lookDa: 'Højre arm bag rattet viser ikoner af en forrude med visker. Midt på konsollen sidder en stor rød knap med trekantsymbol (havariblink).',
    lookRu: 'Правый рычажок за рулём отвечает за щётки и омыватель. В центре торпедо — заметная кнопка с красным треугольником (Havariblink).',
    checkDa: 'Højre arm op/ned = viskerhastighed; træk armen ind mod dig selv = sprøjt sprinklervæske på ruden. Tryk på rød trekant ved motorstop eller brat kø på motorvej.',
    checkRu: 'Правый рычаг вверх/вниз меняет частоту взмахов; потянуть НА СЕБЯ — побрызгать водой на стекло. Красный треугольник включают при поломке, ДТП или резком хвосте пробки.',
    okDa: 'Viskerne tørrer ruden helt ren uden striber, og alle 6 blinklys blinker samtidig ved tryk på havariknappen.',
    okRu: 'Стекло очищается равномерно за пару взмахов, а аварийка мигает одновременно на всех 6 фонарях.',
    failDa: 'Slidte viskerblade, der smører snavs ud i blinde striber, eller tom sprinklerbeholder midt i salt og sjap.',
    failRu: 'Пустой бачок омывателя или порванные резинки щёток, размазывающие грязь по стеклу на солнце.',
  },
  {
    id: 'saede_spejle',
    tab: 'kabine',
    labelDa: 'Sæde, Nakkestøtte & 3 Spejle',
    labelRu: 'Посадка, подголовник и 3 зеркала перед стартом',
    whyDa: 'Sidder du for langt væk, når du ikke bremsepedalen i bund ved panikstop; sidder du skævt eller med for lav nakkestøtte, øges risikoen for piskesmæld markant.',
    whyRu: 'Неправильная посадка лишает вас силы экстренного торможения и контроля руля, а низкий подголовник при ударе сзади приводит к травме шеи.',
    lookDa: 'Bøjle under sædets forkant flytter det frem/tilbage; greb/hjul på siden justerer ryglæn og højde. Spejlknap sidder ofte på førerdøren (L / R).',
    lookRu: 'Скоба под передним краем кресла двигает его вперёд/назад; рычаг/колесо сбоку — наклон спинки. Джойстик зеркал (L/R) — обычно на двери водителя.',
    checkDa: 'Træd kobling (eller bremse på automatgear) i bund med let bøjet knæ, håndled når rattets top, nakkestøttens overkant i højde med issen, og blot ~1–2 cm af egen bil i sidespejlene.',
    checkRu: 'При выжатой педали (сцепления или тормоза на автомате) колено остаётся чуть согнутым, запястья касаются верха руля, макушка вровень с верхом подголовника, а в боковых зеркалах видно лишь ~1–2 см своей машины.',
    okDa: 'Let bøjet knæ ved fuldt pedaltryk, frit udsyn bagud i bakspejlet og minimale blinde vinkler i sidespejlene.',
    okRu: 'Педаль жмётся до упора без отрыва поясницы, а боковые зеркала смотрят на соседние полосы, а не на ваши ручки дверей.',
    failDa: 'Strakt ben ved bremsning, nakkestøtte nede i nakken eller sidespejle rettet så langt ind, at halvdelen viser din egen bildør.',
    failRu: 'Прямая нога при нажатии тормоза, заваленная далеко назад спинка или зеркала, повёрнутые внутрь на собственный кузов.',
  },

  // 1. Motorrum (over real engine bay photo)
  {
    id: 'koelervaeske',
    tab: 'motorrum',
    labelDa: 'Kølervæske (Ekspansionsbeholder)',
    labelRu: 'Охлаждающая жидкость (антифриз)',
    whyDa: 'Kølervæsken forhindrer motoren i at overophede og koge over (eller fryse til is om vinteren). Uden kølervæske ødelægges topstykket hurtigt.',
    whyRu: 'Антифриз отводит жар от работающего двигателя (как радиатор в доме, только наоборот) и не даёт мотору закипеть летом или замёрзнуть зимой.',
    lookDa: 'Gennemsigtig rund plastikbeholder med LYSRØD væske og blåt/sort tryklåg øverst til venstre under hjelmen.',
    lookRu: 'Полупрозрачный округлый бачок с РОЗОВОЙ (иногда зелёной или синей) жидкостью сверху слева под капотом; на крышке нарисован градусник/книжка.',
    checkDa: 'Standen skal ligge mellem MIN og MAX på beholderens side. Åbn ALDRIG låget, mens motoren er varm — overtryk kan sprøjte kogende væske ud!',
    checkRu: 'Посмотрите на метки MIN и MAX сбоку бачка, НЕ откручивая крышку! На горячем двигателе внутри высокое давление — можно обжечься паром.',
    okDa: 'Lyserød/klar væske mellem MIN og MAX på kold motor, ingen lækager eller rustfarvet snavs.',
    okRu: 'Уровень между отметками MIN и MAX, жидкость прозрачная розового/цветного оттенка, бачок закрыт.',
    failDa: 'Væskestanden er under MIN, beholderen er helt tom, eller du forsøger at skrue låget af på varm motor.',
    failRu: 'Уровень ниже MIN, пустой бачок (мотор перегревается!) или попытка открыть крышку сразу после поездки.',
  },
  {
    id: 'sprinklervaeske',
    tab: 'motorrum',
    labelDa: 'Sprinklervæske (Blåt låg)',
    labelRu: 'Бачок омывателя (синяя крышка)',
    whyDa: 'På våde og saltede danske veje bliver forruden uigennemsigtig på få sekunder efter en modkørende lastbil. Sprinklervæske er lovpligtig for klart udsyn.',
    whyRu: 'На датских дорогах в дождь или зимнюю слякоть брызги от встречной фуры за секунду делают лобовое стекло слепым — без омывателя вы ничего не увидите.',
    lookDa: 'Lille BLÅT flip-låg helt fremme til venstre ved forlygten — markeret med et symbol af en forrude med vandstråle.',
    lookRu: 'Яркая СИНЯЯ крышка спереди слева у края капота, на ней нарисовано лобовое стекло с фонтанчиком воды.',
    checkDa: 'Åbn det blå låg og tjek, at der er rigeligt væske i beholderen (brug frostsikret væske ned til mindst −20 °C om vinteren).',
    checkRu: 'Откройте синюю крышку, загляните или нажмите омыватель из салона. Зимой заливайте только незамерзайку (минимум до −20 °C), обычная вода разорвёт бачок!',
    okDa: 'Fyldt beholder med frostsikret væske og kraftig stråle ud på både for- og bagrude.',
    okRu: 'В бачке есть жидкость, а форсунки бодро брызгают на стекло при нажатии правого рычага на себя.',
    failDa: 'Tom beholder eller almindeligt postevand om vinteren, der fryser til is i dyser og slanger.',
    failRu: 'Пустой бачок или летняя вода при минусовой температуре — щётки только размажут соль белой плёнкой.',
  },
  {
    id: 'motorolie',
    tab: 'motorrum',
    labelDa: 'Motorolie & Oliepind',
    labelRu: 'Щуп и горловина моторного масла',
    whyDa: 'Olien smører motorens metaldele, der bevæger sig tusindvis af gange i minuttet. For lidt olie giver massiv friktion og ødelægger motoren permanent.',
    whyRu: 'Масло смазывает и охлаждает детали внутри двигателя — без него металл трётся о металл, и мотор заклинит за считанные минуты.',
    lookDa: 'OLIEPIND: den lille GULE (eller orange) løkke foran på motoren. Lige ved siden af sidder det sorte påfyldningsdæksel med oliekande-symbol.',
    lookRu: 'Ищите яркое ЖЁЛТОЕ колечко (ручка щупа — oliepind) по центру мотора. Рядом чёрная пробка со значком лейки — туда доливают масло.',
    checkDa: 'Bilen skal stå plant med slukket motor (vent 5 min.). Træk pinden op, tør den ren med papir, sæt den helt ned igen, træk op og aflæs oliestregen.',
    checkRu: 'Машина стоит ровно, мотор заглушен. Выньте жёлтый щуп, оботрите его салфеткой досуха, вставьте обратно до упора, снова выньте — масляный след должен быть между MIN и MAX.',
    okDa: 'Oliemærket på spidsen af oliepinden ligger mellem MIN og MAX (helst tæt på MAX).',
    okRu: 'След чистого/янтарного масла ровно между рисками MIN и MAX на конце щупа.',
    failDa: 'Olien er under MIN (skal efterfyldes før kørsel) eller aflæst mens motoren kører eller bilen holder skævt.',
    failRu: 'Уровень ниже MIN (или кончик щупа сухой) либо проверка на заведённом моторе/крутом уклоне.',
  },
  {
    id: 'bremsevaeske',
    tab: 'motorrum',
    labelDa: 'Bremsevæskebeholder',
    labelRu: 'Бачок тормозной жидкости',
    whyDa: 'Når du træder på bremsepedalen, er det denne væske i rørene, der presser bremseklodserne mod hjulene. Falder væsken pludseligt, kan bremserne svigte helt.',
    whyRu: 'Когда вы жмёте тормоз, усилие на колёса передаётся именно по этой жидкости в трубках. Если она вытечет — машина вообще перестанет тормозить.',
    lookDa: 'Lille firkantet lys beholder bagerst under forruden (til højre mellem motoren og batteriet) med bremse-symbol på låget.',
    lookRu: 'Небольшой полупрозрачный бачок в глубине ближе к лобовому стеклу (между мотором и аккумулятором), часто с чёрно-жёлтым значком (!).',
    checkDa: 'Aflæs standen udefra gennem den lyse plastikvæg mellem MIN og MAX (skru ikke låget af!). Pludseligt væsketab = utæthed!',
    checkRu: 'Уровень смотрят снаружи сквозь светлые стенки бачка (крышку лучше лишний раз не откручивать, чтобы не попала влага): должен быть между MIN и MAX.',
    okDa: 'Klar gullig væske mellem MIN og MAX, og den falder ikke hurtigt mellem kontrollerne.',
    okRu: 'Жидкость находится между MIN и MAX и держит стабильный уровень.',
    failDa: 'Under MIN eller hurtigt faldende stand = alvorlig utæthed i bremsesystemet — kør IKKE videre!',
    failRu: 'Уровень упал ниже MIN или быстро снижается — возможна утечка в тормозной магистрали, ехать запрещено!',
  },
  {
    id: 'batteri',
    tab: 'motorrum',
    labelDa: '12V Batteri (Startbatteri)',
    labelRu: 'Аккумулятор 12V (АКБ)',
    whyDa: '12V-batteriet leverer strøm til at starte motoren og driver lys, blinklys og advarselssystemer. Et løst batteri kan kortslutte ved hård opbremsning.',
    whyRu: 'Аккумулятор запускает стартер и питает всю электронику и фары. Если он не закреплён, на кочке или при торможении он сместится и может замкнуть проводку.',
    lookDa: 'Sort firkantet kasse til højre under hjelmen med to tykke kabler (+ rød kappe og − sort).',
    lookRu: 'Крупный чёрный прямоугольный блок справа; сверху подходят два толстых провода: красный плюс (+) и чёрный минус (−).',
    checkDa: 'Tag fat i batterikassen (skal sidde urokkeligt fast spændt) og kontroller, at polskoene sidder stramt uden hvidt/grønt ir.',
    checkRu: 'Покачайте корпус руками (он обязан быть жёстко прикручен) и посмотрите на клеммы — они должны сидеть плотно, без белого/зелёного налёта.',
    okDa: 'Batteriet sidder helt fast, kablerne er stramme og rene, og rød batterilampe slukker efter motorstart.',
    okRu: 'Батарея не болтается, контакты чистые и затянутые, после старта мотора красная лампа АКБ гаснет.',
    failDa: 'Løst batteri, irrede/løse polsko eller tændt rød batterilampe under kørsel (generatoren lader ikke).',
    failRu: 'Аккумулятор шатается в креплении, клеммы окислены/болтаются или на ходу горит красная иконка батареи.',
  },

  // 2. Dæk, Bremser & Styretøj
  {
    id: 'daek',
    tab: 'daek_bremser',
    labelDa: 'Dækmønster (min. 1,6 mm & TWI)',
    labelRu: 'Протектор шин (мин. 1,6 мм и метки TWI)',
    whyDa: 'Rillerne i dækket leder vand, sjap og regn væk under hjulet. Er dækket slidt ned under 1,6 mm, mister bilen vejgrebet (akvaplaning) og bremselængden eksploderer.',
    whyRu: 'Глубокие канавки на шине отводят воду и снег из-под колеса. Если протектор стёрся, машина на первой же луже всплывает («аквапланирование») и не тормозит.',
    lookDa: 'Kig ned i dækkets dybe langsgående riller efter de små forhøjede gummiklodser (TWI) — på dæksiden står ofte "TWI" eller en lille trekant ud for dem.',
    lookRu: 'Загляните в глубокие продольные канавки шины: на дне видны маленькие резиновые перемычки высотой 1,6 мм (на боковине напротив них стоит значок TWI или треугольник).',
    checkDa: 'Mindst 1,6 mm i alle hovedriller (må ikke være slidt i plan med TWI-klodsen!). Alle 4 dæk skal være af samme type; i sne/is mindst M+S / 3PMSF-vinterdæk.',
    checkRu: 'Сравните высоту рисунка с перемычкой TWI: поверхность шины должна быть ВЫШЕ неё. Все 4 колеса одного типа (нельзя смешивать лето и зиму); в снег/гололёд с 01.07.2025 обязательны зимние M+S / 3PMSF!',
    okDa: 'Klart dybere mønster end TWI-mærkerne (gerne ≥ 3 mm om vinteren), ens dæktype på alle 4 hjul og korrekt lufttryk.',
    okRu: 'Протектор заметно глубже перемычки TWI (для зимы от 3 мм), на боках нет грыж и порезов, все 4 шины одного сезона.',
    failDa: 'Gummiklodsen TWI flugter med dækkets overflade (< 1,6 mm), bule/revne i dæksiden eller sommerdæk på én aksel og vinterdæk på den anden.',
    failRu: 'Рисунок сравнялся с меткой TWI («лысая» шина < 1,6 мм), видны грыжи/корды или стоят летние шины спереди и зимние сзади.',
  },
  {
    id: 'bremser',
    tab: 'daek_bremser',
    labelDa: 'Driftsbremse & Vakuumforstærker',
    labelRu: 'Педаль тормоза и вакуумный усилитель',
    whyDa: 'En tung bil kræver vakuumforstærker, som hjælper din fod med at bremse let (virker kun når motoren er tændt). Testen beviser både, at hjælperen virker, og at bremsesystemet ikke lækker væske.',
    whyRu: 'Машина весит больше тонны, поэтому вашей ноге помогает вакуумный усилитель (он работает только при заведённом моторе). Эта проверка доказывает две вещи: усилитель помогает и тормозная жидкость нигде не подтекает.',
    lookDa: 'Den midterste (på automatgear venstre) brede pedal ved dine fødder.',
    lookRu: 'Средняя широкая педаль под правой ногой (на автомате — широкая левая педаль под правую ногу).',
    checkDa: '1) Med slukket motor: pump bremsen 3–4 gange til den bliver hård. 2) Hold foden på pedalen med helt almindeligt fast tryk (som ved et rødt lys — IKKE alt hvad du kan!) og start motoren. 3) Bliv stående på pedalen i ca. 10 sek.',
    checkRu: '1) Заглушите мотор и нажмите тормоз 3–4 раза — педаль станет тугой (ушёл остаточный вакуум). 2) Держите ногу на педали с обычным уверенным усилием (как остановились перед красным светофором, НЕ давя всем весом!) и заведите мотор. 3) Удерживайте ногу неподвижно ~10 секунд.',
    okDa: 'Pedalen synker en smule blødt ved motorstart (forstærkeren tager over) og står derefter klippefast på samme niveau i alle 10 sek.',
    okRu: 'Слегка опустилась при запуске двигателя (усилитель включился — это НОРМА!) и дальше 10 секунд стоит на одном уровне, не уходя в пол.',
    failDa: 'Pedalen forbliver stenhård ved motorstart (forstærker defekt) ELLER bliver ved med at synke langsomt mod gulvet (utæthed/lækage — kør IKKE!).',
    failRu: 'Осталась каменной при запуске (сломан усилитель) ИЛИ продолжает медленно проваливаться к полу за 10 сек (утечка в системе — ехать нельзя!).',
  },
  {
    id: 'haandbremse',
    tab: 'daek_bremser',
    labelDa: 'Parkeringsbremse (Håndbremse)',
    labelRu: 'Стояночный тормоз (ручник)',
    whyDa: 'Håndbremsen holder bilen låst på bakker, så den ikke triller ind i andre biler eller fodgængere, og virker mekanisk uafhængigt af fodbremsevæsken.',
    whyRu: 'Ручник удерживает стоящую машину на уклоне даже при выключенном моторе — и служит резервом на случай отказа основной гидравлики.',
    lookDa: 'Enten et klassisk håndtag mellem forsæderne eller en lille knap med "(P)" symbol i midterkonsollen.',
    lookRu: 'Классический рычаг между передними сиденьями (поднимается со щелчками) либо небольшая клавиша со значком `(P)` у консоли.',
    checkDa: 'Træk håndbremsen (eller aktiver P-knappen), sæt i frigear/N og mærk på en svag skråning eller ved let igangsætning, at bilen står helt fast.',
    checkRu: 'Поставьте на ручник, на небольшом уклоне отпустите основной тормоз (в нейтрали) — авто обязано оставаться неподвижным и при начале движения явно упираться.',
    okDa: 'Bilen står helt stille på hældning uden at rulle, og den røde P-lampe slukker straks, når håndbremsen løsnes helt.',
    okRu: 'Машина стоит мёртво, а после снятия с ручника красная лампа `(!)` / `(P)` на панели сразу гаснет.',
    failDa: 'Håndtaget skal helt op i loftet før det bider, bilen ruller, eller håndbremsen hænger og lyser rødt under kørsel.',
    failRu: 'Машина откатывается на ручнике или рычаг уходит до самого верха почти без сопротивления.',
  },
  {
    id: 'stoddaempere',
    tab: 'daek_bremser',
    labelDa: 'Støddæmpere (4 hjørner)',
    labelRu: 'Амортизаторы (проверка углов кузова)',
    whyDa: 'Uden støddæmpere ville bilen hoppe på fjedrene efter hvert bump som en bold, så hjulene mister greb med asfalten i sving og ved opbremsning.',
    whyRu: 'Амортизаторы гасят раскачку пружин. Если они «убиты», колёса на кочках буквально отрываются от асфальта, машину кидает в повороте и растёт тормозной путь.',
    lookDa: 'Kontrolleres udefra over hvert af bilens 4 hjørner lige over hjulkasserne (begge forskærme og bagskærme).',
    lookRu: 'Проверяются снаружи машины: подойдите по очереди к каждому из 4 углов кузова (над каждым колесом).',
    checkDa: 'Læg begge hænder over hjørnet af skærmen, tryk kraftigt ned én gang og slip med det samme — se hvor hurtigt bilen falder til ro.',
    checkRu: 'Упритесь ладонями в прочное место крыла прямо над колесом, резко качните машину вниз и отпустите руки — проследите за движением кузова.',
    okDa: 'Bilen rejser sig ét enkelt roligt løft og falder straks helt til ro (max ca. 1–1,5 svingning).',
    okRu: 'Кузов поднимается ровно один раз и сразу замирает как влитой.',
    failDa: 'Bilen bliver ved med at gynge op og ned som en trampolin (2–3+ gange efter du slipper) — dæmperen er slidt op.',
    failRu: 'Машина продолжает качаться вверх-вниз 2–3 раза после отпускания (как мячик на пружине) — амортизатор изношен.',
  },
  {
    id: 'styretoej',
    tab: 'daek_bremser',
    labelDa: 'Styretøj & Ratslør (0 cm)',
    labelRu: 'Рулевое управление и люфт (0 см)',
    whyDa: 'Ratslør er «tom» bevægelse i rattet, hvor du drejer på rattet, uden at forhjulene flytter sig (som et løst cykelstyr). For meget slør gør bilen svær og farlig at holde lige på vejen.',
    whyRu: 'Люфт (ratslør) — это пустой ход руля: вы чуть повернули руль, а колёса всё ещё стоят прямо (как разболтанный руль у старого велосипеда). Проверка гарантирует, что машина слушается руля мгновенно.',
    lookDa: 'Rul førerdørens rude helt ned, stå eventuelt lige udenfor ved døren og kig direkte ned på det forreste venstre hjul, mens du holder øverst på rattet.',
    lookRu: 'Опустите водительское стекло полностью, встаньте у открытого окна и, держась рукой за верх руля, смотрите прямо на переднее левое колесо.',
    checkDa: 'Med STARTET motor (aktiv servostyring) vipper du let rattet fra side til side. «0 cm ratslør» betyder ikke en lineal: hjulet skal bare reagere med det samme uden forsinkelse!',
    checkRu: 'При ЗАВЕДЁННОМ двигателе (работает усилитель руля — servostyring) слегка покачайте руль влево-вправо. «0 см» не значит замерять линейкой: просто колесо обязано реагировать сразу, без пустого болтания.',
    okDa: 'Så snart du drejer en lille smule på rattet, begynder forhjulet øjeblikkeligt at dreje med.',
    okRu: 'Едва вы шевельнули руль — переднее колесо в ту же секунду повернулось вслед за ним.',
    failDa: 'Rattet kan drejes et par centimeter frem og tilbage, mens forhjulet står helt stille (dødgang/slør — skal på værksted!).',
    failRu: 'Руль свободно ходит на несколько сантиметров впустую, а колесо остаётся неподвижным — есть люфт, нужна диагностика на СТО.',
  },

  // 3. Lygter
  {
    id: 'positionslys',
    tab: 'lygter',
    labelDa: 'Positionslys (2 hvide + 2 røde)',
    labelRu: 'Габаритные огни (видимость 300 м)',
    whyDa: 'Positionslys markerer bilens bredde og position om natten, når bilen holder parkeret tæt på en uoplyst landevej — de er ikke bygget til at køre med alene.',
    whyRu: 'Габариты не освещают дорогу, а лишь «подсвечивают контур» стоящей машины в темноте, чтобы вас не задели на неосвещённой трассе.',
    lookDa: 'Det svage lys i for- og baglygter, når lyskontakten stilles på de to små modstående lygteikoner.',
    lookRu: 'Слабые контурные лампы (2 белые спереди + 2 красные сзади), значок на переключателе — два маленьких фонарика, светящих «в разные стороны».',
    checkDa: 'Gå rundt om bilen: 2 hvide/gullige lys foran og 2 røde bagpå skal kunne ses tydeligt på mindst 300 m i klart mørke uden at blænde.',
    checkRu: 'Обойдите машину: должны гореть 2 белых огня спереди и 2 красных сзади (плюс подсветка номера), видимые в темноте минимум за 300 м.',
    okDa: 'Alle 4 hjørnelys plus nummerpladelys lyser klart og ensartet.',
    okRu: 'Обе пары огней светят ровно, без перегоревших ламп.',
    failDa: 'En pære er sprunget, eller du kører rundt om natten kun med positionslys (det giver ingen sigtbarhed fremad!).',
    failRu: 'Езда ночью только на габаритах (дорогу не видно!) или не горит одна из сторон.',
  },
  {
    id: 'naerlys',
    tab: 'lygter',
    labelDa: 'Nærlys (min. 30 m & 1% fald)',
    labelRu: 'Ближний свет (мин. 30 м, уклон 1%)',
    whyDa: 'Dit vigtigste kørelys i mørke, regn og tunnel: det oplyser vejen foran dig uden at blænde modkørende bilister og tænder samtidig baglygterne.',
    whyRu: 'Главный рабочий свет: освещает дорогу на 30 м вперёд и правую обочину с пешеходами, при этом пучок скошен вниз на 1%, чтобы не слепить встречных.',
    lookDa: 'Ikon på lyskontakten med nedadvendte lysstråler (grøn lampe på instrumentbrættet). Lyskeglen peger længere ud langs højre kant.',
    lookRu: 'Значок фары с наклонными лучами вниз (на панели обычно горит зелёный значок). Асимметричный пучок дальше подсвечивает правый край дороги.',
    checkDa: 'Skal oplyse vejen mindst 30 m frem med 1 % fald (1 cm pr. meter), lyse symmetrisk i begge forlygter og tænde baglygterne automatisk.',
    checkRu: 'Включите ближний свет: горят обе передние фары (~30 м вперёд, лёгкий наклон вниз) и обязательно оба красных фонаря сзади.',
    okDa: 'Begge nærlygter lyser kraftigt og ensartet med tydelig skarp lysgrænse, og baglygterne er tændt.',
    okRu: 'Обе фары светят ровно (не «в небо»), и задние габариты гарантированно включены.',
    failDa: 'Én pære er død («énøjet» bil), eller forlygterne peger for højt op pga. tung bagage (glemte lygtehøjden!).',
    failRu: 'Не горит одна фара или забыли опустить корректор фар при полной загрузке багажника (слепите встречных).',
  },
  {
    id: 'fjernlys',
    tab: 'lygter',
    labelDa: 'Fjernlys (min. 100 m & Blå lampe)',
    labelRu: 'Дальний свет (мин. 100 м, синяя лампа)',
    whyDa: 'Ved 80 km/t på mørk landevej rækker 30 m nærlys kun godt ét sekund frem! Fjernlyset på min. 100 m giver dig tid til at se cyklister, rådyr og sving i god tid.',
    whyRu: 'На тёмной загородной трассе при 80 км/ч ближнего света (30 м) хватает всего на ~1,3 секунды! Дальний свет даёт 100+ м запаса, чтобы вовремя увидеть оленя, пешехода или поворот.',
    lookDa: 'Skub venstre arm væk fra dig (med nærlys tændt) — på instrumentbrættet lyser altid en markant BLÅ kontrollampe med lige stråler.',
    lookRu: 'Оттолкните левый рычаг от себя (при включённом ближнем свете) — на приборной панели сразу загорается яркая СИНЯЯ лампа.',
    checkDa: 'Lyser min. 100 m frem + blå kontrollampe lyser. Blænd ned til nærlys ca. 200–300 m før modkørende og ca. 100–150 m bag forankørende!',
    checkRu: 'Убедитесь, что горят все дальние секции фар (≥ 100 м) и горит СИНЯЯ иконка на приборке. Переключайтесь на ближний за 200–300 м до встречной машины и за 100–150 м за попутной.',
    okDa: 'Både fjernlygter og den lovpligtige BLÅ kontrollampe på panelet virker øjeblikkeligt.',
    okRu: 'Свет бьёт далеко вперёд, а синий индикатор на приборной панели ярко сигнализирует об этом водителю.',
    failDa: 'Blå lampe lyser ikke, eller du glemmer at blænde ned i tide for modkørende, cyklister og toge.',
    failRu: 'Едете на дальнем свете в освещённом городе или слепите встречного водителя/велосипедиста.',
  },
  {
    id: 'stoplys',
    tab: 'lygter',
    labelDa: 'Stoplys (3 røde lygter)',
    labelRu: 'Стоп-сигналы (3 красных фонаря)',
    whyDa: 'Stoplysene advarer bilerne bag dig inden for et splitsekund, når du sætter farten ned — uden dem opdager bagvedkørende ikke, at du bremser.',
    whyRu: 'Стоп-сигналы мгновенно предупреждают едущих сзади, что вы тормозите. Без них водитель позади поймёт это слишком поздно.',
    lookDa: '2 kraftige røde lygter i baglygterne + 1 højt i midten ved bagruden.',
    lookRu: '3 красных фонаря сзади: слева, справа и третья полоса по центру вверху/внизу заднего стекла.',
    checkDa: 'Bed prøvesagkyndigen eller en hjælper se bagpå (eller brug spejlingen i en mørk butiksrude), mens du træder på bremsen.',
    checkRu: 'Попросите инспектора/помощника встать сзади или проверьте в отражении витрины/стены при нажатии педали тормоза.',
    okDa: 'Alle 3 stoplys tænder straks ved pedaltryk og lyser væsentligt kraftigere end almindelige baglys.',
    okRu: 'Загораются все 3 фонаря сразу, и светят заметно ярче обычных красных габаритов.',
    failDa: 'Én eller flere stoplygter er sprunget (typisk det høje midterstoplys eller én sidepære).',
    failRu: 'Не горит одна из боковых ламп или центральный стоп-сигнал.',
  },
  {
    id: 'blinklys',
    tab: 'lygter',
    labelDa: 'Blinklys & Havariblink (60–120/min)',
    labelRu: 'Поворотники и аварийка (6 фонарей)',
    whyDa: 'Tydeligt blink er din vigtigste kommunikation med cyklister, fodgængere og andre biler før vognbaneskift, rundkørsler og sving.',
    whyRu: 'Поворотники показывают велосипедистам и другим водителям ваш план ДО того, как вы начали крутить руль.',
    lookDa: '6 gule/orange lygter: 2 foran, 2 på forskærme/sidespejle, 2 bagpå. Alle 6 blinker samtidig på den røde havariknap.',
    lookRu: '6 жёлтых фонарей (по 3 на борт: передняя фара, крыло/зеркало, задний фонарь). Нажмите красную кнопку аварийки, чтобы увидеть все 6 за один обход.',
    checkDa: 'Skal blinke ensartet 60–120 gange i minuttet (1–2 gange i sekundet) og tænde alle 3 lygter på hver side.',
    checkRu: 'Частота мигания 60–120 раз в минуту (примерно 1–2 щелчка в секунду), мигают все 3 фонаря с каждой стороны.',
    okDa: 'Alle 6 udvendige blinklys lyser gult/orange i rolig, ensartet takt.',
    okRu: 'Все 6 фонарей мигают ярко и в ровном ритме.',
    failDa: 'Blinker lampen inde i bilen dobbelt så hurtigt? Så er en udvendig blinklyspære næsten altid sprunget!',
    failRu: 'Стрелка на панели вдруг стала щёлкать вдвое быстрее обычного — верный признак, что снаружи перегорела лампочка!',
  },
  {
    id: 'nummerplade',
    tab: 'lygter',
    labelDa: 'Nummerpladelys (20 m) & Reflekser',
    labelRu: 'Подсветка номера (20 м) и катафоты',
    whyDa: 'Nummerpladen skal kunne aflæses i mørke, og de bagerste røde reflekser gør din bil synlig på lang afstand, selv hvis al strøm og lys svigter om natten.',
    whyRu: 'Подсветка делает номер читаемым в темноте, а красные катафоты отражают свет чужих фар, даже если машина стоит заглушенной без аккумулятора.',
    lookDa: 'Små hvide lamper lige over den bagerste nummerplade + 2 RØDE ikke-trekantede reflekser integreret i bagkofanger eller baglygter.',
    lookRu: 'Белые лампочки прямо над задним номером + 2 КРАСНЫХ нетреугольных катафота в заднем бампере или фонарях.',
    checkDa: 'Hvidt nummerpladelys skal gøre pladen læsbar på min. 20 m i mørke. En personbils 2 bagreflekser må ALDRIG være trekantede (trekant = kun trailer/påhængsvogn!).',
    checkRu: 'Подсветка номера (белая, минимум с 20 м читаемость) горит вместе с габаритами/ближним светом. У легковой машины сзади 2 красных катафота НЕ треугольной формы (треугольники — только для прицепов!).',
    okDa: 'Hvidt lys oplyser hele bagnummerpladen, og begge røde ikke-trekantede reflekser er hele og rene.',
    okRu: 'Номер чётко подсвечен белым светом, оба катафота целые и чистые.',
    failDa: 'Mørk nummerplade (sprungen pære), rødt lys på nummerpladen eller knækket/manglende refleks.',
    failRu: 'Подсветка номера не горит совсем или разбиты задние отражатели.',
  },
  {
    id: 'horn',
    tab: 'lygter',
    labelDa: 'Horn (Kun ved fare)',
    labelRu: 'Звуковой сигнал / клаксон',
    whyDa: 'Hornet er udelukkende et nødværktøj til at forhindre en ulykke her og nu — i Danmark er det ulovligt at dytte for at hilse eller skynde på andre.',
    whyRu: 'В Дании звуковой сигнал используется ТОЛЬКО чтобы предотвратить непосредственную аварию (сигналить знакомым или торопить соседа по светофору запрещено).',
    lookDa: 'Midterpuden på rattet (mærket med et lille horn/trompet-ikon).',
    lookRu: 'Центральная часть руля (значок гудка/трубы).',
    checkDa: 'Tryk ganske kort på rattets midterpude — hornet skal give én klar, ensartet tone (på prøven evt. på et åbent, roligt sted efter instruks).',
    checkRu: 'Короткое нажатие на центр руля должно давать чистый ровный звуковой сигнал без хрипа и задержек.',
    okDa: 'Tydelig, ensartet advarselstone ved kort tryk.',
    okRu: 'Сигнал чёткий, громкий и ровный.',
    failDa: 'Helt tavst horn, skrattende tone eller brug af hornet uden reel fare (fx af irritation i kø).',
    failRu: 'Клаксон молчит или хрипит при нажатии.',
  },

  // 4. Instrumentpanel
  {
    id: 'olie_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød oliekande — Olietryk',
    labelRu: 'Красная маслёнка — нет давления масла',
    whyDa: 'Uden olietryk mangler motoren øjeblikkeligt smøring indeni — fortsætter du kørslen blot få minutter, kan motoren brænde sammen.',
    whyRu: 'Нет давления масла = двигатель работает «на сухую». Даже 2–3 минуты езды с этой красной лампой могут полностью убить мотор.',
    lookDa: 'Rødt ikon formet som en oliekande med en dråbe på spidsen.',
    lookRu: 'Красный значок старинной маслёнки/лейки с капелькой.',
    checkDa: 'Skal tænde ved tænding og slukke straks efter motorstart. Lyser den under kørsel: STANDS STRAKS sikkert og sluk motoren!',
    checkRu: 'При повороте ключа загорается для проверки, а сразу после запуска двигателя обязана погаснуть. Загорелась на ходу = остановитесь у обочины НЕМЕДЛЕННО и заглушите мотор!',
    okDa: 'Slukker inden for 1–2 sekunder efter, at motoren starter.',
    okRu: 'Погасла сразу после запуска двигателя.',
    failDa: 'Forbliver rød eller blinker under kørsel — kør IKKE videre til tankstation eller værksted!',
    failRu: 'Горит красным на заведённом двигателе — ехать дальше категорически нельзя (вызывайте эвакуатор / звоните в автошколу).',
  },
  {
    id: 'bremse_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød (!) — Bremsefejl / Håndbremse',
    labelRu: 'Красный (!) — ручник или ошибка тормозов',
    whyDa: 'Den advarer enten om, at du er ved at køre med håndbremsen trukket, eller at der er farligt lav bremsevæske/lækage i bremserne.',
    whyRu: 'Лампа подсказывает либо забытый ручник, либо критически низкий уровень тормозной жидкости (риск отказа тормозов).',
    lookDa: 'Rød cirkel med udråbstegn `(!)` (eller `(P)`) midt på instrumentbrættet.',
    lookRu: 'Красный кружок с восклицательным знаком `(!)` или `(P)`.',
    checkDa: 'Skal slukke helt, når håndbremsen løsnes! Lyser den rødt videre under kørsel: stands straks sikkert og tjek bremsevæsken.',
    checkRu: 'На стоянке с поднятым ручником она горит (это нормально). Но как только ручник опущен, лампа должна погаснуть! Если горит на ходу — немедленно остановитесь.',
    okDa: 'Slukker helt så snart håndbremsen sænkes før igangsætning.',
    okRu: 'Сразу гаснет после снятия машины с ручника.',
    failDa: 'Rød `(!)` lyser stadig under kørsel med håndbremsen helt nede = bremsefejl eller manglende bremsevæske!',
    failRu: 'Ручник полностью опущен, а красный `(!)` горит на ходу = утечка тормозной жидкости или отказ контура.',
  },
  {
    id: 'temp_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød Temperatur / Batteri',
    labelRu: 'Красный термометр (перегрев) / АКБ',
    whyDa: 'Begge røde lamper advarer om akut teknisk svigt: enten overophedes motoren, eller også løber batteriet tørt, så servo, bremsekraft og lys pludselig kan svigte.',
    whyRu: 'Красная лампа на панели всегда означает «СТОП»: мотор закипает (термометр) либо генератор перестал заряжать аккумулятор и скоро отключится вся электроника.',
    lookDa: 'Rødt termometer over bølger (motortemperatur) eller rødt batteri-symbol med + og −.',
    lookRu: 'Красный градусник над волнами (температура антифриза) или красный прямоугольник батарейки со знаками `+` и `−`.',
    checkDa: 'Rød lampe = stands sikkert hurtigst muligt og sluk motoren! Ved varmt termometer: lad motoren køle helt af og åbn ALDRIG det varme kølervæskedæksel.',
    checkRu: 'Остановитесь как можно быстрее в безопасном месте и заглушите мотор. При перегреве НЕ открывайте бачок антифриза, пока мотор полностью не остынет!',
    okDa: 'Begge lamper slukker få sekunder efter start og forbliver slukkede under kørsel.',
    okRu: 'Гаснут сразу после запуска двигателя.',
    failDa: 'Lyser rødt under kørsel — du risikerer motorhavari eller pludseligt strømsvigt midt i trafikken.',
    failRu: 'Горят красным во время езды — продолжение поездки грозит закипанием/заклиниванием двигателя или полным отказом электрики.',
  },
  {
    id: 'abs_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Gul ABS / ESP / Motorlampe',
    labelRu: 'Жёлтая лампа (ABS / ESP / Check Engine)',
    whyDa: 'Gule/orange lamper er en vigtig skillelinje på prøven: de betyder «advarsel — kør forsigtigt til værksted», i modsætning til røde lamper som kræver øjeblikkeligt stop.',
    whyRu: 'На экзамене важно отличать красный от жёлтого: жёлтая лампа — это не мгновенный «стоп», а предупреждение «электронный помощник отключён, езжайте аккуратно на СТО».',
    lookDa: 'Gult/orange symbol: bogstaverne "ABS", bil på slingrespor (ESP) eller et lille motorsymbol (Check Engine).',
    lookRu: 'Жёлтый или оранжевый значок: кружок «ABS», машинка со змейкой «ESP» или силуэт двигателя.',
    checkDa: 'Ved tændt gul ABS/ESP virker selve bremsepedalen stadig, men hjulene kan låse og skride ved hård opbremsning — kør ekstra forsigtigt og få bilen på værksted.',
    checkRu: 'Обычные тормоза продолжают работать, но антиблокировка (ABS) или антизанос (ESP) отключены! Езжайте спокойнее с запасом дистанции прямиком в сервис.',
    okDa: 'Alle gule advarselslamper slukker kort efter start og lyser ikke under kørslen.',
    okRu: 'Все жёлтые иконки погасли через пару секунд после запуска мотора.',
    failDa: 'Lyser gult konstant under kørsel — må ikke ignoreres i ugevis, men kræver værkstedsbesøg med ekstra forsigtig kørsel.',
    failRu: 'Постоянно горит жёлтым на ходу: на скользкой дороге при резком торможении без ABS колёса пойдут юзом — пора на СТО.',
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
  { id: 'kabine', da: '0. Kabine & Pedaler', ru: '0. Салон и педали' },
  { id: 'motorrum', da: '1. Motorrum', ru: '1. Под капотом' },
  { id: 'daek_bremser', da: '2. Dæk & Bremser', ru: '2. Шины и тормоза' },
  { id: 'lygter', da: '3. Lygter & Horn', ru: '3. Фары и сигналы' },
  { id: 'instrumentpanel', da: '4. Instrumentpanel', ru: '4. Приборная панель' },
];

export const CarTechnicalSVG: React.FC<CarTechnicalSVGProps> = ({
  initialTab = 'motorrum',
  activeHotspot,
  languageMode = 'both',
  compact = false,
  lockedTab = false,
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
  const activeTabInfo = TABS.find((t) => t.id === tab);

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
            <path d="M 18 14 Q 220 4 422 14 L 422 132 Q 220 120 18 132 Z" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
            <rect x="34" y="132" width="372" height="80" rx="10" fill="#111827" stroke="#27272A" strokeWidth="1.4" />

            <circle cx="52" cy="84" r="16" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
            <text x="52" y="64" textAnchor="middle" fill="#FACC15" fontSize="7.5" fontWeight="800">
              LYS (0 / Auto / Nær)
            </text>

            <rect x="76" y="76" width="46" height="8" rx="4" fill="#475569" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="180" y="76" width="46" height="8" rx="4" fill="#475569" stroke="#CBD5E1" strokeWidth="1" />

            <circle cx="151" cy="84" r="40" fill="none" stroke="#334155" strokeWidth="10" />
            <circle cx="151" cy="84" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <text x="151" y="34" textAnchor="middle" fill="#CBD5E1" fontSize="8" fontWeight="800">
              RAT &amp; SPEJLE
            </text>

            <rect x="260" y="40" width="94" height="80" rx="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <rect x="292" y="54" width="30" height="24" rx="5" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
            <polygon points="307,59 316,74 298,74" fill="none" stroke="#FCA5A5" strokeWidth="2" />
            <text x="307" y="92" textAnchor="middle" fill="#FCA5A5" fontSize="7.5" fontWeight="800">
              HAVARIBLINK
            </text>

            <rect x="24" y="160" width="76" height="36" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M 38 178 L 58 178 L 54 170" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <text x="62" y="190" textAnchor="middle" fill="#FDE68A" fontSize="7" fontWeight="800">
              MOTORHJELM
            </text>

            <g transform="translate(124, 146)">
              <rect x="0" y="0" width="160" height="58" rx="10" fill="#09090B" stroke="#334155" strokeWidth="1.5" />
              <rect x="14" y="10" width="32" height="32" rx="6" fill="#0284C7" opacity="0.8" stroke="#BAE6FD" strokeWidth="1.5" />
              <text x="30" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">K</text>
              <text x="30" y="52" textAnchor="middle" fill="#7DD3FC" fontSize="6.5" fontWeight="700">Kobling</text>
              <rect x="64" y="10" width="34" height="32" rx="6" fill="#DC2626" opacity="0.85" stroke="#FECACA" strokeWidth="1.5" />
              <text x="81" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">B</text>
              <text x="81" y="52" textAnchor="middle" fill="#FCA5A5" fontSize="6.5" fontWeight="700">Bremse</text>
              <rect x="116" y="6" width="28" height="38" rx="6" fill="#10B981" opacity="0.8" stroke="#A7F3D0" strokeWidth="1.5" />
              <text x="130" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">S</text>
              <text x="130" y="52" textAnchor="middle" fill="#6EE7B7" fontSize="6.5" fontWeight="700">Speeder</text>
            </g>

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
      {/* Header or 5 Beginner-to-Pro Tabs */}
      {lockedTab ? (
        !compact &&
        activeTabInfo && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {languageMode === 'da_only'
                ? `Interaktiv oversigt: ${activeTabInfo.da}`
                : `Интерактивная схема: ${activeTabInfo.ru}`}
            </span>
            {languageMode !== 'da_only' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                DA: {activeTabInfo.da}
              </span>
            )}
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTab(t.id)}
                className={`min-w-0 break-words rounded-xl border px-2.5 py-2 text-left text-xs transition-all ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold leading-tight">
                  {languageMode === 'da_only' || languageMode === 'spoiler' ? t.da : t.ru}
                </div>
                {languageMode === 'both' && (
                  <div
                    className={`mt-0.5 text-[11px] leading-tight ${
                      isActive ? 'text-teal-200 dark:text-teal-700' : 'text-teal-800/80 dark:text-teal-300/80'
                    }`}
                  >
                    {t.da}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

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
                  ? 'border-teal-500 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-200'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {languageMode === 'da_only' || languageMode === 'spoiler' ? item.labelDa : item.labelRu}
            </button>
          );
        })}
      </div>

      {/* Selected hotspot specification card (hidden when compact=true in exams) */}
      {!compact && currentInfo && (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/90 p-3.5 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/75">
          {/* Header + DDO + Speak */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <TheoryBilingual
                ru={currentInfo.labelRu}
                da={currentInfo.labelDa}
                mode={languageMode}
                ruClassName="text-sm sm:text-base font-bold leading-snug"
                compact
              />
              {labelLookupWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
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
              text={`${currentInfo.labelDa}. ${currentInfo.whyDa} ${currentInfo.checkDa}`}
            />
          </div>

          {/* 1. Why is this needed? */}
          <div className="rounded-lg border border-teal-200/75 bg-teal-50/60 px-3 py-2.5 dark:border-teal-900/50 dark:bg-teal-950/25">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{languageMode === 'da_only' ? 'Hvorfor tjekker man det?' : 'Зачем это проверять?'}</span>
            </div>
            <TheoryBilingual
              ru={currentInfo.whyRu}
              da={currentInfo.whyDa}
              mode={languageMode}
              compact
              ruClassName="text-xs sm:text-[13px] leading-relaxed"
            />
          </div>

          {/* 2. Where / How to spot it */}
          <div className="rounded-lg border border-sky-200/70 bg-sky-50/55 px-3 py-2.5 dark:border-sky-900/50 dark:bg-sky-950/25">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>{languageMode === 'da_only' ? 'Sådan finder du den' : 'Как узнать на глаз'}</span>
            </div>
            <TheoryBilingual
              ru={currentInfo.lookRu}
              da={currentInfo.lookDa}
              mode={languageMode}
              compact
              ruClassName="text-xs sm:text-[13px] leading-relaxed"
            />
          </div>

          {/* 3. How to test it */}
          <div className="rounded-lg border border-zinc-200/80 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              <Wrench className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>{languageMode === 'da_only' ? 'Kontrol på prøven' : 'Как проверить руками'}</span>
            </div>
            <TheoryBilingual
              ru={currentInfo.checkRu}
              da={currentInfo.checkDa}
              mode={languageMode}
              compact
              ruClassName="text-xs sm:text-[13px] leading-relaxed"
            />
          </div>

          {/* 4. Norm vs Error */}
          {(currentInfo.okRu || currentInfo.failRu) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {currentInfo.okRu && (
                <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/25">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{languageMode === 'da_only' ? 'Normalt' : 'Норма'}</span>
                  </div>
                  <TheoryBilingual
                    ru={currentInfo.okRu}
                    da={currentInfo.okDa}
                    mode={languageMode}
                    compact
                    ruClassName="text-xs leading-snug text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              )}
              {currentInfo.failRu && (
                <div className="rounded-lg border border-rose-200/80 bg-rose-50/70 px-3 py-2 dark:border-rose-900/50 dark:bg-rose-950/25">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{languageMode === 'da_only' ? 'Fejl / Ikke tilladt' : 'Ошибка / Поломка'}</span>
                  </div>
                  <TheoryBilingual
                    ru={currentInfo.failRu}
                    da={currentInfo.failDa}
                    mode={languageMode}
                    compact
                    ruClassName="text-xs leading-snug text-rose-950 dark:text-rose-100"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
