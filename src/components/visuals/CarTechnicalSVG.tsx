import React, { useEffect, useId, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  GraduationCap,
  HelpCircle,
  Wrench,
} from 'lucide-react';
import { CAR_HOTSPOTS_UK, CAR_TABS_UK } from '../../data/uk/visualsUk';
import { useUiLang } from '../../i18n/UiLangContext';
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
  examDa: string;
  examRu: string;
}

const HOTSPOTS: HotspotInfo[] = [
  // 0. Kabine & Pedaler (Beginner zero-to-one)
  {
    id: 'pedaler',
    tab: 'kabine',
    labelDa: 'Pedaler: Kobling · Bremse · Speeder',
    labelRu: 'Педали: Сцепление · Тормоз · Газ',
    whyDa: 'Det er helt afgørende, at dine fødder finder den rigtige pedal i blinde — især i en nødsituation, hvor du aldrig må forveksle bremse og speeder.',
    whyRu: 'Крайне важно, чтобы ноги находили нужную педаль вслепую — особенно в экстренной ситуации, где ни в коем случае нельзя перепутать тормоз и газ.',
    lookDa: 'Fra venstre mod højre på manuelt gear: K (Kobling) helt til venstre, B (Bremse) i midten, S (Speeder) til højre. På automatgear (P-R-N-D) mangler K.',
    lookRu: 'Слева направо на механике: K (сцепление) крайняя слева, B (тормоз) посередине, S (газ) справа. На автомате (P-R-N-D) педаль K отсутствует.',
    checkDa: 'Ved manuelt gear styrer venstre fod KUN koblingen; højre fod skifter mellem bremse og speeder. På automatgear hviler venstre fod altid roligt på fodhvileren til venstre.',
    checkRu: 'На механике левая нога управляет ТОЛЬКО сцеплением; правая нога переключается между тормозом и газом. На автомате левая нога всегда спокойно отдыхает на подставке слева.',
    okDa: 'Hver fod har sine faste pedaler, og du sidder, så kobling eller bremse nemt kan trædes i bund.',
    okRu: 'У каждой ноги свои педали, и вы сидите так, чтобы сцепление или тормоз можно было легко выжать до пола.',
    failDa: 'At bremse med venstre fod i en bil med automatgear — man hugger næsten altid bremsen alt for hårdt i bund!',
    failRu: 'Тормозить левой ногой на машине с автоматом — педаль тормоза почти всегда выжимается слишком резко в пол!',
    examDa: 'Ved manuelt gear styrer venstre fod koblingen, og højre fod bremse og speeder. På automatgear bruger jeg kun højre fod.',
    examRu: '«На механике левая нога управляет сцеплением, а правая — тормозом и газом. На автомате я пользуюсь только правой ногой.»',
  },
  {
    id: 'motorhjelm',
    tab: 'kabine',
    labelDa: 'Motorhjelm (Åbning i 3 trin)',
    labelRu: 'Капот (открытие в 3 шага)',
    whyDa: 'Både før køreturen og til den mundtlige kontrolprøve skal du selv kunne åbne motorhjelmen uden at famle, så du kan tjekke væsker.',
    whyRu: 'И перед поездкой, и на устной контрольной проверке (kontrolprøve) вы должны сами уметь без заминок открыть капот, чтобы проверить жидкости.',
    lookDa: 'Indvendigt udløsergreb sidder nede ved venstre fod (ofte med et bilikon med åben hjelm). Ude foran sidder en lille sikkerhedskrog midt under forkanten.',
    lookRu: 'Внутренний рычаг открытия находится внизу у левой ноги (часто со значком машины с открытым капотом). Снаружи спереди по центру под кромкой расположен небольшой страховочный крючок.',
    checkDa: '1) Træk i grebet ved venstre fod (klikkelyd) · 2) Skub sikkerhedslåsen til side/op under midten af hjelmen · 3) Løft hjelmen og sæt støttepinden i hak.',
    checkRu: '1) Потяните рычаг у левой ноги (щелчок) · 2) Сдвиньте страховочный фиксатор вбок/вверх по центру под капотом · 3) Поднимите капот и вставьте упорную штангу в паз.',
    okDa: 'Hjelmen står sikkert på støttepinden (eller gasdæmperne) og klikker fast i begge låse, når den lukkes igen.',
    okRu: 'Капот надёжно держится на упорной штанге (или газовых упорах) и при закрытии защёлкивается в обоих замках.',
    failDa: 'At glemme den skjulte sikkerhedskrog ude foran eller køre af sted uden at hjelmen er klikket helt i lås.',
    failRu: 'Забыть о скрытом страховочном крючке спереди или поехать, не убедившись, что капот полностью защёлкнулся.',
    examDa: 'Jeg trækker i udløsergrebet ved venstre fod, udløser sikkerhedslåsen under forkanten og sætter støttepinden fast.',
    examRu: '«Я тяну рычаг открытия у левой ноги, отвожу страховочный фиксатор под передней кромкой и закрепляю упорную штангу.»',
  },
  {
    id: 'lyskontakt',
    tab: 'kabine',
    labelDa: 'Lyskontakt & Blinklysarm (Venstre)',
    labelRu: 'Переключатель света и рычаг поворотников (слева)',
    whyDa: 'Automatiske kørelys (DRL) tænder ofte kun forlygterne om dagen — i regn, tåge eller tunnel kan din bil være helt mørk bagtil, hvis du ikke drejer lyskontakten selv.',
    whyRu: 'Автоматические дневные ходовые огни (DRL) днём часто включают только передние фары — в дождь, туман или туннель машина сзади может оставаться полностью тёмной, если вы не повернёте переключатель света сами.',
    lookDa: 'Venstre arm bag rattet styrer blinklys og fjernlys. Lyskontakten sidder enten til venstre på instrumentbrættet eller som drejering på venstre arm.',
    lookRu: 'Левый рычаг за рулём управляет поворотниками и дальним светом. Переключатель света находится либо слева на приборной панели, либо в виде поворотного кольца на левом рычаге.',
    checkDa: 'Blink op = højre, ned = venstre; skub armen frem = fjernlys (blå lampe!). Drej lyskontakten til nærlys (grøn lampe) i regn, skumring og tunnel.',
    checkRu: 'Поворотник вверх = направо, вниз = налево; толкнуть рычаг вперёд = дальний свет (синяя лампа!). Поверните переключатель света на ближний (зелёная лампа) в дождь, сумерки и туннель.',
    okDa: 'Grøn nærlyslampe lyser i regn/mørke, og blå lampe tænder kun, når fjernlyset er aktiveret uden blænding af andre.',
    okRu: 'В дождь или темноту горит зелёная лампа ближнего света, а синяя лампа включается только при активном дальнем свете без ослепления других.',
    failDa: 'At stole blindt på «Auto» i regn/tåge, så baglygterne er helt slukkede og biler bagfra ser dig for sent.',
    failRu: 'Слепо полагаться на «Auto» в дождь или туман: задние фонари полностью выключены, и едущие сзади машины замечают вас слишком поздно.',
    examDa: 'I mørke, regn og tåge drejer jeg lyskontakten manuelt til nærlys, så både for- og baglygter er tændt.',
    examRu: '«В темноте, в дождь и туман я вручную поворачиваю переключатель на ближний свет, чтобы горели и передние, и задние фары.»',
  },
  {
    id: 'visker_havari',
    tab: 'kabine',
    labelDa: 'Vinduesvisker, Sprinkler & Havariblink',
    labelRu: 'Стеклоочистители, омыватель и аварийка',
    whyDa: 'Rent udsyn gennem forruden og hurtig advarsel med havariblink ved pludselig kø eller motorstop forebygger påkørsler på få sekunder.',
    whyRu: 'Чистый обзор через лобовое стекло и быстрое предупреждение аварийной сигнализацией при внезапном заторе или поломке двигателя предотвращают столкновения за считанные секунды.',
    lookDa: 'Højre arm bag rattet viser ikoner af en forrude med visker. Midt på konsollen sidder en stor rød knap med trekantsymbol (havariblink).',
    lookRu: 'Правый рычаг за рулём отмечен значками лобового стекла со щёткой. По центру консоли расположена большая красная кнопка с символом треугольника (аварийная сигнализация — havariblink).',
    checkDa: 'Højre arm op/ned = viskerhastighed; træk armen ind mod dig selv = sprøjt sprinklervæske på ruden. Tryk på rød trekant ved motorstop eller brat kø på motorvej.',
    checkRu: 'Правый рычаг вверх/вниз = скорость дворников; потянуть рычаг на себя = подать омывающую жидкость на стекло. Нажмите красный треугольник при поломке двигателя или резком заторе на автомагистрали.',
    okDa: 'Viskerne tørrer ruden helt ren uden striber, og alle 6 blinklys blinker samtidig ved tryk på havariknappen.',
    okRu: 'Дворники вытирают стекло начисто без разводов, а при нажатии кнопки аварийки все 6 поворотников мигают одновременно.',
    failDa: 'Slidte viskerblade, der smører snavs ud i blinde striber, eller tom sprinklerbeholder midt i salt og sjap.',
    failRu: 'Изношенные щётки стеклоочистителя, размазывающие грязь слепыми полосами, или пустой бачок омывателя посреди дорожной соли и слякоти.',
    examDa: 'Højre stilk styrer visker og sprinkler for klart udsyn, og den røde trekant tænder alle 6 havariblink ved uheld eller pludselig fare.',
    examRu: '«Правый рычаг управляет дворниками и омывателем для чистого обзора, а красный треугольник включает все 6 фонарей аварийки при ДТП или внезапной опасности.»',
  },
  {
    id: 'saede_spejle',
    tab: 'kabine',
    labelDa: 'Sæde, Nakkestøtte & 3 Spejle',
    labelRu: 'Сиденье, подголовник и 3 зеркала',
    whyDa: 'Sidder du for langt væk, når du ikke bremsepedalen i bund ved panikstop; sidder du skævt eller med for lav nakkestøtte, øges risikoen for piskesmæld markant.',
    whyRu: 'Если сидеть слишком далеко, при экстренной остановке не выжать педаль тормоза в пол; если сидеть перекошенно или со слишком низким подголовником, риск хлыстовой травмы шеи резко возрастает.',
    lookDa: 'Bøjle under sædets forkant flytter det frem/tilbage; greb/hjul på siden justerer ryglæn og højde. Spejlknap sidder ofte på førerdøren (L / R).',
    lookRu: 'Скоба под передним краем сиденья двигает его вперёд/назад; рычаг/колёсико сбоку регулирует спинку и высоту. Переключатель зеркал (L / R) часто расположен на водительской двери.',
    checkDa: 'Træd kobling (eller bremse på automatgear) i bund med let bøjet knæ, håndled når rattets top, nakkestøttens overkant i højde med issen, og blot ~1–2 cm af egen bil i sidespejlene.',
    checkRu: 'Выжмите сцепление (или тормоз на автомате) до пола со слегка согнутым коленом, запястья касаются верха руля, верхний край подголовника на уровне макушки, а в боковых зеркалах видно лишь ~1–2 см своего автомобиля.',
    okDa: 'Let bøjet knæ ved fuldt pedaltryk, frit udsyn bagud i bakspejlet og minimale blinde vinkler i sidespejlene.',
    okRu: 'Слегка согнутое колено при полном выжиме педали, свободный обзор назад в салонное зеркало и минимальные слепые зоны в боковых зеркалах.',
    failDa: 'Strakt ben ved bremsning, nakkestøtte nede i nakken eller sidespejle rettet så langt ind, at halvdelen viser din egen bildør.',
    failRu: 'Выпрямленная нога при торможении, подголовник опущен на уровень шеи или боковые зеркала повёрнуты настолько внутрь, что половина показывает собственную дверь.',
    examDa: 'Jeg indstiller sædet med let bøjet knæ ved fuldt pedaltryk, nakkestøtten i højde med hovedets top og spejlene med frit udsyn bagud.',
    examRu: '«Я настраиваю сиденье со слегка согнутым коленом при полном выжиме педали, подголовник на уровне верха головы, а зеркала — со свободным обзором назад.»',
  },

  // 1. Motorrum (over real engine bay photo)
  {
    id: 'koelervaeske',
    tab: 'motorrum',
    labelDa: 'Kølervæske (Ekspansionsbeholder)',
    labelRu: 'Охлаждающая жидкость (расширительный бачок)',
    whyDa: 'Kølervæsken forhindrer motoren i at overophede og koge over (eller fryse til is om vinteren). Uden kølervæske ødelægges topstykket hurtigt.',
    whyRu: 'Охлаждающая жидкость не даёт двигателю перегреться и закипеть (или замёрзнуть в лёд зимой). Без антифриза головка блока цилиндров быстро разрушается.',
    lookDa: 'Gennemsigtig rund plastikbeholder med LYSRØD væske og blåt/sort tryklåg øverst til venstre under hjelmen.',
    lookRu: 'Прозрачный круглый пластиковый бачок со СВЕТЛО-РОЗОВОЙ жидкостью и синей/чёрной крышкой под давлением вверху слева под капотом.',
    checkDa: 'Standen skal ligge mellem MIN og MAX på beholderens side. Åbn ALDRIG låget, mens motoren er varm — overtryk kan sprøjte kogende væske ud!',
    checkRu: 'Уровень должен находиться между MIN и MAX на стенке бачка. НИКОГДА не открывайте крышку, пока двигатель горячий — избыточное давление может выплеснуть кипящую жидкость!',
    okDa: 'Lyserød/klar væske mellem MIN og MAX på kold motor, ingen lækager eller rustfarvet snavs.',
    okRu: 'Светло-розовая/прозрачная жидкость между MIN и MAX на холодном двигателе, без подтёков и ржавой грязи.',
    failDa: 'Væskestanden er under MIN, beholderen er helt tom, eller du forsøger at skrue låget af på varm motor.',
    failRu: 'Уровень жидкости ниже MIN, бачок полностью пуст или вы пытаетесь открутить крышку на горячем двигателе.',
    examDa: 'Væskestanden aflæses udvendigt mellem MIN og MAX. Jeg åbner aldrig låget på varm motor pga. skoldningsfare.',
    examRu: '«Уровень проверяется снаружи между MIN и MAX. Я никогда не открываю крышку на горячем двигателе из-за опасности ожога.»',
  },
  {
    id: 'sprinklervaeske',
    tab: 'motorrum',
    labelDa: 'Sprinklervæske (Blåt låg)',
    labelRu: 'Омывающая жидкость (синяя крышка)',
    whyDa: 'På våde og saltede danske veje bliver forruden uigennemsigtig på få sekunder efter en modkørende lastbil. Sprinklervæske er lovpligtig for klart udsyn.',
    whyRu: 'На мокрых и посыпанных солью датских дорогах лобовое стекло становится непрозрачным за несколько секунд после встречного грузовика. Омывающая жидкость обязательна по закону для чистого обзора.',
    lookDa: 'Lille BLÅT flip-låg helt fremme til venstre ved forlygten — markeret med et symbol af en forrude med vandstråle.',
    lookRu: 'Маленькая СИНЯЯ откидная крышка впереди слева у фары — со значком лобового стекла и струи воды.',
    checkDa: 'Åbn det blå låg og tjek, at der er rigeligt væske i beholderen (brug frostsikret væske ned til mindst −20 °C om vinteren).',
    checkRu: 'Откройте синюю крышку и проверьте, чтобы в бачке было достаточно жидкости (зимой используйте незамерзающую жидкость минимум до −20 °C).',
    okDa: 'Fyldt beholder med frostsikret væske og kraftig stråle ud på både for- og bagrude.',
    okRu: 'Заполненный бачок с незамерзающей жидкостью и сильная струя на лобовое и заднее стекло.',
    failDa: 'Tom beholder eller almindeligt postevand om vinteren, der fryser til is i dyser og slanger.',
    failRu: 'Пустой бачок или обычная водопроводная вода зимой, которая замерзает в форсунках и трубках.',
    examDa: 'Jeg kontrollerer, at der er tilstrækkelig frostsikret sprinklervæske i beholderen med blåt låg, og at sprinkleren sprøjter på ruden.',
    examRu: '«Я проверяю, чтобы в бачке с синей крышкой было достаточно морозостойкой омывающей жидкости и чтобы омыватель брызгал на стекло.»',
  },
  {
    id: 'motorolie',
    tab: 'motorrum',
    labelDa: 'Motorolie & Oliepind',
    labelRu: 'Моторное масло и масляный щуп',
    whyDa: 'Olien smører motorens metaldele, der bevæger sig tusindvis af gange i minuttet. For lidt olie giver massiv friktion og ødelægger motoren permanent.',
    whyRu: 'Масло смазывает металлические детали двигателя, которые движутся тысячи раз в минуту. Недостаток масла создаёт огромное трение и необратимо выводит двигатель из строя.',
    lookDa: 'OLIEPIND: den lille GULE (eller orange) løkke foran på motoren. Lige ved siden af sidder det sorte påfyldningsdæksel med oliekande-symbol.',
    lookRu: 'ЩУП (OLIEPIND): маленькая ЖЁЛТАЯ (или оранжевая) петля спереди на двигателе. Прямо рядом расположена чёрная крышка заливной горловины со значком маслёнки.',
    checkDa: 'Bilen skal stå plant med slukket motor (vent 5 min.). Træk pinden op, tør den ren med papir, sæt den helt ned igen, træk op og kontroller, at olien ligger mellem MIN og MAX.',
    checkRu: 'Автомобиль должен стоять ровно с заглушенным двигателем (подождите 5 мин.). Выньте щуп, протрите его начисто бумагой, вставьте до упора обратно, выньте и проверьте, чтобы масло было между MIN и MAX.',
    okDa: 'Oliemærket på spidsen af oliepinden ligger mellem MIN og MAX (helst tæt på MAX).',
    okRu: 'След масла на кончике щупа находится между MIN и MAX (желательно ближе к MAX).',
    failDa: 'Olien er under MIN (skal efterfyldes før kørsel) eller aflæst mens motoren kører eller bilen holder skævt.',
    failRu: 'Уровень масла ниже MIN (нужно долить перед поездкой) либо проверка проведена на работающем двигателе или под наклоном.',
    examDa: 'Bilen skal stå plant med slukket motor: jeg trækker oliepinden op, tørrer den af, sætter den helt i igen og kontrollerer, at olien ligger mellem MIN og MAX.',
    examRu: '«Автомобиль должен стоять ровно с заглушенным двигателем: я вынимаю щуп, протираю его, вставляю полностью обратно и проверяю, чтобы уровень масла был между MIN и MAX.»',
  },
  {
    id: 'bremsevaeske',
    tab: 'motorrum',
    labelDa: 'Bremsevæskebeholder',
    labelRu: 'Бачок тормозной жидкости',
    whyDa: 'Når du træder på bremsepedalen, er det denne væske i rørene, der presser bremseklodserne mod hjulene. Falder væsken pludseligt, kan bremserne svigte helt.',
    whyRu: 'Когда вы нажимаете педаль тормоза, именно эта жидкость в трубках прижимает тормозные колодки к колёсам. Если уровень жидкости резко падает, тормоза могут полностью отказать.',
    lookDa: 'Lille firkantet lys beholder bagerst under forruden (til højre mellem motoren og batteriet) med bremse-symbol på låget.',
    lookRu: 'Небольшой квадратный светлый бачок в глубине под лобовым стеклом (справа между двигателем и аккумулятором) со знаком тормозов на крышке.',
    checkDa: 'Aflæs standen udefra gennem den lyse plastikvæg mellem MIN og MAX (skru ikke låget af!). Pludseligt væsketab = utæthed!',
    checkRu: 'Считывайте уровень снаружи через светлую пластиковую стенку между MIN и MAX (крышку не откручивайте!). Внезапная потеря жидкости = утечка!',
    okDa: 'Klar gullig væske mellem MIN og MAX, og den falder ikke hurtigt mellem kontrollerne.',
    okRu: 'Прозрачная желтоватая жидкость между MIN и MAX, и её уровень не падает быстро между проверками.',
    failDa: 'Under MIN eller hurtigt faldende stand = alvorlig utæthed i bremsesystemet — kør IKKE videre!',
    failRu: 'Уровень ниже MIN или быстро снижается = серьёзная утечка в тормозной системе — ехать дальше НЕЛЬЗЯ!',
    examDa: 'Standen skal ligge mellem MIN og MAX uden at falde hurtigt — falder den under MIN, kan systemet være utæt.',
    examRu: '«Уровень должен быть между MIN и MAX и не снижаться быстро — если он падает ниже MIN, в системе может быть утечка.»',
  },
  {
    id: 'batteri',
    tab: 'motorrum',
    labelDa: '12V Batteri (Startbatteri)',
    labelRu: 'Аккумулятор 12V (стартерная батарея)',
    whyDa: '12V-batteriet leverer strøm til at starte motoren og driver lys, blinklys og advarselssystemer. Et løst batteri kan kortslutte ved hård opbremsning.',
    whyRu: 'Аккумулятор 12V подаёт ток для запуска двигателя и питает свет, поворотники и системы предупреждения. Незакреплённый аккумулятор может замкнуть при резком торможении.',
    lookDa: 'Sort firkantet kasse til højre under hjelmen med to tykke kabler (+ rød kappe og − sort).',
    lookRu: 'Чёрный прямоугольный корпус справа под капотом с двумя толстыми кабелями (+ с красным колпачком и − чёрный).',
    checkDa: 'Tag fat i batterikassen (skal sidde urokkeligt fast spændt) og kontroller, at polskoene sidder stramt uden hvidt/grønt ir.',
    checkRu: 'Возьмитесь за корпус батареи (должен быть закреплён неподвижно) и проверьте, чтобы клеммные наконечники сидели плотно без белого/зелёного налёта окисления.',
    okDa: 'Batteriet sidder helt fast, kablerne er stramme og rene, og rød batterilampe slukker efter motorstart.',
    okRu: 'Аккумулятор сидит совершенно неподвижно, кабели затянуты и чисты, а красная лампа батареи гаснет после запуска двигателя.',
    failDa: 'Løst batteri, irrede/løse polsko eller tændt rød batterilampe under kørsel (generatoren lader ikke).',
    failRu: 'Незакреплённый аккумулятор, окисленные/ослабленные клеммы или горящая во время движения красная лампа батареи (генератор не заряжает).',
    examDa: 'Jeg tjekker, at batteriet er spændt sikkert fast, og at kabelskoene sidder stramt og rent på polerne.',
    examRu: '«Я проверяю, чтобы аккумулятор был надёжно закреплён, а клеммы плотно и чисто сидели на полюсах.»',
  },

  // 2. Dæk, Bremser & Styretøj
  {
    id: 'daek',
    tab: 'daek_bremser',
    labelDa: 'Dækmønster (min. 1,6 mm & TWI)',
    labelRu: 'Рисунок протектора (мин. 1,6 мм и TWI)',
    whyDa: 'Rillerne i dækket leder vand, sjap og regn væk under hjulet. Er dækket slidt ned under 1,6 mm, mister bilen vejgrebet (akvaplaning) og bremselængden eksploderer.',
    whyRu: 'Канавки шины отводят воду, слякоть и дождь из-под колеса. Если шина изношена ниже 1,6 мм, машина теряет сцепление с дорогой (аквапланирование), а тормозной путь резко увеличивается.',
    lookDa: 'Kig ned i dækkets dybe langsgående riller efter de små forhøjede gummiklodser (1,6 mm TWI) — på dæksiden står ofte "TWI" eller en lille trekant ud for dem.',
    lookRu: 'Загляните в глубокие продольные канавки шины, чтобы найти небольшие выступающие резиновые перемычки (1,6 мм TWI) — на боковине напротив них часто есть надпись «TWI» или маленький треугольник.',
    checkDa: 'Mindst 1,6 mm i alle hovedriller (må ikke være slidt i plan med TWI-klodsen!). Alle 4 dæk skal være af samme type; i sne/is er sommerdæk forbudt fra 01.07.2025 — brug min. M+S eller 3PMSF-vinterdæk.',
    checkRu: 'Минимум 1,6 мм во всех основных канавках (шина не должна быть изношена вровень с перемычкой TWI!). Все 4 шины должны быть одного типа; на снегу/льду с 01.07.2025 летние шины запрещены — используйте минимум M+S или зимние шины 3PMSF.',
    okDa: 'Klart dybere mønster end TWI-mærkerne (gerne ≥ 3 mm om vinteren), ens dæktype på alle 4 hjul og korrekt lufttryk.',
    okRu: 'Протектор заметно глубже меток TWI (желательно ≥ 3 мм зимой), одинаковый тип шин на всех 4 колёсах и правильное давление воздуха.',
    failDa: 'Gummiklodsen TWI flugter med dækkets overflade (< 1,6 mm), bule/revne i dæksiden eller sommerdæk på én aksel og vinterdæk på den anden.',
    failRu: 'Резиновая перемычка TWI сравнялась с поверхностью шины (< 1,6 мм), шишка/трещина на боковине либо летние шины на одной оси и зимние на другой.',
    examDa: 'Alle 4 dæk skal have mindst 1,6 mm mønster i hovedrillerne (over TWI-mærkerne), samme dæktype hele vejen rundt og ingen skader (vinterføre: min. M+S / 3PMSF).',
    examRu: '«На всех 4 шинах должно быть не менее 1,6 мм протектора в основных канавках (выше меток TWI), один тип шин по кругу и никаких повреждений (в зимних условиях: мин. M+S / 3PMSF).»',
  },
  {
    id: 'bremser',
    tab: 'daek_bremser',
    labelDa: 'Driftsbremse & Vakuumforstærker',
    labelRu: 'Рабочий тормоз и вакуумный усилитель',
    whyDa: 'En tung bil kræver vakuumforstærker, som hjælper din fod med at bremse let (virker kun når motoren er tændt). Testen beviser både, at hjælperen virker, og at bremsesystemet ikke lækker væske.',
    whyRu: 'Тяжёлому автомобилю нужен вакуумный усилитель, который помогает ноге тормозить легко (он работает только при включённом двигателе). Этот тест доказывает и то, что усилитель работает, и то, что тормозная система не теряет жидкость.',
    lookDa: 'Den midterste (på automatgear venstre) brede pedal ved dine fødder.',
    lookRu: 'Средняя (на автомате — левая) широкая педаль у ваших ног.',
    checkDa: '1) Med slukket motor: pump bremsen 3–4 gange til den bliver hård. 2) Hold foden på pedalen med helt almindeligt fast tryk (som ved et rødt lys — IKKE alt hvad du kan!) og start motoren. 3) Bliv stående på pedalen i ca. 10 sek.',
    checkRu: '1) При заглушенном моторе: нажмите педаль тормоза 3–4 раза, пока она не станет твёрдой. 2) Удерживайте педаль с обычным уверенным усилием (как на красном светофоре — НЕ со всей силы!) и заведите мотор. 3) Оставайтесь ногой на педали около 10 сек.',
    okDa: 'Pedalen synker en smule blødt ved motorstart (forstærkeren tager over) og står derefter klippefast på samme niveau i alle 10 sek.',
    okRu: 'Педаль мягко и немного опускается при запуске двигателя (усилитель включается в работу), а затем неподвижно остаётся на том же уровне все 10 сек.',
    failDa: 'Pedalen forbliver stenhård ved motorstart (forstærker defekt) ELLER bliver ved med at synke langsomt mod gulvet (utæthed/lækage — kør IKKE!).',
    failRu: 'Педаль остаётся каменной при запуске двигателя (усилитель неисправен) ИЛИ продолжает медленно проседать к полу (утечка — НЕ ехать!).',
    examDa: 'Jeg pumper pedalen hård med slukket motor, holder et fast tryk og starter motoren: pedalen skal synke lidt (vakuumforstærkeren virker) og derefter ikke synke videre i ca. 10 sekunder (systemet er tæt).',
    examRu: '«Я накачиваю педаль до твёрдости при заглушенном моторе, удерживаю уверенное нажатие и завожу двигатель: педаль должна немного опуститься (вакуумный усилитель работает), а затем около 10 секунд не уходить ниже (система герметична).»',
  },
  {
    id: 'haandbremse',
    tab: 'daek_bremser',
    labelDa: 'Parkeringsbremse (Håndbremse)',
    labelRu: 'Стояночный тормоз (ручник)',
    whyDa: 'Håndbremsen holder bilen låst på bakker, så den ikke triller ind i andre biler eller fodgængere, og virker mekanisk uafhængigt af fodbremsevæsken.',
    whyRu: 'Ручник удерживает автомобиль на уклонах, чтобы он не скатился в другие машины или пешеходов, и действует механически независимо от жидкости ножного тормоза.',
    lookDa: 'Enten et klassisk håndtag mellem forsæderne eller en lille knap med "(P)" symbol i midterkonsollen.',
    lookRu: 'Либо классический рычаг между передними сиденьями, либо маленькая кнопка со значком `(P)` на центральной консоли.',
    checkDa: 'Træk håndbremsen (eller aktiver P-knappen), sæt i frigear/N og mærk på en svag skråning eller ved let igangsætning, at bilen står helt fast.',
    checkRu: 'Затяните ручник (или активируйте кнопку P), поставьте нейтраль/N и на лёгком уклоне или при лёгкой попытке тронуться убедитесь, что машина стоит совершенно неподвижно.',
    okDa: 'Bilen står helt stille på hældning uden at rulle, og den røde P-lampe slukker straks, når håndbremsen løsnes helt.',
    okRu: 'Автомобиль полностью неподвижно стоит на уклоне и не катится, а красная лампа P сразу гаснет, когда ручник полностью отпущен.',
    failDa: 'Håndtaget skal helt op i loftet før det bider, bilen ruller, eller håndbremsen hænger og lyser rødt under kørsel.',
    failRu: 'Рычаг приходится поднимать до самого верха, прежде чем он схватывает, машина катится или ручник подклинивает и горит красным на ходу.',
    examDa: 'Parkeringsbremsen skal kunne holde bilen sikkert på skråning, og den røde P-lampe skal slukke, når den er løsnet.',
    examRu: '«Стояночный тормоз должен надёжно удерживать автомобиль на уклоне, а красная лампа P должна гаснуть при его отпускании.»',
  },
  {
    id: 'stoddaempere',
    tab: 'daek_bremser',
    labelDa: 'Støddæmpere (4 hjørner)',
    labelRu: 'Амортизаторы (4 угла)',
    whyDa: 'Uden støddæmpere ville bilen hoppe på fjedrene efter hvert bump som en bold, så hjulene mister greb med asfalten i sving og ved opbremsning.',
    whyRu: 'Без амортизаторов автомобиль после каждой кочки прыгал бы на пружинах, как мяч, и колёса теряли бы сцепление с асфальтом в поворотах и при торможении.',
    lookDa: 'Kontrolleres udefra over hvert af bilens 4 hjørner lige over hjulkasserne (begge forskærme og bagskærme).',
    lookRu: 'Проверяются снаружи над каждым из 4 углов автомобиля прямо над колёсными арками (оба передних и оба задних крыла).',
    checkDa: 'Læg begge hænder over hjørnet af skærmen, tryk kraftigt ned én gang og slip med det samme — se hvor hurtigt bilen falder til ro.',
    checkRu: 'Положите обе руки на угол крыла, сильно надавите вниз один раз и сразу отпустите — посмотрите, как быстро машина успокоится.',
    okDa: 'Bilen rejser sig ét enkelt roligt løft og falder straks helt til ro (max ca. 1–1,5 svingning).',
    okRu: 'Автомобиль поднимается одним спокойным движением и сразу полностью успокаивается (максимум около 1–1,5 колебаний).',
    failDa: 'Bilen bliver ved med at gynge op og ned som en trampolin (2–3+ gange efter du slipper) — dæmperen er slidt op.',
    failRu: 'Автомобиль продолжает раскачиваться вверх-вниз, как на батуте (2–3 и более раза после отпускания) — амортизатор изношен.',
    examDa: 'Når jeg trykker kraftigt ned over hvert af de 4 hjørner og slipper, skal bilen rejse sig én gang og straks falde til ro uden at gynge.',
    examRu: '«Когда я сильно надавливаю на каждый из 4 углов и отпускаю, автомобиль должен подняться один раз и сразу успокоиться без раскачки.»',
  },
  {
    id: 'styretoej',
    tab: 'daek_bremser',
    labelDa: 'Styretøj & Ratslør (0 cm)',
    labelRu: 'Рулевое управление и люфт (0 см)',
    whyDa: 'Ratslør er «tom» bevægelse i rattet, hvor du drejer på rattet, uden at forhjulene flytter sig (som et løst cykelstyr). For meget slør gør bilen svær og farlig at holde lige på vejen.',
    whyRu: 'Люфт (ratslør) — это «пустой» ход руля, когда вы поворачиваете руль, а передние колёса не двигаются (как разболтавшийся велосипедный руль). Слишком большой люфт делает машину трудной и опасной для удержания прямо на дороге.',
    lookDa: 'Rul førerdørens rude helt ned, stå eventuelt lige udenfor ved døren og kig direkte ned på det forreste venstre hjul, mens du holder øverst på rattet.',
    lookRu: 'Полностью опустите стекло водительской двери, при желании встаньте снаружи прямо у двери и смотрите прямо вниз на переднее левое колесо, держась за верх руля.',
    checkDa: 'Med STARTET motor (aktiv servostyring) vipper du let rattet fra side til side. «0 cm ratslør» betyder ikke en lineal: hjulet skal bare reagere med det samme uden forsinkelse!',
    checkRu: 'При ЗАВЕДЁННОМ двигателе (активный усилитель руля) слегка покачайте руль из стороны в сторону. «0 см люфта» не требует линейки: колесо просто должно реагировать сразу без задержки!',
    okDa: 'Så snart du drejer en lille smule på rattet, begynder forhjulet øjeblikkeligt at dreje med.',
    okRu: 'Как только вы чуть поворачиваете руль, переднее колесо мгновенно начинает поворачиваться вслед за ним.',
    failDa: 'Rattet kan drejes et par centimeter frem og tilbage, mens forhjulet står helt stille (dødgang/slør — skal på værksted!).',
    failRu: 'Руль поворачивается на пару сантиметров туда-сюда, пока переднее колесо стоит совершенно неподвижно (свободный ход/люфт — нужно на СТО!).',
    examDa: 'Der må normalt ikke være ratslør: med startet motor (servostyring) skal forhjulene straks følge rattets bevægelser.',
    examRu: '«Люфта обычно быть не должно: при заведённом двигателе (усилитель руля) передние колёса должны сразу следовать за движениями руля.»',
  },

  // 3. Lygter
  {
    id: 'positionslys',
    tab: 'lygter',
    labelDa: 'Positionslys (2 hvide + 2 røde)',
    labelRu: 'Габаритные огни (2 белых + 2 красных)',
    whyDa: 'Positionslys markerer bilens bredde og position om natten, når bilen holder parkeret tæt på en uoplyst landevej — de er ikke bygget til at køre med alene.',
    whyRu: 'Габаритные огни обозначают ширину и положение автомобиля ночью, когда он припаркован вблизи неосвещённой загородной дороги — они не предназначены для езды с ними одними.',
    lookDa: 'Det svage lys i for- og baglygter, når lyskontakten stilles på de to små modstående lygteikoner.',
    lookRu: 'Слабый свет в передних и задних фарах, когда переключатель света установлен на два маленьких значка фонарей в разные стороны.',
    checkDa: 'Gå rundt om bilen: 2 hvide/gullige lys foran og 2 røde bagpå skal kunne ses tydeligt på mindst 300 m i klart mørke uden at blænde.',
    checkRu: 'Обойдите машину: 2 белых/желтоватых огня спереди и 2 красных сзади должны быть отчётливо видны минимум с 300 м в ясную темноту и не слепить.',
    okDa: 'Alle 4 hjørnelys plus nummerpladelys lyser klart og ensartet.',
    okRu: 'Все 4 угловых огня плюс подсветка номера светят ярко и равномерно.',
    failDa: 'En pære er sprunget, eller du kører rundt om natten kun med positionslys (det giver ingen sigtbarhed fremad!).',
    failRu: 'Перегорела лампа, или вы едете ночью только на габаритных огнях (это не даёт видимости вперёд!).',
    examDa: '2 hvide positionslys foran og 2 røde bagpå skal kunne ses tydeligt på mindst 300 meters afstand uden at blænde.',
    examRu: '«2 белых габаритных огня спереди и 2 красных сзади должны быть отчётливо видны на расстоянии не менее 300 метров и не ослеплять.»',
  },
  {
    id: 'naerlys',
    tab: 'lygter',
    labelDa: 'Nærlys (min. 30 m & 1% fald)',
    labelRu: 'Ближний свет (мин. 30 м и 1% уклон)',
    whyDa: 'Dit vigtigste kørelys i mørke, regn og tunnel: det oplyser vejen foran dig uden at blænde modkørende bilister og tænder samtidig baglygterne.',
    whyRu: 'Ваш основной рабочий свет в темноте, в дождь и в туннеле: он освещает дорогу впереди, не ослепляя встречных водителей, и одновременно включает задние фонари.',
    lookDa: 'Ikon på lyskontakten med nedadvendte lysstråler (grøn lampe på instrumentbrættet). Lyskeglen peger længere ud langs højre kant.',
    lookRu: 'Значок на переключателе света с лучами, направленными вниз (зелёная лампа на приборной панели). Световой пучок тянется дальше вдоль правого края.',
    checkDa: 'Skal oplyse vejen mindst 30 m frem med 1 % fald (1 cm pr. meter), lyse symmetrisk i begge forlygter og tænde baglygterne automatisk.',
    checkRu: 'Должен освещать дорогу минимум на 30 м вперёд с уклоном 1 % (1 см на метр), светить симметрично обеими передними фарами и автоматически включать задние фонари.',
    okDa: 'Begge nærlygter lyser kraftigt og ensartet med tydelig skarp lysgrænse, og baglygterne er tændt.',
    okRu: 'Обе фары ближнего света горят ярко и равномерно с чёткой резкой границей света, и задние фонари включены.',
    failDa: 'Én pære er død («énøjet» bil), eller forlygterne peger for højt op pga. tung bagage (glemte lygtehøjden!).',
    failRu: 'Перегорела одна лампа («одноглазая» машина) или фары направлены слишком высоко из-за тяжёлого багажа (забыли корректор фар!).',
    examDa: 'Nærlys skal oplyse vejen mindst 30 m frem med et fald på ca. 1 % (1 cm pr. meter) uden at blænde modkørende.',
    examRu: '«Ближний свет должен освещать дорогу минимум на 30 м вперёд с уклоном около 1% (1 см на метр), не ослепляя встречных.»',
  },
  {
    id: 'fjernlys',
    tab: 'lygter',
    labelDa: 'Fjernlys (min. 100 m & Blå lampe)',
    labelRu: 'Дальний свет (мин. 100 м и синяя лампа)',
    whyDa: 'Ved 80 km/t på mørk landevej rækker 30 m nærlys kun godt ét sekund frem! Fjernlyset på min. 100 m giver dig tid til at se cyklister, rådyr og sving i god tid.',
    whyRu: 'При 80 км/ч на тёмной загородной дороге 30 м ближнего света хватает чуть больше чем на одну секунду! Дальний свет на мин. 100 м даёт вам время вовремя увидеть велосипедистов, косуль и повороты.',
    lookDa: 'Skub venstre arm væk fra dig (med nærlys tændt) — på instrumentbrættet lyser altid en markant BLÅ kontrollampe med lige stråler.',
    lookRu: 'Толкните левый рычаг от себя (при включённом ближнем свете) — на приборной панели всегда загорается заметная СИНЯЯ контрольная лампа с прямыми лучами.',
    checkDa: 'Lyser min. 100 m frem + blå kontrollampe lyser. Blænd ned til nærlys ca. 200–300 m før modkørende og ca. 100–150 m bag forankørende!',
    checkRu: 'Освещает минимум на 100 м вперёд + горит синяя контрольная лампа. Переключайтесь на ближний свет примерно за 200–300 м до встречного и за 100–150 м за впереди идущим транспортом!',
    okDa: 'Både fjernlygter og den lovpligtige BLÅ kontrollampe på panelet virker øjeblikkeligt.',
    okRu: 'Обе фары дальнего света и обязательная по закону СИНЯЯ контрольная лампа на панели срабатывают мгновенно.',
    failDa: 'Blå lampe lyser ikke, eller du glemmer at blænde ned i tide for modkørende, cyklister og toge.',
    failRu: 'Синяя лампа не горит, или вы забываете вовремя переключиться на ближний свет перед встречными машинами, велосипедистами и поездами.',
    examDa: 'Fjernlys skal oplyse vejen mindst 100 m frem, og der skal lyse en blå kontrollampe på instrumentbrættet.',
    examRu: '«Дальний свет должен освещать дорогу минимум на 100 м вперёд, и на приборной панели должна гореть синяя контрольная лампа.»',
  },
  {
    id: 'stoplys',
    tab: 'lygter',
    labelDa: 'Stoplys (3 røde lygter)',
    labelRu: 'Стоп-сигналы (3 красных фонаря)',
    whyDa: 'Stoplysene advarer bilerne bag dig inden for et splitsekund, når du sætter farten ned — uden dem opdager bagvedkørende ikke, at du bremser.',
    whyRu: 'Стоп-сигналы за доли секунды предупреждают едущие сзади машины, когда вы снижаете скорость — без них едущий позади не заметит, что вы тормозите.',
    lookDa: '2 kraftige røde lygter i baglygterne + 1 højt i midten ved bagruden.',
    lookRu: '2 ярких красных огня в задних фонарях + 1 высокий по центру у заднего стекла.',
    checkDa: 'Bed prøvesagkyndigen eller en hjælper se bagpå (eller brug spejlingen i en mørk butiksrude), mens du træder på bremsen.',
    checkRu: 'Попросите экзаменатора или помощника посмотреть сзади (или используйте отражение в тёмной витрине магазина), пока вы нажимаете на тормоз.',
    okDa: 'Alle 3 stoplys tænder straks ved pedaltryk og lyser væsentligt kraftigere end almindelige baglys.',
    okRu: 'Все 3 стоп-сигнала загораются сразу при нажатии педали и светят значительно ярче обычных задних огней.',
    failDa: 'Én eller flere stoplygter er sprunget (typisk det høje midterstoplys eller én sidepære).',
    failRu: 'Один или несколько стоп-сигналов перегорели (обычно верхний центральный стоп-сигнал или одна боковая лампа).',
    examDa: 'Alle 3 stoplys skal lyse kraftigere end baglyset øjeblikkeligt, når jeg træder på bremsepedalen.',
    examRu: '«Все 3 стоп-сигнала должны мгновенно загораться ярче задних габаритов, когда я нажимаю педаль тормоза.»',
  },
  {
    id: 'blinklys',
    tab: 'lygter',
    labelDa: 'Blinklys & Havariblink (60–120/min)',
    labelRu: 'Поворотники и аварийка (60–120/мин)',
    whyDa: 'Tydeligt blink er din vigtigste kommunikation med cyklister, fodgængere og andre biler før vognbaneskift, rundkørsler og sving.',
    whyRu: 'Чёткий сигнал поворотником — ваше главное средство общения с велосипедистами, пешеходами и другими автомобилями перед перестроением, круговым движением и поворотом.',
    lookDa: '6 gule/orange lygter: 2 foran, 2 på forskærme/sidespejle, 2 bagpå. Alle 6 blinker samtidig på den røde havariknap.',
    lookRu: '6 жёлтых/оранжевых фонарей: 2 спереди, 2 на передних крыльях/зеркалах, 2 сзади. Все 6 мигают одновременно от красной кнопки аварийки.',
    checkDa: 'Skal blinke ensartet 60–120 gange i minuttet (1–2 gange i sekundet) og tænde alle 3 lygter på hver side.',
    checkRu: 'Должны мигать равномерно 60–120 раз в минуту (1–2 раза в секунду) и зажигать все 3 фонаря на каждой стороне.',
    okDa: 'Alle 6 udvendige blinklys lyser gult/orange i rolig, ensartet takt.',
    okRu: 'Все 6 наружных поворотников светят жёлтым/оранжевым в спокойном, равномерном ритме.',
    failDa: 'Blinker lampen inde i bilen dobbelt så hurtigt? Så er en udvendig blinklyspære næsten altid sprunget!',
    failRu: 'Если индикатор в салоне мигает вдвое быстрее, почти наверняка перегорела одна из наружных ламп поворотника!',
    examDa: 'Alle 6 blinklys skal lyse gult/orange og blinke 60–120 gange i minuttet — hurtig blink inde i bilen betyder en sprungen pære.',
    examRu: '«Все 6 поворотников должны светить жёлтым/оранжевым и мигать 60–120 раз в минуту — частое мигание в салоне означает перегоревшую лампу.»',
  },
  {
    id: 'nummerplade',
    tab: 'lygter',
    labelDa: 'Nummerpladelys (20 m) & Reflekser',
    labelRu: 'Подсветка номера (20 м) и катафоты',
    whyDa: 'Nummerpladen skal kunne aflæses i mørke, og de bagerste røde reflekser gør din bil synlig på lang afstand, selv hvis al strøm og lys svigter om natten.',
    whyRu: 'Номерной знак должен читаться в темноте, а задние красные отражатели делают вашу машину видимой издалека, даже если ночью пропадёт всё электричество и свет.',
    lookDa: 'Små hvide lamper lige over den bagerste nummerplade + 2 RØDE ikke-trekantede reflekser integreret i bagkofanger eller baglygter.',
    lookRu: 'Небольшие белые лампы прямо над задним номерным знаком + 2 КРАСНЫХ нетреугольных отражателя в заднем бампере или фонарях.',
    checkDa: 'Hvidt nummerpladelys skal gøre pladen læsbar på min. 20 m i mørke. En personbils 2 bagreflekser må ALDRIG være trekantede (trekant = kun trailer/påhængsvogn!).',
    checkRu: 'Белая подсветка номера должна обеспечивать читаемость знака минимум с 20 м в темноте. 2 задних катафота легкового автомобиля НИКОГДА не могут быть треугольными (треугольник = только прицеп!).',
    okDa: 'Hvidt lys oplyser hele bagnummerpladen, og begge røde ikke-trekantede reflekser er hele og rene.',
    okRu: 'Белый свет освещает весь задний номерной знак, а оба красных нетреугольных отражателя целые и чистые.',
    failDa: 'Mørk nummerplade (sprungen pære), rødt lys på nummerpladen eller knækket/manglende refleks.',
    failRu: 'Тёмный номер (перегорела лампа), красный свет на номерном знаке либо сломанный или отсутствующий отражатель.',
    examDa: 'Nummerpladelyset skal være hvidt og gøre pladen læsbar på mindst 20 m, og de 2 røde bagreflekser må ikke være trekantede.',
    examRu: '«Подсветка номера должна быть белой и обеспечивать читаемость минимум с 20 м, а 2 красных задних отражателя не должны быть треугольными.»',
  },
  {
    id: 'horn',
    tab: 'lygter',
    labelDa: 'Horn (Kun ved fare)',
    labelRu: 'Звуковой сигнал (только при опасности)',
    whyDa: 'Hornet er udelukkende et nødværktøj til at forhindre en ulykke her og nu — i Danmark er det ulovligt at dytte for at hilse eller skynde på andre.',
    whyRu: 'Звуковой сигнал — это исключительно экстренное средство для предотвращения аварии здесь и сейчас: в Дании запрещено законом сигналить ради приветствия или чтобы поторопить других.',
    lookDa: 'Midterpuden på rattet (mærket med et lille horn/trompet-ikon).',
    lookRu: 'Центральная подушка руля (отмечена маленьким значком клаксона/трубы).',
    checkDa: 'Tryk ganske kort på rattets midterpude — hornet skal give én klar, ensartet tone (på prøven evt. på et åbent, roligt sted efter instruks).',
    checkRu: 'Коротко нажмите на центр руля — клаксон должен дать один чёткий, ровный тон (на экзамене при необходимости на открытом спокойном месте по указанию экзаменатора).',
    okDa: 'Tydelig, ensartet advarselstone ved kort tryk.',
    okRu: 'Чёткий, ровный предупреждающий тон при коротком нажатии.',
    failDa: 'Helt tavst horn, skrattende tone eller brug af hornet uden reel fare (fx af irritation i kø).',
    failRu: 'Полностью молчащий клаксон, хрипящий тон или использование сигнала без реальной опасности (например, от раздражения в пробке).',
    examDa: 'Hornet skal give en klar, ensartet tone og må kun bruges til at afværge overhængende fare.',
    examRu: '«Звуковой сигнал должен давать чёткий, ровный тон и использоваться только для предотвращения неминуемой опасности.»',
  },

  // 4. Instrumentpanel
  {
    id: 'olie_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød oliekande — Olietryk',
    labelRu: 'Красная маслёнка — давление масла',
    whyDa: 'Uden olietryk mangler motoren øjeblikkeligt smøring indeni — fortsætter du kørslen blot få minutter, kan motoren brænde sammen.',
    whyRu: 'Без давления масла двигатель мгновенно лишается внутренней смазки — если продолжать движение хотя бы несколько минут, двигатель может выйти из строя.',
    lookDa: 'Rødt ikon formet som en oliekande med en dråbe på spidsen.',
    lookRu: 'Красный значок в виде маслёнки с каплей на носике.',
    checkDa: 'Skal tænde ved tænding og slukke straks efter motorstart. Lyser den under kørsel: STANDS STRAKS sikkert og sluk motoren!',
    checkRu: 'Должна загораться при включении зажигания и гаснуть сразу после запуска двигателя. Загорелась во время движения: ОСТАНОВИТЕСЬ НЕМЕДЛЕННО безопасно и заглушите двигатель!',
    okDa: 'Slukker inden for 1–2 sekunder efter, at motoren starter.',
    okRu: 'Гаснет в течение 1–2 секунд после запуска двигателя.',
    failDa: 'Forbliver rød eller blinker under kørsel — kør IKKE videre til tankstation eller værksted!',
    failRu: 'Остаётся красной или мигает во время движения — НЕ езжайте дальше даже до заправки или автосервиса!',
    examDa: 'Hvis den røde olielampe lyser under kørsel, skal jeg standse sikkert med det samme og slukke motoren.',
    examRu: '«Если во время движения загорается красная лампа масла, я должен немедленно безопасно остановиться и заглушить двигатель.»',
  },
  {
    id: 'bremse_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød (!) — Bremsefejl / Håndbremse',
    labelRu: 'Красный (!) — неисправность тормозов / ручник',
    whyDa: 'Den advarer enten om, at du er ved at køre med håndbremsen trukket, eller at der er farligt lav bremsevæske/lækage i bremserne.',
    whyRu: 'Она предупреждает либо о том, что вы трогаетесь с затянутым ручником, либо об опасно низком уровне тормозной жидкости / утечке в тормозах.',
    lookDa: 'Rød cirkel med udråbstegn `(!)` (eller `(P)`) midt på instrumentbrættet.',
    lookRu: 'Красный круг с восклицательным знаком `(!)` (или `(P)`) по центру приборной панели.',
    checkDa: 'Skal slukke helt, når håndbremsen løsnes! Lyser den rødt videre under kørsel: stands straks sikkert og tjek bremsevæsken.',
    checkRu: 'Должна полностью погаснуть, когда ручник отпущен! Если она продолжает гореть красным во время движения: немедленно безопасно остановитесь и проверьте тормозную жидкость.',
    okDa: 'Slukker helt så snart håndbremsen sænkes før igangsætning.',
    okRu: 'Полностью гаснет, как только ручник опущен перед началом движения.',
    failDa: 'Rød `(!)` lyser stadig under kørsel med håndbremsen helt nede = bremsefejl eller manglende bremsevæske!',
    failRu: 'Красный знак `(!)` продолжает гореть на ходу при полностью опущенном ручнике = неисправность тормозов или нехватка тормозной жидкости!',
    examDa: 'Lampen lyser normalt ved trukket håndbremse, men lyser den med håndbremsen nede, skal jeg standse straks (bremsefejl / for lidt bremsevæske).',
    examRu: '«При затянутом ручнике лампа горит в норме, но если она горит при опущенном ручнике, нужно остановиться немедленно (неисправность тормозов / нехватка тормозной жидкости).»',
  },
  {
    id: 'temp_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød Temperatur / Batteri',
    labelRu: 'Красная лампа температуры / аккумулятора',
    whyDa: 'Begge røde lamper advarer om akut teknisk svigt: enten overophedes motoren, eller også løber batteriet tørt, så servo, bremsekraft og lys pludselig kan svigte.',
    whyRu: 'Обе красные лампы предупреждают о срочной технической неисправности: либо двигатель перегревается, либо аккумулятор разряжается, из-за чего усилитель руля, усилитель тормозов и свет могут внезапно отказать.',
    lookDa: 'Rødt termometer over bølger (motortemperatur) eller rødt batteri-symbol med + og −.',
    lookRu: 'Красный термометр над волнами (температура двигателя) или красный символ аккумулятора со знаками `+` и `−`.',
    checkDa: 'Rød lampe = stands sikkert hurtigst muligt og sluk motoren! Ved varmt termometer: lad motoren køle helt af og åbn ALDRIG det varme kølervæskedæksel.',
    checkRu: 'Красная лампа = как можно быстрее безопасно остановитесь и заглушите двигатель! При горячем термометре дайте двигателю полностью остыть и НИКОГДА не открывайте горячую крышку охлаждающей жидкости.',
    okDa: 'Begge lamper slukker få sekunder efter start og forbliver slukkede under kørsel.',
    okRu: 'Обе лампы гаснут через несколько секунд после запуска и остаются выключенными во время движения.',
    failDa: 'Lyser rødt under kørsel — du risikerer motorhavari eller pludseligt strømsvigt midt i trafikken.',
    failRu: 'Горят красным во время движения — вы рискуете поломкой двигателя или внезапным отказом электропитания посреди потока.',
    examDa: 'En rød advarselslampe betyder altid: stands sikkert straks og sluk motoren — ved høj temperatur åbner jeg aldrig varm kølervæske.',
    examRu: '«Красная предупреждающая лампа всегда означает: немедленно безопасно остановитесь и заглушите двигатель — при высокой температуре я никогда не открываю горячий антифриз.»',
  },
  {
    id: 'abs_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Gul ABS / ESP / Motorlampe',
    labelRu: 'Жёлтая лампа ABS / ESP / двигателя',
    whyDa: 'Gule/orange lamper er en vigtig skillelinje på prøven: de betyder «advarsel — kør forsigtigt til værksted», i modsætning til røde lamper som kræver øjeblikkeligt stop.',
    whyRu: 'Жёлтые/оранжевые лампы — важный ориентир на экзамене: они означают «предупреждение — езжайте осторожно в автосервис», в отличие от красных ламп, требующих немедленной остановки.',
    lookDa: 'Gult/orange symbol: bogstaverne "ABS", bil på slingrespor (ESP) eller et lille motorsymbol (Check Engine).',
    lookRu: 'Жёлтый или оранжевый значок: буквы «ABS», машина на извилистой линии (ESP) или маленький значок двигателя (Check Engine).',
    checkDa: 'Ved tændt gul ABS/ESP virker selve bremsepedalen stadig, men hjulene kan låse og skride ved hård opbremsning — kør ekstra forsigtigt og få bilen på værksted.',
    checkRu: 'При горящей жёлтой лампе ABS/ESP сама педаль тормоза продолжает работать, но колёса могут заблокироваться и пойти в занос при резком торможении — езжайте особенно осторожно и обратитесь в автосервис.',
    okDa: 'Alle gule advarselslamper slukker kort efter start og lyser ikke under kørslen.',
    okRu: 'Все жёлтые предупреждающие лампы гаснут вскоре после запуска и не горят во время движения.',
    failDa: 'Lyser gult konstant under kørsel — må ikke ignoreres i ugevis, men kræver værkstedsbesøg med ekstra forsigtig kørsel.',
    failRu: 'Постоянно горит жёлтым во время движения — это нельзя игнорировать неделями, а нужно поехать в автосервис с особой осторожностью.',
    examDa: 'En gul lampe betyder fejl i fx ABS/ESP, men de almindelige bremser virker stadig — jeg kan køre forsigtigt til værksted.',
    examRu: '«Жёлтая лампа означает сбой, например в ABS/ESP, но обычные тормоза всё равно работают — я могу осторожно доехать до автосервиса.»',
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
  const { uiLang, pick } = useUiLang();
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

  const localizeHotspot = (h: HotspotInfo): HotspotInfo => {
    if (uiLang !== 'uk') return h;
    const uk = CAR_HOTSPOTS_UK[h.id];
    if (!uk) return h;
    return {
      ...h,
      labelRu: uk.labelUk,
      whyRu: uk.whyUk,
      lookRu: uk.lookUk,
      checkRu: uk.checkUk,
      okRu: uk.okUk ?? h.okRu,
      failRu: uk.failUk ?? h.failRu,
      examRu: uk.examUk,
    };
  };

  const tabHotspots = HOTSPOTS.filter((h) => h.tab === tab).map(localizeHotspot);
  const currentInfo =
    tabHotspots.find((h) => h.id === selectedId) ?? tabHotspots[0];
  const rawActiveTabInfo = TABS.find((t) => t.id === tab);
  const activeTabInfo = rawActiveTabInfo
    ? {
        ...rawActiveTabInfo,
        ru: uiLang === 'uk' ? (CAR_TABS_UK[rawActiveTabInfo.id] ?? rawActiveTabInfo.ru) : rawActiveTabInfo.ru,
      }
    : undefined;

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
                : `${pick('Интерактивная схема:', 'Інтерактивна схема:')} ${activeTabInfo.ru}`}
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
            const tabTitle = uiLang === 'uk' ? (CAR_TABS_UK[t.id] ?? t.ru) : t.ru;
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
                  {languageMode === 'da_only' || languageMode === 'spoiler' ? t.da : tabTitle}
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
            alt={pick(
              'Реальное фото подкапотного пространства учебного автомобиля',
              'Реальне фото підкапотного простору навчального автомобіля'
            )}
            className="h-full w-full select-none object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-zinc-950/20" />
          <div className="pointer-events-none absolute left-3 top-2.5 rounded-lg bg-zinc-950/75 px-2.5 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur-sm">
            {compact
              ? pick('Нажмите на метку (1–5)', 'Натисніть на мітку (1–5)')
              : pick('Нажмите на любую метку прямо на фото (1–5)', 'Натисніть на будь-яку мітку просто на фото (1–5)')}
          </div>

          {ENGINE_BAY_PINS.map((pin) => {
            const isActive = currentInfo?.id === pin.id;
            const rawPinInfo = HOTSPOTS.find((h) => h.id === pin.id);
            const pinInfo = rawPinInfo ? localizeHotspot(rawPinInfo) : undefined;
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
              <span>
                {languageMode === 'da_only'
                  ? 'Hvorfor tjekker man det?'
                  : pick('Зачем это проверять?', 'Навіщо це перевіряти?')}
              </span>
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
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {languageMode === 'da_only'
                    ? 'Sådan finder du den'
                    : pick('Как узнать на глаз', 'Як упізнати на око')}
                </span>
              </div>
              <SpeakButton id={`tech_look_${currentInfo.id}`} text={currentInfo.lookDa} />
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
              <span>
                {languageMode === 'da_only'
                  ? 'Kontrol på prøven'
                  : pick('Как проверить руками', 'Як перевірити руками')}
              </span>
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
                  <div className="mb-1 flex items-center justify-between gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{languageMode === 'da_only' ? 'Normalt' : pick('Норма', 'Норма')}</span>
                    </div>
                    {currentInfo.okDa && (
                      <SpeakButton id={`tech_ok_${currentInfo.id}`} text={currentInfo.okDa} />
                    )}
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
                  <div className="mb-1 flex items-center justify-between gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {languageMode === 'da_only'
                          ? 'Fejl / Ikke tilladt'
                          : pick('Ошибка / Поломка', 'Помилка / Поломка')}
                      </span>
                    </div>
                    {currentInfo.failDa && (
                      <SpeakButton id={`tech_fail_${currentInfo.id}`} text={currentInfo.failDa} />
                    )}
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

          {/* 5. Concise Exam Answer Phrase for Inspector */}
          <div className="flex items-start justify-between gap-2.5 rounded-lg border border-indigo-200/80 bg-indigo-50/55 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/25">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {languageMode === 'da_only'
                    ? 'Kort svar til prøvesagkyndigen'
                    : pick(
                        'Как коротко сказать инспектору на экзамене',
                        'Як коротко сказати інспектору на іспиті'
                      )}
                </span>
              </div>
              <TheoryBilingual
                ru={currentInfo.examRu}
                da={currentInfo.examDa}
                mode={languageMode}
                compact
                ruClassName="text-xs sm:text-[13px] font-medium leading-snug text-indigo-950 dark:text-indigo-100"
              />
            </div>
            <SpeakButton id={`tech_exam_${currentInfo.id}`} text={currentInfo.examDa} />
          </div>
        </div>
      )}
    </div>
  );
};
