/* ══════════════════════════════════════════════════════════
   i18n.js — 언어 바꾸기 (한국어 · English · ភាសាខ្មែរ)

   무엇을 옮기고 무엇을 두는가
     옮긴다   메뉴·버튼·안내문·입력칸·공연 정보처럼 '길을 안내하는 글'
     안 옮긴다
       · 곡 가사        저작권이 있는 찬양곡이다. 옮기면 2차적저작물이 된다
       · 성경 본문      언어마다 공인된 번역본이 따로 있다. 임의로 옮기지
                        않고, 바깥 성경 사이트 링크를 그 언어판으로 바꾼다
       · 말씀 나눔 글   팀원이 쓴 개인적인 글이다
       · 사람 이름      고유명사

   한국어는 따로 담지 않는다. HTML 에 적힌 글이 곧 한국어판이라,
   처음 한 번 그대로 기억해 두었다가 되돌릴 때 쓴다.
══════════════════════════════════════════════════════════ */

const I18N_LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'km', label: 'ភាសាខ្មែរ' }
];

/* 크메르 글자는 이 손글씨 폰트에 하나도 없다. 캄보디아어를 고를 때만
   구글 폰트를 불러온다. 쓰지 않는 사람에게 짐을 지우지 않으려는 것. */
/* Noto Sans Khmer 는 중립적인 고딕이라 이 사이트의 종이·손글씨 톤과 겉돈다.
   Noto Serif Khmer 는 획에 맺음이 있어 본문 서체와 결이 맞는다.
   가중치는 범위(400..700) 로 적어야 한다 — 세미콜론 형식은 400 을 돌려준다. */
const KHMER_FONT = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400..700&display=swap';

/* 성경 사이트(YouVersion)의 언어별 주소와 번역본 번호 */
const BIBLE_LOCALE = {
  ko: { path: 'ko', version: 88  },   // 개역한글
  en: { path: 'en', version: 111 },   // NIV
  km: { path: 'km', version: 1988 }   // ព្រះគម្ពីរ
};

const I18N = {
  en: {
    /* 탭 */
    'tab.main': 'Home', 'tab.songs': 'Songs', 'tab.word': 'Devotions',
    'tab.artists': 'Members', 'tab.story': 'Our Story',

    /* 메인 */
    'main.eyebrow': 'Live Concert 2026',
    'main.title': 'Young adults who gather for worship',
    'main.lead': 'Let us love one another!',
    'main.cta.open': 'See concert details',
    'main.join': 'Join us',
    'main.calendar': 'Add to calendar',
    'main.label.date': 'Date', 'main.label.time': 'Time', 'main.label.place': 'Place',
    'main.venue': 'Hyangsang Church, 3F Gymnasium',
    'main.date': 'Saturday, December 19, 2026',
    'main.address': '140 Eondong-ro, Giheung-gu, Yongin',
    'main.time': '7:30 - 9:00 PM',

    /* 곡 리스트 */
    'songs.eyebrow': 'Setlist', 'songs.title': 'Songs',
    'songs.hint': 'Tap a song to see its lyrics and a verse to reflect on',
    'songs.playAll': 'Listen to all songs',
    'songs.lyrics': 'Lyrics', 'songs.verse': 'Verse',
    'songs.sectionLabel': 'About the songs',
    'songs.youtube': 'Listen on YouTube',
    'songs.back': 'Songs', 'songs.readVerse': 'Read the verse',
    'songs.prev': '← Previous', 'songs.next': 'Next →',
    'songs.note.lead': 'About the order',
    'songs.more': 'Read more', 'songs.less': 'Show less',
    'songs.count': '{n} songs',
    'songs.tagLead': 'Theme song', 'songs.tagEncore': 'Encore', 'songs.tagPray': 'Prayer',
    'role.drums': 'Drums', 'role.bass': 'Bass', 'role.guitar': 'Electric guitar',
    'role.pianoMain': 'Piano (lead)', 'role.pianoSecond': 'Piano (second)',

    /* 멤버 */
    'artists.eyebrow': 'Members', 'artists.title': 'Our team',
    'team.singer': 'Vocals', 'team.band': 'Band', 'team.marketing': 'Promotion',
    'team.film': 'Film', 'team.staff': 'Staff', 'team.props': 'Props',
    'member.church': 'Church', 'member.instagram': 'Instagram',
    'member.say': 'A word', 'member.verse': 'Favorite verse',

    /* 참여 신청 */
    'rsvp.eyebrow': 'Join us', 'rsvp.title': 'Join us',
    'rsvp.name': 'Name', 'rsvp.namePh': 'Your name',
    'rsvp.church': 'Church', 'rsvp.churchPh': 'Your church',
    'rsvp.msg': 'What you hope for from this concert',
    'rsvp.msgPh': 'Share anything you like',
    'rsvp.consentTitle': 'About the information we collect',
    'rsvp.consentItems': 'Name, church, and what you write',
    'rsvp.consentPurpose': 'To estimate how many people are coming',
    'rsvp.consentKeep': 'Deleted after the concert',
    'rsvp.consentLabel': 'Collected items', 'rsvp.purposeLabel': 'Purpose',
    'rsvp.keepLabel': 'Kept until',
    'rsvp.agree': 'I agree. You are welcome to come even if you do not.',
    'rsvp.submit': 'Send', 'rsvp.sending': 'Sending…',
    'rsvp.doneTitle': 'We have your note', 'rsvp.doneText': 'See you there',
    'rsvp.close': 'Close',

    /* 말씀 나눔 */
    'word.eyebrow': 'Devotion', 'word.title': 'Devotions',
    'word.hint': 'We share what we read each week',
    'word.lockTitle': 'This space is for our team',
    'word.lockText': 'Enter the passcode shared with the team.',
    'word.passPh': 'Passcode', 'word.enter': 'Enter', 'word.checking': 'Checking…',
    'word.write': 'Share yours', 'word.byWeek': 'By week', 'word.byPerson': 'By person',
    'word.openTitle': 'Open to everyone', 'word.openHint': 'Swipe to see more',
    'word.read': 'Read', 'word.more': 'Read more',
    'word.anon': 'Anonymous', 'word.views': 'Views', 'word.delete': 'Delete',
    'word.thisWeek': 'This week', 'word.lastWeek': 'Last week',
    'word.weeklyLabel': 'This week we read together',
    'word.writeTitle': 'Share a devotion',
    'word.verse': 'Verse', 'word.versePh': 'e.g. 1 John 4:7',
    'word.body': 'Your reflection', 'word.bodyPh': 'A few sentences is plenty',
    'word.namePh': 'Leave blank to post anonymously',
    'word.scopeTitle': 'Who can see this?',
    'word.scopeNow': 'Everyone', 'word.scopeNowNote': 'Anyone can read it, no passcode needed.',
    'word.scopeTeam': 'Our team only', 'word.scopeTeamNote': 'Deleted after the concert. It never leaves the team.',
    'word.scopeLater': 'Share after the concert', 'word.scopeLaterNote': 'It stays on the public page afterwards.',
    'word.send': 'Share', 'word.doneTitle': 'Thank you for sharing',
    'word.doneText': 'We will read it and pray with you',
    'word.empty': 'No devotions yet', 'word.emptyText': 'Be the first. A few sentences is plenty.',
    'word.openBadge': 'Public', 'word.laterBadge': 'Share later',

    /* 메인 아래 말씀 — 저작권이 없는 공개 번역본(World English Bible)을 쓴다.
       다른 영어 번역본은 대부분 저작권이 있어 임의로 실을 수 없다. */
    'msg.lead': 'Let us love one another',
    'msg.p1': 'Beloved, let us love one another,<br>for love is of God;<br>and everyone who loves has been born of God,<br>and knows God.',
    'msg.p2': 'He who doesn\u2019t love doesn\u2019t know God,<br>for <em>God is love</em>.',
    'msg.ref': '1 John 4:7-8, World English Bible',

    /* 곡 — 가사는 옮기지 않는다 (저작권이 있는 찬양곡) */
    'songs.koNotice': 'Lyrics are shown in Korean. Song titles include a romanization to help you search for them.',

    /* 팀 소개 — 사장님이 쓰신 글을 옮긴 것이라 검토가 필요합니다 */
    'story.title': 'Young adults<br>who gather<br>for worship',
    'story.sub': 'The story of why we came together',
    'story.ch1': '01. Setting up',
    'story.h1': 'We are living in a time<br>that changes far too quickly',
    'story.b1': 'The world moves faster and faster,<br>and our eyes drift naturally<br>toward the things we can see.',
    'story.ch2': '02. A question',
    'story.h2': 'And then one day<br>a thought came to us',
    'story.b2': 'In a world this busy,<br>are we forgetting God<br>far too easily?',
    'story.ch3': '03. Deciding',
    'story.h3': 'And young adults especially -<br>are we slowly losing our <em>worship</em><br>toward God?',
    'story.b3': 'So we began.<br>We found the lights ourselves and carried the instruments.<br>We had nothing, but we had the heart.',
    'story.ch4': '04. A small beginning',
    'story.ch5': '05. Worship begins',
    'story.ch6': '06. Together',
    'story.ch7': '07. Community',
    'story.h7': 'We believe',
    'story.b7': 'that this small beginning becomes a time to look to God again,<br>and the start of more young adults who worship.',
    'story.ch8': '08. A wider echo',
    'story.h8': 'We hope our worship<br>echoes out<br>into the world',
    'story.finale': 'May worship keep<br>echoing out<br><strong>into the world</strong>',
    'story.seeInfo': 'See concert details',
    'story.support': 'Support us',

    /* 콘티 한마디 */
    'note.p1': 'This year our theme song is <b>"Let us love one another."</b>',
    'note.p2': 'We did not want those words to end as a resolution, or as a confession made only on that one day. So before that confession, we built the set list so that we would first look at the fact that God loved us first.',
    'note.p3': 'We remember the love shown through the cross and the resurrection, and the love that holds us even in our weakest moments. In that love we rise again and walk with Him. We love one another not because we have enough strength to love, but because we were loved first.',
    'note.p4': 'We hope that love opens our hearts, that we listen to one another, and that it turns into small acts of care for whoever is worn out. And we hope that love does not stay among us alone, but flows out to friends, to family, and to one person who does not yet know Him.',
    'note.p5': 'We hope that "Let us love one another," sung together today, carries on after the concert ends - and even when we stumble while walking together - as a confession of a life that leans on the God who began a good work among us.',

    /* 공유 · 후원 */
    'share.title': 'Share', 'share.copy': 'Copy link', 'share.copied': 'Link copied',
    'donate.title': 'Thank you for supporting us',
    'donate.label': 'Account', 'donate.copy': 'Copy account number',

    /* 공통 */
    'common.close': 'Close', 'common.loading': 'Loading…',
    'common.notice': 'Lyrics and Bible passages are shown in Korean.'
  },

  km: {
    'tab.main': 'ទំព័រដើម', 'tab.songs': 'បទចម្រៀង', 'tab.word': 'ការរំពឹងគិត',
    'tab.artists': 'សមាជិក', 'tab.story': 'រឿងរ៉ាវ',

    'main.eyebrow': 'Live Concert 2026',
    'main.title': 'យុវជនដែលជួបជុំគ្នាដោយស្រឡាញ់ការសរសើរតម្កើង',
    'main.lead': 'ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក!',
    'main.cta.open': 'មើលព័ត៌មានកម្មវិធី',
    'main.join': 'ចូលរួម',
    'main.calendar': 'បន្ថែមទៅប្រតិទិន',
    'main.label.date': 'កាលបរិច្ឆេទ', 'main.label.time': 'ម៉ោង', 'main.label.place': 'ទីកន្លែង',
    'main.venue': 'ព្រះវិហារ Hyangsang ជាន់ទី៣',
    'main.date': 'ថ្ងៃសៅរ៍ ទី១៩ ខែធ្នូ ឆ្នាំ២០២៦',
    'main.address': '140 Eondong-ro, Giheung-gu, Yongin',
    'main.time': 'ម៉ោង ៧:៣០ - ៩:០០ ល្ងាច',

    'songs.eyebrow': 'Setlist', 'songs.title': 'បទចម្រៀង',
    'songs.hint': 'ចុចលើបទចម្រៀង ដើម្បីមើលអត្ថបទ និងខព្រះគម្ពីរ',
    'songs.playAll': 'ស្តាប់ទាំងអស់',
    'songs.lyrics': 'អត្ថបទ', 'songs.verse': 'ខព្រះគម្ពីរ',
    'songs.sectionLabel': 'អំពីបទចម្រៀង',
    'songs.youtube': 'ស្តាប់នៅ YouTube',
    'songs.back': 'បទចម្រៀង', 'songs.readVerse': 'មើលខព្រះគម្ពីរ',
    'songs.prev': '← មុន', 'songs.next': 'បន្ទាប់ →',
    'songs.note.lead': 'អំពីលំដាប់បទ',
    'songs.more': 'អានបន្ថែម', 'songs.less': 'បង្រួម',
    'songs.count': 'បទចម្រៀង {n}',
    'songs.tagLead': 'បទចម្បង', 'songs.tagEncore': 'បទបន្ថែម', 'songs.tagPray': 'ការអធិស្ឋាន',
    'role.drums': 'ស្គរ', 'role.bass': 'បាស', 'role.guitar': 'ហ្គីតាអគ្គិសនី',
    'role.pianoMain': 'ព្យាណូ (មេ)', 'role.pianoSecond': 'ព្យាណូ (ទីពីរ)',

    'artists.eyebrow': 'Members', 'artists.title': 'ក្រុមរបស់យើង',
    'team.singer': 'អ្នកចម្រៀង', 'team.band': 'ក្រុមតន្ត្រី', 'team.marketing': 'ផ្សព្វផ្សាយ',
    'team.film': 'ថតវីដេអូ', 'team.staff': 'បុគ្គលិក', 'team.props': 'សម្ភារៈ',
    'member.church': 'ព្រះវិហារ', 'member.instagram': 'Instagram',
    'member.say': 'ពាក្យមួយម៉ាត់', 'member.verse': 'ខព្រះគម្ពីរពេញចិត្ត',

    'rsvp.eyebrow': 'Join us', 'rsvp.title': 'ចុះឈ្មោះចូលរួម',
    'rsvp.name': 'ឈ្មោះ', 'rsvp.namePh': 'ឈ្មោះរបស់អ្នក',
    'rsvp.church': 'ព្រះវិហារ', 'rsvp.churchPh': 'ព្រះវិហាររបស់អ្នក',
    'rsvp.msg': 'អ្វីដែលអ្នករំពឹងពីកម្មវិធីនេះ',
    'rsvp.msgPh': 'សរសេរតាមចិត្តរបស់អ្នក',
    'rsvp.consentTitle': 'អំពីព័ត៌មានដែលយើងប្រមូល',
    'rsvp.consentItems': 'ឈ្មោះ ព្រះវិហារ និងអ្វីដែលអ្នកសរសេរ',
    'rsvp.consentPurpose': 'ដើម្បីដឹងចំនួនអ្នកចូលរួម',
    'rsvp.consentKeep': 'លុបចោលបន្ទាប់ពីកម្មវិធី',
    'rsvp.consentLabel': 'ព័ត៌មានប្រមូល', 'rsvp.purposeLabel': 'គោលបំណង',
    'rsvp.keepLabel': 'រក្សាទុករហូតដល់',
    'rsvp.agree': 'ខ្ញុំយល់ព្រម។ បើមិនយល់ព្រម អ្នកក៏អាចមកចូលរួមបានដែរ។',
    'rsvp.submit': 'ផ្ញើ', 'rsvp.sending': 'កំពុងផ្ញើ…',
    'rsvp.doneTitle': 'យើងទទួលបានហើយ', 'rsvp.doneText': 'ជួបគ្នានៅទីនោះ',
    'rsvp.close': 'បិទ',

    'word.eyebrow': 'Devotion', 'word.title': 'ការរំពឹងគិត',
    'word.hint': 'យើងចែករំលែកព្រះបន្ទូលជារៀងរាល់សប្តាហ៍',
    'word.lockTitle': 'កន្លែងនេះសម្រាប់ក្រុមរបស់យើង',
    'word.lockText': 'សូមបញ្ចូលលេខសម្ងាត់ដែលបានចែករំលែក។',
    'word.passPh': 'លេខសម្ងាត់', 'word.enter': 'ចូល', 'word.checking': 'កំពុងពិនិត្យ…',
    'word.write': 'ចែករំលែក', 'word.byWeek': 'តាមសប្តាហ៍', 'word.byPerson': 'តាមបុគ្គល',
    'word.openTitle': 'បើកសម្រាប់គ្រប់គ្នា', 'word.openHint': 'អូសដើម្បីមើលបន្ថែម',
    'word.read': 'អាន', 'word.more': 'អានបន្ថែម',
    'word.anon': 'អនាមិក', 'word.views': 'អ្នកអាន', 'word.delete': 'លុប',
    'word.thisWeek': 'សប្តាហ៍នេះ', 'word.lastWeek': 'សប្តាហ៍មុន',
    'word.weeklyLabel': 'ព្រះបន្ទូលសប្តាហ៍នេះ',
    'word.writeTitle': 'ចែករំលែកការរំពឹងគិត',
    'word.verse': 'ខព្រះគម្ពីរ', 'word.versePh': 'ឧ. ១យ៉ូហាន ៤:៧',
    'word.body': 'ការរំពឹងគិតរបស់អ្នក', 'word.bodyPh': 'ប្រយោគពីរបីក៏គ្រប់គ្រាន់ដែរ',
    'word.namePh': 'ទុកទទេ ដើម្បីចែករំលែកជាអនាមិក',
    'word.scopeTitle': 'នរណាអាចមើលឃើញ?',
    'word.scopeNow': 'គ្រប់គ្នា', 'word.scopeNowNote': 'អ្នកណាក៏អានបាន ដោយមិនចាំបាច់លេខសម្ងាត់។',
    'word.scopeTeam': 'ក្រុមយើងប៉ុណ្ណោះ', 'word.scopeTeamNote': 'លុបបន្ទាប់ពីកម្មវិធី។ មិនចេញក្រៅក្រុមទេ។',
    'word.scopeLater': 'បើកចំហបន្ទាប់ពីកម្មវិធី', 'word.scopeLaterNote': 'នឹងនៅលើទំព័រសាធារណៈ។',
    'word.send': 'ចែករំលែក', 'word.doneTitle': 'អរគុណសម្រាប់ការចែករំលែក',
    'word.doneText': 'យើងនឹងអាន និងអធិស្ឋានជាមួយអ្នក',
    'word.empty': 'មិនទាន់មានការរំពឹងគិតទេ', 'word.emptyText': 'សរសេរជាដំបូង។ ប្រយោគពីរបីក៏គ្រប់គ្រាន់។',
    'word.openBadge': 'សាធារណៈ', 'word.laterBadge': 'បើកក្រោយ',

    /* 메인 아래 말씀은 캄보디아어 대신 영어로 둔다 (요청) */
    'msg.lead': 'Let us love one another',
    'msg.p1': 'Beloved, let us love one another,<br>for love is of God;<br>and everyone who loves has been born of God,<br>and knows God.',
    'msg.p2': 'He who doesn\u2019t love doesn\u2019t know God,<br>for <em>God is love</em>.',
    'msg.ref': '1 John 4:7-8, World English Bible',

    'songs.koNotice': 'អត្ថបទចម្រៀងបង្ហាញជាភាសាកូរ៉េ។ ឈ្មោះបទមានអក្សរឡាតាំង ដើម្បីងាយស្រួលស្វែងរក។',

    'story.title': 'យុវជន<br>ដែលជួបជុំគ្នា<br>ដោយស្រឡាញ់ការសរសើរតម្កើង',
    'story.sub': 'រឿងរ៉ាវនៃការជួបជុំគ្នារបស់យើង',
    'story.ch1': '០១. ការរៀបចំ',
    'story.h1': 'យើងកំពុងរស់នៅក្នុងសម័យ<br>ដែលផ្លាស់ប្តូរយ៉ាងលឿន',
    'story.b1': 'ពិភពលោកដំណើរការកាន់តែលឿន<br>ហើយភ្នែករបស់យើងងាកទៅរក<br>អ្វីដែលមើលឃើញដោយធម្មជាតិ។',
    'story.ch2': '០២. សំណួរ',
    'story.h2': 'រួចមកថ្ងៃមួយ<br>គំនិតមួយបានចូលមកក្នុងយើង',
    'story.b2': 'ក្នុងពិភពដ៏រវល់នេះ<br>តើយើងកំពុងភ្លេចព្រះ<br>យ៉ាងងាយស្រួលពេកឬទេ?',
    'story.ch3': '០៣. ការសម្រេចចិត្ត',
    'story.h3': 'ជាពិសេសយុវជន —<br>តើយើងកំពុងបាត់បង់ <em>ការសរសើរតម្កើង</em><br>ចំពោះព្រះបន្តិចម្តងៗឬទេ?',
    'story.b3': 'ដូច្នេះយើងបានចាប់ផ្តើម។<br>យើងរកភ្លើងដោយខ្លួនឯង និងលីឧបករណ៍តន្ត្រី។<br>យើងគ្មានអ្វីទេ ប៉ុន្តែយើងមានចិត្ត។',
    'story.ch4': '០៤. ការចាប់ផ្តើមតូច',
    'story.ch5': '០៥. ការសរសើរតម្កើងចាប់ផ្តើម',
    'story.ch6': '០៦. ជាមួយគ្នា',
    'story.ch7': '០៧. សហគមន៍',
    'story.h7': 'យើងជឿ',
    'story.b7': 'ថាការចាប់ផ្តើមតូចនេះ នឹងក្លាយជាពេលវេលាមើលទៅព្រះម្តងទៀត<br>និងជាការចាប់ផ្តើមនៃយុវជនកាន់តែច្រើនដែលសរសើរតម្កើងព្រះ។',
    'story.ch8': '០៨. សំឡេងកាន់តែធំ',
    'story.h8': 'យើងសង្ឃឹមថាការសរសើរតម្កើងរបស់យើង<br>នឹងបន្លឺឡើង<br>នៅក្នុងពិភពលោក',
    'story.finale': 'សូមឲ្យការសរសើរតម្កើង<br>បន្លឺឡើងជាបន្តបន្ទាប់<br><strong>នៅក្នុងពិភពលោក</strong>',
    'story.seeInfo': 'មើលព័ត៌មានកម្មវិធី',
    'story.support': 'គាំទ្រយើង',

    'note.p1': 'បទចម្រៀងប្រធានបទឆ្នាំនេះគឺ <b>«ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក»។</b>',
    'note.p2': 'យើងមិនចង់ឲ្យពាក្យទាំងនេះបញ្ចប់ត្រឹមការសន្យា ឬជាការប្រកាសតែនៅថ្ងៃនោះទេ។ ដូច្នេះមុនការប្រកាសនោះ យើងបានរៀបចំលំដាប់បទ ដើម្បីឲ្យយើងមើលឃើញជាមុនថា ព្រះបានស្រឡាញ់យើងមុនគេ។',
    'note.p3': 'យើងចងចាំសេចក្តីស្រឡាញ់ដែលបានបង្ហាញតាមរយៈឈើឆ្កាង និងការរស់ឡើងវិញ និងសេចក្តីស្រឡាញ់ដែលទ្រទ្រង់យើងសូម្បីក្នុងពេលទន់ខ្សោយ។ ក្នុងសេចក្តីស្រឡាញ់នោះ យើងក្រោកឡើងម្តងទៀត ហើយដើរជាមួយព្រះអង្គ។ យើងស្រឡាញ់គ្នាមិនមែនព្រោះយើងមានកម្លាំងគ្រប់គ្រាន់ទេ ប៉ុន្តែព្រោះយើងត្រូវបានស្រឡាញ់មុនគេ។',
    'note.p4': 'យើងសង្ឃឹមថាសេចក្តីស្រឡាញ់នោះនឹងបើកចិត្តយើង ឲ្យយើងស្តាប់គ្នាទៅវិញទៅមក និងក្លាយជាទង្វើតូចៗនៃការយកចិត្តទុកដាក់ចំពោះអ្នកដែលហត់នឿយ។ ហើយយើងសង្ឃឹមថាសេចក្តីស្រឡាញ់នោះមិននៅត្រឹមយើងទេ តែហូរទៅដល់មិត្តភក្តិ គ្រួសារ និងមនុស្សម្នាក់ដែលមិនទាន់ស្គាល់ព្រះអង្គ។',
    'note.p5': 'យើងសង្ឃឹមថា «ចូរយើងស្រឡាញ់គ្នាទៅវិញទៅមក» ដែលយើងច្រៀងជាមួយគ្នាថ្ងៃនេះ នឹងបន្តបន្ទាប់ពីកម្មវិធីបញ្ចប់ — និងសូម្បីពេលយើងជំពប់ដួលពេលដើរជាមួយគ្នា — ជាការប្រកាសនៃជីវិតដែលពឹងផ្អែកលើព្រះ ដែលបានចាប់ផ្តើមកិច្ចការល្អក្នុងចំណោមយើង។',

    'share.title': 'ចែករំលែក', 'share.copy': 'ចម្លងតំណ', 'share.copied': 'បានចម្លងតំណ',
    'donate.title': 'អរគុណសម្រាប់ការគាំទ្រ',
    'donate.label': 'គណនី', 'donate.copy': 'ចម្លងលេខគណនី',

    'common.close': 'បិទ', 'common.loading': 'កំពុងផ្ទុក…',
    'common.notice': 'អត្ថបទចម្រៀង និងខព្រះគម្ពីរ បង្ហាញជាភាសាកូរ៉េ។'
  }
};

/* ── 상태 ─────────────────────────────────────────────── */

let _lang = 'ko';
const _origin = new WeakMap();   // 요소별 한국어 원문

function currentLang() { return _lang; }

function _langStore(v) {
  try {
    if (v === undefined) return localStorage.getItem('site-lang');
    localStorage.setItem('site-lang', v);
    return v;
  } catch (e) { return null; }
}

/** 처음 들어온 사람의 브라우저 언어를 본다 */
function _guessLang() {
  const saved = _langStore();
  if (saved && I18N_LANGS.some(l => l.code === saved)) return saved;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('km')) return 'km';
  if (nav.startsWith('ko')) return 'ko';
  return nav ? 'en' : 'ko';
}

function t(key, fallback) {
  if (_lang === 'ko') return fallback !== undefined ? fallback : key;
  const table = I18N[_lang] || {};
  if (table[key] !== undefined) return table[key];
  return fallback !== undefined ? fallback : (I18N.en[key] !== undefined ? I18N.en[key] : key);
}

/** 크메르 폰트는 필요할 때만 */
function _ensureKhmerFont() {
  if (document.getElementById('khmerFont')) return;
  const link = document.createElement('link');
  link.id = 'khmerFont';
  link.rel = 'stylesheet';
  link.href = KHMER_FONT;
  document.head.appendChild(link);
}

/** data-i18n 이 붙은 모든 곳을 지금 언어로 바꾼다 */
/* data-i18n* 속성이 달린 마크업만 현재 언어로 바꾼다 */
function _applyAttrs() {
  document.documentElement.lang = _lang;
  document.documentElement.classList.toggle('is-km', _lang === 'km');
  if (_lang === 'km') _ensureKhmerFont();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!_origin.has(el)) _origin.set(el, el.textContent);
    el.textContent = _lang === 'ko' ? _origin.get(el) : t(el.dataset.i18n, _origin.get(el));
  });

  /* 줄바꿈이 리듬을 만드는 제목들은 <br> 를 살려야 한다.
     여기 들어가는 글은 내가 적어 둔 번역문뿐이고 사용자가 넣은 글이 아니다. */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    if (!_origin.has(el)) _origin.set(el, el.innerHTML);
    el.innerHTML = _lang === 'ko' ? _origin.get(el) : t(el.dataset.i18nHtml, _origin.get(el));
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    if (!_origin.has(el)) _origin.set(el, el.getAttribute('placeholder') || '');
    el.setAttribute('placeholder',
      _lang === 'ko' ? _origin.get(el) : t(el.dataset.i18nPh, _origin.get(el)));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    if (!_origin.has(el)) _origin.set(el, el.getAttribute('aria-label') || '');
    el.setAttribute('aria-label',
      _lang === 'ko' ? _origin.get(el) : t(el.dataset.i18nAria, _origin.get(el)));
  });

}

function applyLang() {
  _applyAttrs();
  // 자바스크립트가 그려 넣은 화면도 다시 그린다.
  // 그 과정에서 위에서 번역해 둔 마크업이 다시 그려질 수 있으므로
  // 끝난 뒤 한 번 더 적용한다. (_applyAttrs 는 onLangChange 를 부르지 않아 되돌지 않는다)
  if (typeof onLangChange === 'function') {
    onLangChange(_lang);
    _applyAttrs();
  }
}

function setLang(code) {
  if (!I18N_LANGS.some(l => l.code === code)) return;
  _lang = code;
  _langStore(code);
  applyLang();
  const box = document.getElementById('langMenu');
  if (box) box.hidden = true;
  document.querySelectorAll('.lang-opt').forEach(b => {
    const on = b.dataset.lang === code;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
  });
  const now = document.getElementById('langNow');
  if (now) now.textContent = (I18N_LANGS.find(l => l.code === code) || {}).label || code;
}

function toggleLangMenu() {
  const box = document.getElementById('langMenu');
  if (box) box.hidden = !box.hidden;
}

/** 성경 링크를 지금 언어판으로 */
function bibleUrlFor(usfm) {
  const loc = BIBLE_LOCALE[_lang] || BIBLE_LOCALE.ko;
  return 'https://www.bible.com/' + loc.path + '/bible/' + loc.version + '/' + usfm;
}

_lang = _guessLang();
