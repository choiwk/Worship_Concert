/* ══════════════════════════════════════════════════════════
   songs.js — 곡 데이터 (단일 원천)

   곡 리스트, 곡 상세, LP 미리듣기가 모두 이 배열 하나를 읽는다.
   곡을 추가·수정·재정렬할 때는 이 파일만 고치면 된다.

   필드
     no       곡 번호 (문자열, 화면에 그대로 노출)
     slug     URL 조각. 해시 라우팅에 쓰인다 (#/songs/02)
     title    곡 제목
     artist   원곡자 (있을 때만)
     tag      '주제곡' | '기도' | null — 리스트에 배지로 표시
     youtube  유튜브 링크 (없으면 null → 버튼을 그리지 않는다)
     parts    가사 묶음. 한 곡에 두 곡이 이어지는 경우 2개가 된다.
              { label, lyrics, bible }
              label  파트 이름 (파트가 하나뿐이면 생략)
              bible  bibleRef(...) 결과. 없으면 말씀 영역을 그리지 않는다

   성경 본문에 대하여
     개역한글판(대한성서공회)에서 곡마다 한두 구절씩만 인용한다.
     전체 장을 통째로 싣지 않으며, 팝업에 출처를 표기하고
     '전체 장 읽기' 외부 링크를 함께 둔다.
     욥기 42장처럼 장 단위로 지정된 곡은 핵심 구절만 발췌한다.
══════════════════════════════════════════════════════════ */

/**
 * 성경 구절
 * @param ref    화면에 보여줄 표기 (예: '출애굽기 3장 9-12절')
 * @param usfm   YouVersion 좌표 (예: 'EXO.3.9-12') — 전체 장 읽기 링크에 쓴다
 * @param verses [[절번호, 본문], ...]
 * @param note   발췌한 경우의 안내 문구 (없으면 null)
 */
function bibleRef(ref, usfm, verses, note) {
  return {
    ref: ref,
    verses: verses,
    note: note || null,
    version: '개역한글판 (대한성서공회)',
    url: 'https://www.bible.com/ko/bible/88/' + usfm
  };
}

/** 공연 순서대로 묶어 둔 유튜브 재생목록 — '곡 전체 듣기' 버튼이 쓴다 */
const SETLIST_PLAYLIST = 'https://www.youtube.com/playlist?list=PLPItSHBk4jRQ';

const SONGS = [
  {
    no: '01',
    slug: '01',
    title: '하나님이 너를 엄청 사랑하신대',
    roman: 'Hananimi neoreul eomcheong saranghasindae',
    titleEn: 'God Loves You So Much',
    titleKm: 'ព្រះជាម្ចាស់ស្រឡាញ់អ្នកខ្លាំងណាស់',
    tag: null,
    youtube: 'https://youtu.be/Fxtmq-1tipo?si=qaVhzjxqfrN6tKuU',
    parts: [
      {
        lyrics: `하나님이 너를 엄청 사랑하신대
하나님이 너를 엄청 사랑하신대
하나님이 너를 엄청 사랑해서

사람이 아닌 하나님을
바라보기를 기다리신대

너의 삶을 허락하시고
이 땅에 태어나게 하셨대

지금 눈 앞의 어둠 속에
그저 두지 않으실거래`,
        lyricsEn: `God loves you so very much
God loves you so very much
God loves you so very much
Because He loves you so very much

He is waiting for you
To turn your eyes toward Him,
Not toward other people.

He has given you life
And brought you into this world.

He will not leave you alone
In the darkness that stands before you now.`,
        lyricsKm: `ព្រះជាម្ចាស់ស្រឡាញ់អ្នកខ្លាំងណាស់ ព្រះជាម្ចាស់ស្រឡាញ់អ្នកខ្លាំងណាស់ ព្រះជាម្ចាស់ស្រឡាញ់អ្នកខ្លាំងណាស់ ព្រោះព្រះអង្គស្រឡាញ់អ្នកខ្លាំងណាស់

ព្រះអង្គរង់ចាំឱ្យអ្នក បែរមកសម្លឹងមើលព្រះអង្គ មិនមែនមនុស្សលោកឡើយ

ព្រះអង្គបានប្រទានជីវិតដល់អ្នក ហើយបានឱ្យអ្នកកើតមកនៅលើផែនដីនេះ

ព្រះអង្គនឹងមិនទុកអ្នក ឱ្យនៅតែម្នាក់ឯងក្នុងភាពងងឹត ដែលនៅចំពោះមុខអ្នកនាពេលនេះឡើយ`,
      }
    ]
  },

  {
    no: '02',
    slug: '02',
    title: '주를 바라보며 / 주를 찾는 모든 자들이',
    roman: 'Jureul barabomyeo / Jureul channeun modeun jadeuri',
    titleEn: 'Looking to the Lord / Let All Who Seek the Lord',
    titleKm: 'អស់អ្នកដែលសម្លឹងមើលព្រះអម្ចាស់ និងស្វែងរកទ្រង់',
    tag: null,
    youtube: 'https://youtu.be/bgdU5_BbACM?si=YKqGbKfV1RXgJtSq',
    parts: [
      {
        label: '주를 바라보며',

        labelEn: 'Looking to the Lord',
        lyrics: `나의 시선이 나의 마음을 향할 때
작고 초라한 모습과 두려움뿐이네
나의 시선을 당신께 돌릴 때
비로소 내 맘 평안해
비로소 내 맘 평안해

주를 바라보며 그 맘을 구합니다
나의 모든 것 다 품으신 주님의 사랑
나의 생각보다 더 크신 주님의 계획
그 앞에 내 삶 드립니다
주님께 내 삶 드립니다`,
        lyricsEn: `When my eyes turn toward my own heart,
I see only my weakness and my fears.
But when I turn my eyes toward You,
At last my heart finds peace,
At last my heart finds peace.

I look to You, Lord,
And seek Your heart.
Your love embraces all of me,
Holding everything that I am.

Your plans are greater than my thoughts.
I surrender my life before You.
I surrender my life to You, Lord.`,
        lyricsKm: `នៅពេលដែលខ្ញុំសម្លឹងមើលខ្លួនឯង ខ្ញុំឃើញតែភាពតូចទាប និងការភ័យខ្លាច នៅពេលដែលខ្ញុំបង្វែរភ្នែកទៅរកព្រះអង្គ ទើបចិត្តខ្ញុំបានសុខសាន្ត ទើបចិត្តខ្ញុំបានសុខសាន្ត

ខ្ញុំសម្លឹងមើលព្រះអម្ចាស់ ហើយស្វែងរកព្រះហឫទ័យរបស់ទ្រង់ សេចក្តីស្រឡាញ់របស់ព្រះអង្គ បានឱបក្រសោបអ្វីៗទាំងអស់នៅក្នុងខ្ញុំ

ផែនការរបស់ព្រះអង្គធំជាងគំនិតរបស់ខ្ញុំ នៅចំពោះព្រះអង្គ ខ្ញុំថ្វាយជីវិតរបស់ខ្ញុំ ខ្ញុំថ្វាយជីវិតរបស់ខ្ញុំដល់ព្រះអម្ចាស់`,
        bible: bibleRef('출애굽기 3장 9-12절', 'EXO.3.9-12', [
          [9, '이제 이스라엘 자손의 부르짖음이 내게 달하고 애굽 사람이 그들을 괴롭게 하는 학대도 내가 보았으니'],
          [10, '이제 내가 너를 바로에게 보내어 너로 내 백성 이스라엘 자손을 애굽에서 인도하여 내게 하리라'],
          [11, '모세가 하나님께 고하되 내가 누구관대 바로에게 가며 이스라엘 자손을 애굽에서 인도하여 내리이까'],
          [12, '하나님이 가라사대 내가 정녕 너와 함께 있으리라 네가 백성을 애굽에서 인도하여 낸 후에 너희가 이 산에서 하나님을 섬기리니 이것이 내가 너를 보낸 증거니라']
        ])
      },
      {
        label: '주를 찾는 모든 자들이',

        labelEn: 'Let All Who Seek the Lord',
        lyrics: `주를 찾는 모든 자들이 주로 말미암아
기뻐하고 즐거워하게 하시며
주의 구원을 사랑하는 자들이 항상 말하기를
하나님은 위대하시다 하게 하소서

주는 나의 도움 나를 건지시는 이
여호와여 지체 말고 내게 임하소서
가난하고 궁핍한 내 마음 가운데
여호와여 속히 임하소서`,
        lyricsEn: `May all who seek You
Rejoice and be glad in You.
May all who love Your salvation
Always say, “God is great!”

You are my help,
The One who delivers me.
O Lord,
Please do not delay in coming to me.

In my heart, poor and in need,
O Lord,
Please come to me without delay.`,
        lyricsKm: `សូមឱ្យអស់អ្នកដែលស្វែងរកព្រះអង្គ បានអរសប្បាយ និងរីករាយដោយសារព្រះអង្គ សូមឱ្យអស់អ្នកដែលស្រឡាញ់សេចក្តីសង្គ្រោះរបស់ព្រះអង្គ តែងតែនិយាយថា ព្រះជាម្ចាស់ទ្រង់អស្ចារ្យមែន!

ព្រះអង្គជាជំនួយរបស់ខ្ញុំ ជាព្រះដែលសង្គ្រោះខ្ញុំ ឱ ព្រះយេហូវ៉ាអើយ សូមកុំពន្យារពេលយាងមករកខ្ញុំឡើយ

នៅក្នុងចិត្តខ្ញុំដែលក្រីក្រ និងខ្វះខាត ឱ ព្រះយេហូវ៉ាអើយ សូមយាងមករកខ្ញុំដោយឆាប់រហ័ស`,
        bible: bibleRef('시편 70편 4절', 'PSA.70.4', [
          [4, '주를 찾는 모든 자로 주를 인하여 기뻐하고 즐거워하게 하시며 주의 구원을 사모하는 자로 항상 말하기를 하나님은 광대하시다 하게 하소서']
        ])
      }
    ]
  },

  {
    no: '03',
    slug: '03',
    title: '주와 함께 걸어가네',
    roman: 'Juwa hamkke georeoganne',
    titleEn: 'Walking with the Lord',
    titleKm: 'ដើរទៅជាមួយព្រះអម្ចាស់',
    tag: null,
    youtube: 'https://youtu.be/H56xVRKQ2Ag?si=NGX8c_vy2BCeGtwZ',
    parts: [
      {
        lyrics: `어둠이 무너지고
텅 빈 맘 멈춰 설 때
다시 내게 바람 불어오네

나는 주와 걷겠네
주 내 맘에 계시니
날마다 빛으로 걸어가네

주는 나의 도움 내 등불 되시니
나 두렵지 않네

그 생명 내 맘에 강같이 흐르고
그 사랑 해 같이 빛이 나네
내 삶 소망의 바다 이르도록
나는 주와 함께 걸어가네

늦은 겨울 지나고
짙은 안개 걷힐 때
다시 내게 음성 들려오네

주 날 오라 하시네
햇빛 되게 하시니
나는 주와 함께 걸어가네`,
        lyricsEn: `When the darkness fades away
And my empty heart falls still,
A fresh wind blows through me once again.

I will walk with You, Lord,
For You dwell within my heart.
Day by day, I walk in Your light.

You are my help,
You are the lamp that lights my way.
I will not be afraid.

Your life flows through my heart like a river,
Your love shines brightly like the sun.
Until my life reaches the sea of hope,
I will walk with You.

When the long winter passes
And the thick fog disappears,
I hear Your voice calling me again.

The Lord is calling me to come,
You make me shine like the sunlight.
I will walk with You, Lord.`,
        lyricsKm: `នៅពេលភាពងងឹតរលាយបាត់ ហើយចិត្តទទេរបស់ខ្ញុំឈប់ស្ងៀម ខ្យល់ថ្មីបានបក់មករកខ្ញុំម្តងទៀត

ខ្ញុំនឹងដើរជាមួយព្រះអម្ចាស់ ព្រោះព្រះអង្គគង់នៅក្នុងចិត្តខ្ញុំ រាល់ថ្ងៃខ្ញុំដើរក្នុងពន្លឺរបស់ព្រះអង្គ

ព្រះអង្គជាជំនួយរបស់ខ្ញុំ ជាចង្កៀងបំភ្លឺផ្លូវខ្ញុំ ដូច្នេះ ខ្ញុំមិនភ័យខ្លាចឡើយ

ជីវិតរបស់ព្រះអង្គហូរក្នុងចិត្តខ្ញុំដូចជាទន្លេ សេចក្តីស្រឡាញ់របស់ព្រះអង្គភ្លឺដូចព្រះអាទិត្យ រហូតដល់ជីវិតខ្ញុំទៅដល់សមុទ្រនៃសេចក្តីសង្ឃឹម ខ្ញុំនឹងដើរជាមួយព្រះអង្គ

នៅពេលរដូវរងាដ៏យូរបានកន្លងផុត ហើយអ័ព្ទដ៏ក្រាស់បានរសាត់បាត់ ខ្ញុំបានឮព្រះសូរសៀងរបស់ព្រះអង្គម្តងទៀត

ព្រះអម្ចាស់ហៅខ្ញុំឱ្យមករកទ្រង់ ទ្រង់ធ្វើឱ្យខ្ញុំក្លាយជាពន្លឺ ខ្ញុំនឹងដើរជាមួយព្រះអង្គ`,
        bible: bibleRef('욥기 42장', 'JOB.42', [
          [1, '욥이 여호와께 대답하여 가로되'],
          [2, '주께서는 무소불능하시오며 무슨 경영이든지 못 이루실 것이 없는줄 아오니'],
          [3, '무지한 말로 이치를 가리우는 자가 누구니이까 내가 스스로 깨달을 수 없는 일을 말하였고 스스로 알 수 없고 헤아리기 어려운 일을 말하였나이다'],
          [4, '내가 말하겠사오니 주여 들으시고 내가 주께 묻겠사오니 주여 내게 알게 하옵소서'],
          [5, '내가 주께 대하여 귀로 듣기만 하였삽더니 이제는 눈으로 주를 뵈옵나이다'],
          [6, '그러므로 내가 스스로 한하고 티끌과 재 가운데서 회개하나이다']
        ], '42장 1-6절 발췌')
      }
    ]
  },

  {
    no: '04',
    slug: '04',
    title: '길을 찾는 너를 위해',
    roman: 'Gireul channeun neoreul wihae',
    titleEn: 'For You Who Are Searching for the Way',
    titleKm: 'សម្រាប់អ្នកដែលកំពុងស្វែងរកផ្លូវ',
    tag: null,
    youtube: 'https://youtu.be/3RbST8rkuao?si=svRVkU50dgOHg9tF',
    parts: [
      {
        lyrics: `우리 걸어가는 삶 속에 갈림길이 있어도
주를 신뢰하는 그 길이 바로 당신의 길이네
지쳐 쓰러지는 일들에 일어설 수 없어도
먼저 손내밀어 일으킬 주의 손 잡고 가네
우리 걸어가는길 위에 지쳐 넘어져도
그가 손 잡아주시니 다시 일어서네
주가 함께 하신 내 삶에 방향이 달라져도
그가 함께 하시니 다시 걸어가네
찬양, 나의 길에 함께 하는 주
찬양, 우리와 늘 함께 하는 주
길을 찾는 우리 가운데
주가 중심되시길
주가 함께 하시길 우리 간절히 소망하네`,
        lyricsEn: `Even when our journey through life
Leads us to crossroads,
The path that trusts in the Lord
Is the path He has prepared for us.

Even when we grow weary and fall,
Unable to rise again,
We take the hand of the Lord,
Who reaches out first to lift us up.

Even when we grow tired and stumble
Along the road we travel,
He takes us by the hand,
And we rise to our feet again.

Even when the direction of my life changes,
The Lord remains beside me.
Because He is walking with me,
I will keep moving forward.

Praise the Lord,
Who walks beside me on my journey.
Praise the Lord,
Who is always with us.

Among all of us who are searching for the way,
May the Lord remain at the center of our lives.
With all our hearts, we long
For the Lord to walk beside us.`,
        lyricsKm: `ទោះបីជាមានផ្លូវបែកជាច្រើន នៅក្នុងដំណើរជីវិតរបស់យើងក៏ដោយ ផ្លូវដែលទុកចិត្តលើព្រះអម្ចាស់ គឺជាផ្លូវដែលព្រះអង្គរៀបចំសម្រាប់អ្នក

ទោះបីយើងនឿយហត់ និងដួលរលំ រហូតដល់មិនអាចក្រោកឈរឡើងក៏ដោយ យើងនឹងចាប់ដៃព្រះអង្គ ដែលលូកមកជួយយើងឱ្យក្រោកឡើងមុនគេ

ទោះបីយើងនឿយហត់ និងដួល នៅលើផ្លូវដែលយើងកំពុងដើរក៏ដោយ ព្រះអង្គចាប់ដៃយើង ហើយយើងក្រោកឈរឡើងម្តងទៀត

ទោះបីទិសដៅនៃជីវិតខ្ញុំផ្លាស់ប្តូរ ព្រះអង្គនៅតែគង់ជាមួយខ្ញុំ ដោយសារព្រះអង្គគង់នៅជាមួយខ្ញុំ ខ្ញុំនឹងបន្តដំណើរទៅមុខទៀត

ចូរយើងសរសើរតម្កើងព្រះអម្ចាស់ ដែលគង់ជាមួយយើងនៅលើផ្លូវរបស់យើង ចូរយើងសរសើរតម្កើងព្រះអម្ចាស់ ដែលនៅជាមួយយើងជានិច្ច

ក្នុងចំណោមយើងដែលកំពុងស្វែងរកផ្លូវ សូមឱ្យព្រះអម្ចាស់ជាចំណុចកណ្តាលនៃជីវិតយើង យើងប្រាថ្នាយ៉ាងខ្លាំង ឱ្យព្រះអង្គគង់នៅជាមួយយើង`,
        bible: bibleRef('잠언 16장 9절', 'PRO.16.9', [
          [9, '사람이 마음으로 자기의 길을 계획할지라도 그 걸음을 인도하는 자는 여호와시니라']
        ])
      }
    ]
  },

  {
    no: '05',
    slug: '05',
    title: '온 땅의 주인 / 비 준비하시니',
    roman: 'On ttangui juin / Bi junbihasini',
    titleEn: 'Lord of All Creation / You Provide the Rain',
    titleKm: 'ម្ចាស់នៃផែនដីទាំងមូល / ព្រះអង្គរៀបចំភ្លៀង',
    tag: null,
    youtube: 'https://youtu.be/wFooiln1gIc?si=hgJJet7VKzWS1b3G',
    parts: [
      {
        label: '온 땅의 주인',

        labelEn: 'Lord of All Creation',

        labelKm: 'ម្ចាស់នៃផែនដីទាំងមូល',
        lyrics: `온 땅의 주인 되신 주님이
내 이름 아시며 상한 맘 돌보네
어둠을 밝히시는 새벽 별
방황하는 내 맘 주의 길 비추시네
나로 인함이 아닌 주가 행하신 일로
나의 행함이 아닌 오직 주로 인하여
나는 오늘 피었다 지는
이름 없는 꽃과 같네
바다에 이는 파도
안개와 같지만
주는 나를 붙드시고
부르짖음 들으시며
날 귀하다 하시네
주님은 나의 죄를 보시고
사랑의 눈으로 날 일으키시네
바다를 잠잠하게 하시듯
내 영혼의 폭풍 고요케 하시네
나로 인함이 아닌 주가 행하신 일로
나의 행함이 아닌 오직 주로 인하여`,
        lyricsEn: `The Lord of all the earth
Knows my name and cares for my broken heart.
The morning star that shines through the darkness
Lights my path when my heart has lost its way.

Not because of me, but because of what You have done.
Not because of my deeds, but because of You alone.

I am like a nameless flower,
Blooming today and fading away.
I am like the waves upon the sea,
Like a mist that disappears.

Yet You hold me in Your hands.
You hear my cries
And call me precious.

You see my sin, O Lord,
Yet lift me up with eyes of love.
As You calm the restless sea,
You quiet the storm within my soul.

Not because of me, but because of what You have done.
Not because of my deeds, but because of You alone.`,
        lyricsKm: `ព្រះអម្ចាស់ដែលជាម្ចាស់លើផែនដីទាំងមូល ទ្រង់ស្គាល់ឈ្មោះខ្ញុំ ហើយថែរក្សាចិត្តដែលបែកបាក់របស់ខ្ញុំ ផ្កាយព្រឹកដែលបំភ្លឺភាពងងឹត បំភ្លឺផ្លូវរបស់ខ្ញុំ នៅពេលចិត្តខ្ញុំវង្វេង

មិនមែនដោយសារខ្ញុំទេ តែដោយសារកិច្ចការដែលព្រះអង្គបានធ្វើ មិនមែនដោយសារអំពើរបស់ខ្ញុំទេ តែដោយសារព្រះអង្គតែមួយគត់

ខ្ញុំប្រៀបដូចជាផ្កាគ្មានឈ្មោះ ដែលរីកហើយក៏ស្រពោនទៅក្នុងថ្ងៃតែមួយ ខ្ញុំដូចជារលកនៅលើសមុទ្រ ដូចជាអ័ព្ទដែលរលាយបាត់

ប៉ុន្តែព្រះអង្គទ្រទ្រង់ខ្ញុំ ទ្រង់ស្តាប់សម្រែករបស់ខ្ញុំ ហើយមានបន្ទូលថា ខ្ញុំមានតម្លៃ

ព្រះអម្ចាស់ទតឃើញអំពើបាបរបស់ខ្ញុំ ប៉ុន្តែទ្រង់លើកខ្ញុំឡើងដោយព្រះនេត្រដែលពោរពេញដោយសេចក្តីស្រឡាញ់ ដូចជាទ្រង់ធ្វើឱ្យសមុទ្រស្ងប់ ទ្រង់ក៏ធ្វើឱ្យព្យុះក្នុងព្រលឹងខ្ញុំស្ងប់ដែរ

មិនមែនដោយសារខ្ញុំទេ តែដោយសារកិច្ចការដែលព្រះអង្គបានធ្វើ មិនមែនដោយសារអំពើរបស់ខ្ញុំទេ តែដោយសារព្រះអង្គតែមួយគត់`,
      },
      {
        label: '비 준비하시니',

        labelEn: 'You Provide the Rain',

        labelKm: 'ព្រះអង្គរៀបចំភ្លៀង',
        note: '후렴',
        youtube: 'https://youtu.be/95vtJk3nEOQ?si=QQ92TiSVGPItSJGi&t=448',
        lyrics: `예루살렘아
여호와를 찬송할지어다
네 하나님을
감사함으로 그 앞에 나가며
주 임재 앞에 경배해`,
        lyricsEn: `O Jerusalem,
Praise the Lord!
Come before your God
With hearts of thanksgiving,
And worship in His holy presence.`,
        lyricsKm: `ឱ ក្រុងយេរូសាឡិមអើយ ចូរសរសើរតម្កើងព្រះយេហូវ៉ា ចូរចូលទៅចំពោះព្រះជាម្ចាស់របស់អ្នក ដោយចិត្តអរព្រះគុណ ហើយថ្វាយបង្គំនៅចំពោះព្រះវត្តមានរបស់ព្រះអង្គ`,
      }
    ]
  },

  {
    no: '06',
    slug: '06',
    title: '주 예수 나의 산 소망',
    roman: 'Ju Yesu naui san somang',
    titleEn: 'Jesus, My Living Hope',
    titleKm: 'ព្រះយេស៊ូវ ជាសេចក្តីសង្ឃឹមដ៏រស់របស់ខ្ញុំ',
    tag: null,
    youtube: 'https://youtu.be/jt2qxbrexwg?si=-HLwd8TUZlrO87Ba',
    parts: [
      {
        lyrics: `닿을 수 없고 오를 수 없네
사망의 권세에 놓인 우리
절망 가운데 하늘을 보며
주의 이름 나 부를 때
어둠을 뚫고 주님의 사랑
내 영혼을 비추시네
모든 것 이미 이루신 주님
주 예수 내 산 소망

위대한 자비 형언 못하며
한없는 은혜 표현 못 해
내 죄와 수치 지기 위하여
이 땅 위에 주 오셨네
주의 십자가 날 구원하사
왕의 자녀 삼으셨네
나는 영원히 주님의 소유
주 예수 내 산 소망

할렐루야 주의 이름 찬양해
할렐루야 내게 자유 주셨네
죄의 저주 끊으신 구원의 주
그 이름 주 예수 내 산 소망

언약의 말씀 이뤄진 아침
주님의 호흡 시작됐네
죽음 이기신 유다의 사자
우리의 주 부활하셨네
예수 주 승리하셨네`,
        lyricsEn: `We could never reach it,
We could never climb our way.
We were held beneath the power of death.
In despair, we looked toward heaven
And called upon Your name.

Your love broke through the darkness
And shone upon my soul.
You have already finished all things.
Jesus, my living hope.

Your great mercy is beyond description,
Your endless grace beyond all words.
To bear my sin and all my shame,
You came down to this earth.

Your cross has rescued me
And made me a child of the King.
I belong to You forever,
Jesus, my living hope.

Hallelujah, I praise Your name!
Hallelujah, You have set me free!
The Savior who broke the curse of sin,
Jesus, my living hope!

On the morning when the promised Word was fulfilled,
The breath of the Lord began anew.
The Lion of Judah conquered death;
Our Lord has risen from the grave!
Jesus, the Lord, has won the victory!`,
        lyricsKm: `យើងមិនអាចទៅដល់ ហើយក៏មិនអាចឡើងទៅបានដែរ យើងជាប់នៅក្រោមអំណាចនៃសេចក្តីស្លាប់ នៅពេលយើងសម្លឹងទៅស្ថានសួគ៌ក្នុងភាពអស់សង្ឃឹម ហើយអំពាវនាវព្រះនាមរបស់ព្រះអង្គ

សេចក្តីស្រឡាញ់របស់ព្រះអម្ចាស់ បានទម្លុះភាពងងឹត ហើយបំភ្លឺព្រលឹងខ្ញុំ ព្រះអង្គបានបំពេញគ្រប់ការទាំងអស់រួចហើយ ព្រះយេស៊ូវ ជាសេចក្តីសង្ឃឹមដ៏រស់របស់ខ្ញុំ

ព្រះមេត្តាករុណាដ៏អស្ចារ្យ មិនអាចពិពណ៌នាបានឡើយ ព្រះគុណដ៏គ្មានព្រំដែន ក៏មិនអាចបង្ហាញជាពាក្យបានដែរ

ដើម្បីទទួលបន្ទុកអំពើបាប និងភាពអាម៉ាស់របស់ខ្ញុំ ព្រះអង្គបានយាងមកកាន់ផែនដីនេះ ឈើឆ្កាងរបស់ព្រះអង្គបានសង្គ្រោះខ្ញុំ ហើយបានធ្វើឱ្យខ្ញុំក្លាយជាកូនរបស់ព្រះមហាក្សត្រ

ខ្ញុំជាកម្មសិទ្ធិរបស់ព្រះអង្គជារៀងរហូត ព្រះយេស៊ូវ ជាសេចក្តីសង្ឃឹមដ៏រស់របស់ខ្ញុំ

ហាលេលូយ៉ា ខ្ញុំសរសើរតម្កើងព្រះនាមព្រះអង្គ ហាលេលូយ៉ា ព្រះអង្គប្រទានសេរីភាពដល់ខ្ញុំ ព្រះអង្គជាព្រះសង្គ្រោះដែលបំបាក់បណ្តាសានៃអំពើបាប ព្រះនាមព្រះយេស៊ូវ ជាសេចក្តីសង្ឃឹមដ៏រស់របស់ខ្ញុំ

ព្រឹកដែលព្រះបន្ទូលនៃសេចក្តីសន្យាបានសម្រេច ដង្ហើមរបស់ព្រះអម្ចាស់បានចាប់ផ្តើមម្តងទៀត សត្វតោនៃកុលសម្ព័ន្ធយូដា ដែលបានឈ្នះសេចក្តីស្លាប់ ព្រះអម្ចាស់របស់យើងបានរស់ឡើងវិញហើយ ព្រះយេស៊ូវ ជាព្រះអម្ចាស់ បានឈ្នះហើយ!`,
        bible: bibleRef('베드로전서 1장 3-4절', '1PE.1.3-4', [
          [3, '찬송하리로다 우리 주 예수 그리스도의 아버지 하나님이 그 많으신 긍휼대로 예수 그리스도의 죽은 자 가운데서 부활하심으로 말미암아 우리를 거듭나게 하사 산 소망이 있게 하시며'],
          [4, '썩지 않고 더럽지 않고 쇠하지 아니하는 기업을 잇게 하시나니 곧 너희를 위하여 하늘에 간직하신 것이라']
        ])
      }
    ]
  },

  {
    no: '07',
    slug: '07',
    title: '하나님께서 세상을 사랑하사',
    roman: 'Hananimkkeseo sesangeul saranghasa',
    titleEn: 'For God So Loved the World',
    titleKm: 'ដ្បិតព្រះជាម្ចាស់ស្រឡាញ់លោកិយ',
    tag: null,
    youtube: 'https://youtu.be/-n24d45myCg?si=WQ2MzZIECBkxWQTt',
    parts: [
      {
        lyrics: `하늘보다 높으신 주 사랑
바다보다 넓으신 주 사랑
나를 향한 크고 높으신 사랑
헛되고 헛된 그 모든 것
내게서 멀리 거두셨네
나의 수치 찬양 되었네
하늘보다 높으신 주 사랑
바다보다 넓으신 주 사랑
나를 향한 크고 높으신 사랑
헛되고 헛된 그 모든 것
내게서 멀리 거두셨네
나의 수치 찬양 되었네
영원히 감사드리리
주님의 그 은혜
나 찾아주신 그 사랑
오 주님의 전부 사랑해요
경배해요 나 주 위해 살리
영원토록 신실하신
주 사랑을 전하리

하나님께서 세상을 사랑하사
독생자를 주셨으니 믿는자는
영생을 얻으리
난 믿네
다시 사신 독생자`,
        lyricsEn: `Your love is higher than the heavens,
Your love is wider than the sea.
How great and how high is Your love for me!

All the empty and meaningless things
You have taken far away from me.
You have turned my shame into praise.

Your love is higher than the heavens,
Your love is wider than the sea.
How great and how high is Your love for me!

All the empty and meaningless things
You have taken far away from me.
You have turned my shame into praise.

I will give thanks forever
For Your amazing grace,
For the love that came to find me.

O Lord, I love You with all my heart.
I worship You; I will live for You.
Forever faithful, I will proclaim Your love.

For God so loved the world
That He gave His one and only Son,
That whoever believes in Him
Shall have eternal life.

I believe in the Son
Who rose again.`,
        lyricsKm: `សេចក្តីស្រឡាញ់របស់ព្រះអង្គខ្ពស់ជាងមេឃ សេចក្តីស្រឡាញ់របស់ព្រះអង្គធំទូលាយជាងសមុទ្រ សេចក្តីស្រឡាញ់ដ៏ធំធេង និងខ្ពង់ខ្ពស់របស់ព្រះអង្គចំពោះខ្ញុំ

អ្វីៗទាំងអស់ដែលឥតប្រយោជន៍ និងឥតន័យ ព្រះអង្គបានដកចេញឱ្យឆ្ងាយពីខ្ញុំ ភាពអាម៉ាស់របស់ខ្ញុំបានក្លាយជាការសរសើរតម្កើង

សេចក្តីស្រឡាញ់របស់ព្រះអង្គខ្ពស់ជាងមេឃ សេចក្តីស្រឡាញ់របស់ព្រះអង្គធំទូលាយជាងសមុទ្រ សេចក្តីស្រឡាញ់ដ៏ធំធេង និងខ្ពង់ខ្ពស់របស់ព្រះអង្គចំពោះខ្ញុំ

អ្វីៗទាំងអស់ដែលឥតប្រយោជន៍ និងឥតន័យ ព្រះអង្គបានដកចេញឱ្យឆ្ងាយពីខ្ញុំ ភាពអាម៉ាស់របស់ខ្ញុំបានក្លាយជាការសរសើរតម្កើង

ខ្ញុំនឹងអរព្រះគុណជារៀងរហូត ចំពោះព្រះគុណរបស់ព្រះអង្គ ចំពោះសេចក្តីស្រឡាញ់ដែលបានមកស្វែងរកខ្ញុំ

ឱ ព្រះអម្ចាស់អើយ ខ្ញុំស្រឡាញ់ព្រះអង្គអស់ពីចិត្ត ខ្ញុំថ្វាយបង្គំព្រះអង្គ ហើយខ្ញុំនឹងរស់នៅដើម្បីព្រះអង្គ

ខ្ញុំនឹងប្រកាសប្រាប់អ្នកដទៃ អំពីសេចក្តីស្រឡាញ់របស់ព្រះអង្គ ដែលស្មោះត្រង់អស់កល្បជានិច្ច

ដ្បិតព្រះជាម្ចាស់ស្រឡាញ់លោកិយ ហើយបានប្រទានព្រះរាជបុត្រាតែមួយរបស់ទ្រង់ ដើម្បីឱ្យអ្នកណាដែលជឿលើទ្រង់ បានទទួលជីវិតអស់កល្បជានិច្ច

ខ្ញុំជឿលើព្រះរាជបុត្រា ដែលបានរស់ឡើងវិញ`,
        bible: bibleRef('요한복음 3장 16절', 'JHN.3.16', [
          [16, '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라']
        ])
      }
    ]
  },

  {
    no: '08',
    slug: '08',
    title: '주님의 선하심',
    roman: 'Junimui seonhasim',
    titleEn: 'The Goodness of God',
    titleKm: 'សេចក្តីល្អរបស់ព្រះអម្ចាស់',
    tag: null,
    youtube: 'https://youtu.be/ErqijpGQmO4?si=gdO3-cREdzZYjZlA',
    parts: [
      {
        lyrics: `사랑해요 신실하신 나의 주님
나의 삶 주님 안에 있네
눈을 뜨는 아침부터 나 잠들기까지
오 선하신 주를 노래하리

신실하신 나의 주님
나의 삶을 인도하셨네
나의 모든 호흡 다해
오 선하신 주를 노래하리

사랑해요 나를 인도하신 주님
고난 중에도 나와 함께 하셨네
내 아버지 되시며 내 친구 되신 주
나의 삶 주님 안에 있네

주님의 선하심이 날 인도하시네
주님의 선하심이 날 지켜 주시네
주께 엎드려 나의 모든 삶 주님께 드리네`,
        lyricsEn: `I love You, my faithful Lord.
My life is found in You.
From the moment I open my eyes in the morning
Until I fall asleep at night,
I will sing of Your goodness.

You have always been faithful, Lord.
You have guided my life.
With every breath that I have,
I will sing of Your goodness.

I love You, Lord,
For You have led me through my life.
Even in the midst of suffering,
You have always been by my side.

You are my Father
And my dearest Friend.
My life is found in You.

Your goodness leads me.
Your goodness watches over me.
I bow before You
And surrender my whole life to You.`,
        lyricsKm: `ខ្ញុំស្រឡាញ់ព្រះអម្ចាស់របស់ខ្ញុំ ដែលស្មោះត្រង់ជានិច្ច ជីវិតរបស់ខ្ញុំស្ថិតនៅក្នុងព្រះអង្គ ចាប់ពីព្រឹកដែលខ្ញុំបើកភ្នែក រហូតដល់ពេលខ្ញុំដេកលក់ ខ្ញុំនឹងច្រៀងសរសើរព្រះអម្ចាស់ដ៏ល្អ

ព្រះអម្ចាស់របស់ខ្ញុំស្មោះត្រង់ជានិច្ច ព្រះអង្គបានដឹកនាំជីវិតរបស់ខ្ញុំ ដោយដង្ហើមទាំងអស់របស់ខ្ញុំ ខ្ញុំនឹងច្រៀងសរសើរព្រះអម្ចាស់ដ៏ល្អ

ខ្ញុំស្រឡាញ់ព្រះអម្ចាស់ ដែលបានដឹកនាំខ្ញុំ សូម្បីតែនៅក្នុងគ្រាលំបាក ព្រះអង្គក៏នៅជាមួយខ្ញុំដែរ

ព្រះអង្គជាព្រះវរបិតា និងជាមិត្តរបស់ខ្ញុំ ជីវិតរបស់ខ្ញុំស្ថិតនៅក្នុងព្រះអង្គ

សេចក្តីល្អរបស់ព្រះអម្ចាស់ដឹកនាំខ្ញុំ សេចក្តីល្អរបស់ព្រះអម្ចាស់ការពារខ្ញុំ ខ្ញុំក្រាបថ្វាយបង្គំព្រះអង្គ ហើយថ្វាយជីវិតទាំងមូលរបស់ខ្ញុំដល់ព្រះអង្គ`,
        bible: bibleRef('시편 23편 6절', 'PSA.23.6', [
          [6, '나의 평생에 선하심과 인자하심이 정녕 나를 따르리니 내가 여호와의 집에 영원히 거하리로다']
        ])
      }
    ]
  },

  {
    no: '09',
    slug: '09',
    title: '우리가 서로 사랑하자 / 우리 살아가는 모든 날들이',
    roman: 'Uriga seoro saranghaja / Uri saraganeun modeun naldeuri',
    titleEn: 'Let Us Love One Another / All the Days of Our Lives',
    titleKm: 'ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក / គ្រប់ថ្ងៃនៃជីវិតរបស់យើង',
    tag: '주제곡',
    youtube: 'https://youtu.be/5RGMkWIFrmU?si=cqChPScfN8B_UMBz',
    parts: [
      {
        label: '우리가 서로 사랑하자',

        labelEn: 'Let Us Love One Another',

        labelKm: 'ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក',
        lyrics: `여기 모인 우리 모두가
마음 열어 서로를 사랑하고
서로를 돌아보며 주의 사랑을
서로에게 흘려보내기를

주의 마음 가진 우리가
그의 뜻 따라 서로를 사랑하고
모두를 품어내며 그의 나라를
이곳에 이루어내기를

오라 우리가 서로 사랑하자
우리가 주를 찬양하자
주가 우릴 사랑하라 하셨으니
그 사랑으로 우리 사랑하자`,
        lyricsEn: `All of us gathered here today,
Let us open our hearts and love one another.
Let us care for one another
And let the love of the Lord flow between us.

With the heart of the Lord within us,
Let us love one another according to His will.
May we embrace everyone
And build His kingdom here among us.

Come, let us love one another!
Come, let us praise the Lord!
He has commanded us to love one another,
So let us love with the love He has given us.`,
        lyricsKm: `យើងទាំងអស់គ្នាដែលបានមកជួបជុំគ្នានៅទីនេះ សូមបើកចិត្ត ហើយស្រឡាញ់គ្នាទៅវិញទៅមក សូមយកចិត្តទុកដាក់ចំពោះគ្នា ហើយចែករំលែកសេចក្តីស្រឡាញ់របស់ព្រះអង្គដល់គ្នា

យើងដែលមានព្រះហឫទ័យរបស់ព្រះអង្គ សូមស្រឡាញ់គ្នាទៅវិញទៅមកតាមព្រះហឫទ័យរបស់ទ្រង់ សូមឱបក្រសោបមនុស្សគ្រប់គ្នា ហើយស្ថាបនានគររបស់ព្រះអង្គនៅទីនេះ

មក ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក ចូរយើងសរសើរតម្កើងព្រះអម្ចាស់ ព្រះអង្គបានបង្គាប់ឱ្យយើងស្រឡាញ់គ្នា ដូច្នេះ ចូរយើងស្រឡាញ់គ្នាដោយសេចក្តីស្រឡាញ់របស់ទ្រង់`,
        bible: bibleRef('요한1서 4장 7-8절', '1JN.4.7-8', [
          [7, '사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한것이니 사랑하는 자마다 하나님께로 나서 하나님을 알고'],
          [8, '사랑하지 아니하는 자는 하나님을 알지 못하나니 이는 하나님은 사랑이심이라']
        ])
      },
      {
        label: '우리 살아가는 모든 날들이',

        labelEn: 'All the Days of Our Lives',

        labelKm: 'គ្រប់ថ្ងៃនៃជីវិតរបស់យើង',
        note: '후렴',
        youtube: 'https://youtu.be/-xZZhbVnm_Q?si=lFN-Vj4wKBFrI_8U',
        lyrics: `우리 살아가는 모든 날들이
다 주의 숨결 속에 지어졌으니
이제 모두 모여 다 주를 찬양해
그는 영원토록 찬양받으실 주

우리 함께 찬양하며 걸어갈 이 길
우리 발걸음 그가 이끌어 주시리
잠시 넘어져도 낙심치 말 것은
시작하신 우리 주 그 끝을 이루어 주시리`,
        lyricsEn: `Every day of our lives
Was formed by the breath of the Lord.
Now let us all come together
And lift our praise to Him,
For He is worthy of praise forevermore.

As we walk this road together in worship,
He will guide each step we take.
Even when we stumble for a moment,
Let us not lose heart.
Our Lord, who began His work in us,
Will bring it to completion.`,
        lyricsKm: `គ្រប់ថ្ងៃនៃជីវិតរបស់យើង សុទ្ធតែត្រូវបានបង្កើតឡើងដោយដង្ហើមរបស់ព្រះអម្ចាស់ ឥឡូវនេះ ចូរយើងទាំងអស់គ្នាមកជួបជុំគ្នា ហើយសរសើរតម្កើងព្រះអម្ចាស់ ដ្បិតទ្រង់សក្តិសមនឹងទទួលការសរសើរជារៀងរហូត

ផ្លូវដែលយើងនឹងដើរជាមួយគ្នាក្នុងការសរសើរតម្កើង ព្រះអង្គនឹងដឹកនាំគ្រប់ជំហានរបស់យើង ទោះបីយើងដួលមួយភ្លែតក៏ដោយ កុំបាក់ទឹកចិត្តឡើយ ព្រះអម្ចាស់ដែលបានចាប់ផ្តើមកិច្ចការនេះ នឹងបំពេញវារហូតដល់ចប់`,
        bible: bibleRef('빌립보서 1장 6절', 'PHP.1.6', [
          [6, '너희 속에 착한 일을 시작하신 이가 그리스도 예수의 날까지 이루실 줄을 우리가 확신하노라']
        ])
      }
    ]
  },

  {
    no: '10',
    slug: '10',
    title: '친구여 함께 노래해',
    roman: 'Chinguyeo hamkke noraehae',
    titleEn: 'My Friend, Come and Sing',
    titleKm: 'មិត្តអើយ ចូរយើងច្រៀងជាមួយគ្នា',
    tag: null,
    youtube: 'https://youtu.be/xs1G1mJS_Vw?si=Lr28L_if_jqTEbFE',
    parts: [
      {
        lyrics: `아직 우린 여기에서 기다려
너와 우리의 영원한 집을 바라며
너가 돌아오기를
우리 함께 걷기를
염원하며 이 노랠 부르네

세미하게 들려오는 목소리
사랑으로 우릴 불러주시네
더 깊은 곳으로
더 낮은 곳으로
당신의 길을 걸어가려네

그 사랑이 흐르고 흘러
너에게 닿기를
아직 주를 모르는 영혼에게까지

이 사랑은 우리를 통해
주가 일하시네
내 친구여 함께 노래해
아름다운 우리 주의 사랑을`,
        lyricsEn: `We are still waiting here,
Looking toward the eternal home that awaits us all.
We sing this song with hope,
Longing for you to return
So that we may walk together again.

A gentle voice is calling,
Calling us with love.
Deeper still,
Lower still,
We long to walk in Your ways.

May that love keep flowing
Until it reaches you,
Even reaching souls
Who do not yet know the Lord.

Through us, this love
Becomes the way the Lord works in the world.
My friend, come and sing with me
Of the beautiful love of our Lord.`,
        lyricsKm: `យើងនៅតែរង់ចាំនៅទីនេះ ដោយសម្លឹងទៅកាន់ផ្ទះដ៏អស់កល្បរបស់អ្នក និងយើង យើងច្រៀងបទនេះដោយក្តីសង្ឃឹម រង់ចាំឱ្យអ្នកត្រឡប់មកវិញ ហើយឱ្យយើងបានដើរជាមួយគ្នា

សំឡេងដ៏ស្រទន់មួយបានបន្លឺឡើង ព្រះអង្គហៅយើងដោយសេចក្តីស្រឡាញ់ ទៅកាន់ទីជ្រៅជាងមុន ទៅកាន់ទីទាបជាងមុន យើងចង់ដើរតាមមាគ៌ារបស់ព្រះអង្គ

សូមឱ្យសេចក្តីស្រឡាញ់នោះហូរបន្តទៅមុខ ហើយទៅដល់អ្នក រហូតដល់ព្រលឹងទាំងឡាយដែលមិនទាន់ស្គាល់ព្រះអម្ចាស់

សេចក្តីស្រឡាញ់នេះ ធ្វើឱ្យព្រះអម្ចាស់បំពេញកិច្ចការរបស់ទ្រង់តាមរយៈយើង មិត្តអើយ ចូរយើងច្រៀងជាមួយគ្នា អំពីសេចក្តីស្រឡាញ់ដ៏ស្រស់ស្អាតរបស់ព្រះអម្ចាស់`,
        bible: bibleRef('베드로전서 4장 8절', '1PE.4.8', [
          [8, '무엇보다도 열심으로 서로 사랑할찌니 사랑은 허다한 죄를 덮느니라']
        ])
      }
    ]
  },

  {
    no: '11',
    slug: '11',
    title: '달리기',
    roman: 'Dalligi',
    titleEn: 'The Race',
    titleKm: 'ការរត់ប្រណាំង',
    artist: '웨이홈',
    tag: null,
    youtube: 'https://youtu.be/wmS1Ng_71Jc?si=2GzHQVeer9jjtXow',
    parts: [
      {
        lyrics: `다시 숨을 고르고 거칠은 이 길을 달리기
고난도 실망도 나를 멈출 순 없네
끝이 없는 달리기 하나님과 나의 이야기
난 꿈꾸고 있어 결국 승리의 그 날을

때론 눈물 나는 일들이 내겐 너무 버거워
지쳐 포기하고 싶을 땐
날 부르신 주님 내게 독수리 같은 새 힘을 주시리

때론 눈물 나는 일들이 내겐 너무 버거워
지쳐 포기하고 싶을 땐
날 부르신 주님 내게 독수리 같은 새 힘을 주시리

다시 숨을 고르고 거칠은 이 길을 달리기
고난도 실망도 나를 멈출 순 없네
끝이 없는 달리기 하나님과 나의 이야기
난 꿈꾸고 있어 결국 승리의 그 날을

다시 숨을 고르고 거칠은 이 길을 달리기
고난도 실망도 나를 멈출 순 없네
내가 달려야 할 길
나의 젊음을 다 쏟아낼
내 사랑 내 운명
나의 주님께 달리기`,
        lyricsEn: `I catch my breath once more
And run along this rugged road.
Neither hardship nor disappointment
Can ever make me stop.

This endless race
Is the story of God and me.
I dream of that coming day,
The day I will finally win the victory.

Sometimes the things that bring me tears
Are more than I can bear.
When I grow weary and want to give up,
The Lord who called me
Will renew my strength
Like the strength of an eagle.

Sometimes the things that bring me tears
Are more than I can bear.
When I grow weary and want to give up,
The Lord who called me
Will renew my strength
Like the strength of an eagle.

I catch my breath once more
And run along this rugged road.
Neither hardship nor disappointment
Can ever make me stop.

This endless race
Is the story of God and me.
I dream of that coming day,
The day I will finally win the victory.

I catch my breath once more
And run along this rugged road.
Neither hardship nor disappointment
Can ever make me stop.

This is the race I am called to run.
I will pour out all my youthful strength.
My love, my destiny,
I run toward my Lord.`,
        lyricsKm: `ខ្ញុំដកដង្ហើមឱ្យស្រួលម្តងទៀត ហើយរត់តាមផ្លូវដ៏លំបាកនេះ ទុក្ខលំបាក និងការខកចិត្ត មិនអាចបញ្ឈប់ខ្ញុំបានឡើយ

ការរត់ដែលគ្មានទីបញ្ចប់ ជារឿងរ៉ាវរវាងព្រះជាម្ចាស់ និងខ្ញុំ ខ្ញុំកំពុងសុបិនឃើញថ្ងៃនោះ ជាថ្ងៃដែលខ្ញុំនឹងទទួលជ័យជម្នះ

ពេលខ្លះ រឿងដែលធ្វើឱ្យខ្ញុំស្រក់ទឹកភ្នែក ធ្ងន់ធ្ងរពេកសម្រាប់ខ្ញុំ នៅពេលខ្ញុំនឿយហត់ ហើយចង់បោះបង់ ព្រះអម្ចាស់ដែលបានហៅខ្ញុំ នឹងប្រទានកម្លាំងថ្មីដល់ខ្ញុំ ដូចជាកម្លាំងរបស់សត្វឥន្ទ្រី

ពេលខ្លះ រឿងដែលធ្វើឱ្យខ្ញុំស្រក់ទឹកភ្នែក ធ្ងន់ធ្ងរពេកសម្រាប់ខ្ញុំ នៅពេលខ្ញុំនឿយហត់ ហើយចង់បោះបង់ ព្រះអម្ចាស់ដែលបានហៅខ្ញុំ នឹងប្រទានកម្លាំងថ្មីដល់ខ្ញុំ ដូចជាកម្លាំងរបស់សត្វឥន្ទ្រី

ខ្ញុំដកដង្ហើមឱ្យស្រួលម្តងទៀត ហើយរត់តាមផ្លូវដ៏លំបាកនេះ ទុក្ខលំបាក និងការខកចិត្ត មិនអាចបញ្ឈប់ខ្ញុំបានឡើយ

ការរត់ដែលគ្មានទីបញ្ចប់ ជារឿងរ៉ាវរវាងព្រះជាម្ចាស់ និងខ្ញុំ ខ្ញុំកំពុងសុបិនឃើញថ្ងៃនោះ ជាថ្ងៃដែលខ្ញុំនឹងទទួលជ័យជម្នះ

ខ្ញុំដកដង្ហើមឱ្យស្រួលម្តងទៀត ហើយរត់តាមផ្លូវដ៏លំបាកនេះ ទុក្ខលំបាក និងការខកចិត្ត មិនអាចបញ្ឈប់ខ្ញុំបានឡើយ

ផ្លូវដែលខ្ញុំត្រូវរត់ ខ្ញុំនឹងលះបង់យុវវ័យរបស់ខ្ញុំទាំងស្រុង សេចក្តីស្រឡាញ់របស់ខ្ញុំ ជោគវាសនារបស់ខ្ញុំ ខ្ញុំនឹងរត់ទៅរកព្រះអម្ចាស់របស់ខ្ញុំ`,
      }
    ]
  },

  {
    no: '12',
    slug: '12',
    title: '우리가 주를 더욱 사랑하고',
    roman: 'Uriga jureul deouk saranghago',
    titleEn: 'Loving the Lord More and More',
    titleKm: 'យើងស្រឡាញ់ព្រះអម្ចាស់កាន់តែខ្លាំងឡើង',
    tag: null,
    youtube: 'https://youtu.be/AEQAG9uoEJ0?si=cEHveIq1wNf6msdI',
    parts: [
      {
        lyrics: `한 사랑 우리게 찾아왔네
자기 몸 희생하며
확증해 내신 사랑

먼저 본이 되신 이가
우리게 명하시네
네 맘과 뜻 힘 다해
주를 사랑하라

무엇보다 뜨겁게 서로 사랑할지니
사랑이 모든 것을 덮어주네
사랑 가운데 우리 온전히 살아갈 때
우리 삶이 그의 기쁨 되네

우리가 주를 더욱 사랑하고
그 사랑 우리 삶에 녹여내어
서로를 더욱 섬기고 사랑할 때
하나님 나라 임하겠네

우리가 주를 더욱 노래하고
이곳에 함께 모여 찬양하니
모든 두렴과 걱정은 떠나가네
주 사랑만이 이곳에 가득해`,
        lyricsEn: `A love has come to us,
A love revealed through sacrifice,
A love that gave itself completely.

The One who first showed us the way
Has given us this command:
Love the Lord
With all your heart, soul, and strength.

Love one another with the deepest love,
For love covers everything.
When we live our lives fully in love,
Our lives become a delight to Him.

May we love the Lord more and more,
Letting His love become part of our lives.
As we serve and love one another more deeply,
The kingdom of God will come among us.

May we sing to the Lord more and more,
Gathering here together to worship Him.
All our fears and worries will fade away;
Only the love of the Lord will fill this place.`,
        lyricsKm: `សេចក្តីស្រឡាញ់មួយបានមកដល់យើង ជាសេចក្តីស្រឡាញ់ដែលបានបញ្ជាក់យ៉ាងច្បាស់ តាមរយៈការលះបង់ព្រះកាយរបស់ទ្រង់

ព្រះអង្គដែលបានធ្វើជាគំរូមុនគេ បានបង្គាប់យើងថា ចូរស្រឡាញ់ព្រះអម្ចាស់ ដោយអស់ពីចិត្ត អស់ពីព្រលឹង និងអស់ពីកម្លាំង

ចូរស្រឡាញ់គ្នាទៅវិញទៅមកដោយក្តីស្រឡាញ់ដ៏កក់ក្តៅបំផុត ដ្បិតសេចក្តីស្រឡាញ់គ្របបាំងអ្វីៗទាំងអស់ នៅពេលយើងរស់នៅយ៉ាងពេញលេញក្នុងសេចក្តីស្រឡាញ់ ជីវិតរបស់យើងនឹងក្លាយជាសេចក្តីរីករាយរបស់ព្រះអង្គ

យើងស្រឡាញ់ព្រះអម្ចាស់កាន់តែខ្លាំងឡើង ហើយបញ្ចូលសេចក្តីស្រឡាញ់របស់ទ្រង់ទៅក្នុងជីវិតរបស់យើង នៅពេលយើងបម្រើ និងស្រឡាញ់គ្នាកាន់តែខ្លាំង នគររបស់ព្រះជាម្ចាស់នឹងមកដល់

យើងច្រៀងសរសើរព្រះអម្ចាស់កាន់តែខ្លាំងឡើង យើងមកជួបជុំគ្នានៅទីនេះដើម្បីសរសើរតម្កើងទ្រង់ ការភ័យខ្លាច និងការព្រួយបារម្ភទាំងអស់នឹងរលាយបាត់ មានតែសេចក្តីស្រឡាញ់របស់ព្រះអង្គប៉ុណ្ណោះដែលពេញពាសនៅទីនេះ`,
      }
    ]
  },

  {
    no: '13',
    slug: '13',
    title: '사랑의 계절',
    roman: 'Sarangui gyejeol',
    titleEn: 'The Season of Love',
    titleKm: 'រដូវកាលនៃសេចក្តីស្រឡាញ់',
    artist: 'WELOVE',
    tag: '앵콜',
    youtube: 'https://youtu.be/ufkYcQsrt4c?si=_UbjZcLl8FIac88G',
    parts: [
      {
        lyrics: `하늘 끝에 서 있는 우릴 한데 모아주신 주님
선하신 손길로 보살펴 주시네
당신 품 안에서 용서와 사랑 가르치신 주님
아버지, 당신 같은 분은 없네

이날은 주의 날
기쁨과 웃음 가득한 우릴 이끌어 주신 당신을 찬양해
우릴 살리신 주님
내 마음에 당신의 집 세우시네

주의 계절은, 사랑의 계절은
이날부터 새날까지 이르리`,
        lyricsEn: `Lord, You gathered us together,
Though we stood at the ends of the earth.
You care for us
With Your gracious and loving hands.

Lord, within Your embrace,
You taught us forgiveness and love.
O Father,
There is no one like You.

This is the day of the Lord!
We praise You,
For You have led us
Into a place filled with joy and laughter.

Lord, You have given us life,
And You are building Your home within my heart.

Your season,
The season of love,
Will continue from this day
Into every new day to come.`,
        lyricsKm: `ព្រះអម្ចាស់ដែលបានប្រមូលយើង ដែលឈរនៅចុងបំផុតនៃផ្ទៃមេឃ ឱ្យមកជួបជុំគ្នា ទ្រង់ថែរក្សាយើងដោយព្រះហស្តដ៏ល្អរបស់ទ្រង់

ព្រះអម្ចាស់ដែលបានបង្រៀនយើង អំពីការអត់ទោស និងសេចក្តីស្រឡាញ់នៅក្នុងព្រះហស្តរបស់ទ្រង់ ឱ ព្រះវរបិតាអើយ គ្មាននរណាម្នាក់ដូចជាព្រះអង្គឡើយ

ថ្ងៃនេះជាថ្ងៃរបស់ព្រះអម្ចាស់ យើងសរសើរតម្កើងព្រះអង្គ ដែលបានដឹកនាំយើង ឱ្យពោរពេញដោយសេចក្តីអំណរ និងសំណើច

ព្រះអម្ចាស់ដែលបានប្រទានជីវិតដល់យើង កំពុងសង់លំនៅរបស់ទ្រង់នៅក្នុងចិត្តខ្ញុំ

រដូវកាលរបស់ព្រះអង្គ រដូវកាលនៃសេចក្តីស្រឡាញ់ នឹងបន្តចាប់ពីថ្ងៃនេះ រហូតដល់ថ្ងៃថ្មីដែលនឹងមកដល់`,
      }
    ]
  }
];
