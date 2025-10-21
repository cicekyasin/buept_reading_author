import type { CEFRLevel } from './types';

export const UI_TEXT = {
  // Header
  headerSubtitle: {
    en: 'Generate research-backed EFL reading materials instantly.',
    tr: 'Araştırma destekli EFL okuma materyallerini anında oluşturun.',
  },
  roleLabel: {
    en: 'Viewing as:',
    tr: 'Görüntüleme modu:',
  },
  roleStudent: {
    en: 'Student',
    tr: 'Öğrenci',
  },
  roleInstructor: {
    en: 'Instructor',
    tr: 'Eğitmen',
  },
  appModeDesigner: {
    en: 'Lesson Designer',
    tr: 'Ders Tasarımcısı',
  },
  appModeExam: {
    en: 'BUEPT Practice',
    tr: 'BUEPT Alıştırma',
  },
  languageTooltipTR: {
    en: 'Switch to Turkish',
    tr: 'Türkçe\'ye geç',
  },
  languageTooltipEN: {
    en: 'Switch to English',
    tr: 'İngilizce\'ye geç',
  },
  themeTooltipLight: {
    en: 'Switch to light mode',
    tr: 'Aydınlık moda geç',
  },
  themeTooltipDark: {
    en: 'Switch to dark mode',
    tr: 'Karanlık moda geç',
  },
  historyTooltip: {
    en: 'View session history',
    tr: 'Oturum geçmişini görüntüle',
  },
  historyTitle: {
    en: 'Session History',
    tr: 'Oturum Geçmişi',
  },
  historyEmpty: {
    en: 'No plans generated yet.',
    tr: 'Henüz plan oluşturulmadı.',
  },
  // Input Form
  topicLabel: {
    en: 'Theme / Topic',
    tr: 'Tema / Konu',
  },
  topicPlaceholder: {
    en: "e.g., 'A day at the Grand Bazaar'",
    tr: "örn. 'Kapalıçarşı'da bir gün'",
  },
  randomizeTopicButton: {
    en: 'Randomize',
    tr: 'Rastgele',
  },
  randomizeTopicTooltip: {
    en: 'Generate a random topic idea',
    tr: 'Rastgele bir konu fikri oluştur',
  },
  cefrLabel: {
    en: 'Target CEFR Level',
    tr: 'Hedef CEFR Seviyesi',
  },
  advancedLabel: {
    en: 'Advanced',
    tr: 'Gelişmiş',
  },
  levelDescriptionLabel: {
    en: 'Level Description:',
    tr: 'Seviye Açıklaması:',
  },
  quickSetsLabel: {
    en: 'Quick Sets',
    tr: 'Hızlı Ayarlar',
  },
  passageLengthLabel: {
    en: 'Passage Length',
    tr: 'Metin Uzunluğu',
  },
  questionCountLabel: {
    en: 'Number of Questions',
    tr: 'Soru Sayısı',
  },
  questionTypesLabel: {
    en: 'Question Types',
    tr: 'Soru Tipleri',
  },
  advancedInstructionsLabel: {
    en: 'General Instructions',
    tr: 'Genel Talimatlar',
  },
  advancedInstructionsOptional: {
    en: '(Optional)',
    tr: '(İsteğe Bağlı)',
  },
  advancedInstructionsPlaceholder: {
    en: "e.g., 'Include a character named Ali.'",
    tr: "örn. 'Ali adında bir karakter ekle.'",
  },
  pedagogicalPreferencesLabel: {
    en: 'Pedagogical Preferences',
    tr: 'Pedagojik Tercihler',
  },
  pedagogicalFocusLabel: {
    en: 'Custom Pedagogical Focus',
    tr: 'Özel Pedagojik Odak',
  },
  pedagogicalFocusPlaceholder: {
    en: "e.g., 'Focus on using the present perfect tense.'",
    tr: "örn. 'Present perfect zamanını kullanmaya odaklan.'",
  },
  exemplarPassageLabel: {
    en: 'Exemplar Passage (Style Guide)',
    tr: 'Örnek Metin (Stil Rehberi)',
  },
  exemplarPassagePlaceholder: {
    en: 'Paste a short passage here to guide the AI\'s writing style and tone.',
    tr: 'Yapay zekanın yazı stilini ve tonunu yönlendirmek için buraya kısa bir metin yapıştırın.',
  },
  exemplarQuestionsLabel: {
    en: 'Exemplar Questions (Style Guide)',
    tr: 'Örnek Sorular (Stil Rehberi)',
  },
  exemplarQuestionsPlaceholder: {
    en: 'Provide 1-2 example questions to guide the AI\'s question style.',
    tr: 'Yapay zekanın soru stilini yönlendirmek için 1-2 örnek soru sağlayın.',
  },
  customVocabularyLabel: {
    en: 'Required Vocabulary (comma-separated)',
    tr: 'Gerekli Kelimeler (virgülle ayrılmış)',
  },
  customVocabularyPlaceholder: {
    en: 'e.g., sustainable, ecosystem, conservation',
    tr: 'örn. sürdürülebilir, ekosistem, koruma',
  },
  generateButton: {
    en: 'Generate Lesson Plan',
    tr: 'Ders Planı Oluştur',
  },
  generatingButton: {
    en: 'Generating...',
    tr: 'Oluşturuluyor...',
  },
  loadButton: {
    en: 'Load',
    tr: 'Yükle',
  },
  loadButtonAriaLabel: {
    en: 'Load saved lesson',
    tr: 'Kaydedilen dersi yükle',
  },
  autosaveRestorePrompt: {
    en: 'You have an unsaved draft. Would you like to restore it?',
    tr: 'Kaydedilmemiş bir taslağınız var. Geri yüklemek ister misiniz?',
  },
  restoreButton: {
    en: 'Restore',
    tr: 'Geri Yükle',
  },
  discardButton: {
    en: 'Discard',
    tr: 'Vazgeç',
  },
  // Question Modal
  passageModalTitle: {
    en: 'Customize Your Lesson',
    tr: 'Dersinizi Özelleştirin',
  },
  passageModalSubtitle: {
    en: 'Choose the desired length for the passage and number of questions.',
    tr: 'Metin için istediğiniz uzunluğu ve soru sayısını seçin.',
  },
  questionModalTitle: {
    en: 'Step 2: Customize Questions',
    tr: 'Adım 2: Soruları Özelleştirin',
  },
  questionModalSubtitle: {
    en: 'Choose the number and types of questions to generate.',
    tr: 'Oluşturulacak soru sayısını ve tiplerini seçin.',
  },
  questionModalConfirmButton: {
    en: 'Confirm & Generate',
    tr: 'Onayla & Oluştur',
  },
  backButton: {
    en: 'Back',
    tr: 'Geri',
  },
  questionTypeDescPlaceholder: {
    en: 'Hover over a type to see its description.',
    tr: 'Açıklamayı görmek için bir türün üzerine gelin.',
  },
  // Collapsed Input
  collapsedInputTitle: {
    en: 'Lesson Generated!',
    tr: 'Ders Planı Oluşturuldu!',
  },
  collapsedInputSubtitle: {
    en: 'Your lesson plan is ready. You can edit the settings again if needed.',
    tr: 'Ders planınız hazır. Gerekirse ayarları yeniden düzenleyebilirsiniz.',
  },
  collapsedInputEditButton: {
    en: 'Edit Settings',
    tr: 'Ayarları Düzenle',
  },
  // Output Display
  generationFailed: {
    en: 'Generation Failed',
    tr: 'Oluşturma Başarısız',
  },
  outputPlaceholderTitle: {
    en: 'Your Lesson Plan Will Appear Here',
    tr: 'Ders Planınız Burada Görünecek',
  },
  outputPlaceholderSubtitle: {
    en: 'Fill out the form and click "Generate" to get started.',
    tr: 'Başlamak için formu doldurun ve "Oluştur" düğmesine tıklayın.',
  },
  saveTooltip: {
    en: 'Save Lesson',
    tr: 'Dersi Kaydet',
  },
  printTooltip: {
    en: 'Print Lesson',
    tr: 'Dersi Yazdır',
  },
  pdfTooltip: {
    en: 'Download as PDF',
    tr: 'PDF olarak indir',
  },
  expandTooltip: {
    en: 'Expand View',
    tr: 'Görünümü Genişlet',
  },
  collapseTooltip: {
    en: 'Collapse View',
    tr: 'Görünümü Daralt',
  },
  rationaleTitle: {
    en: 'Pedagogical Rationale',
    tr: 'Pedagojik Gerekçe',
  },
  passageTitle: {
    en: 'Reading Passage',
    tr: 'Okuma Metni',
  },
  vocabularyTitle: {
    en: 'Key Vocabulary',
    tr: 'Anahtar Kelimeler',
  },
  questionsTitle: {
    en: 'Comprehension Questions',
    tr: 'Anlama Soruları',
  },
  questionTrueFalseTitle: {
    en: 'True / False',
    tr: 'Doğru / Yanlış',
  },
  questionMultipleChoiceTitle: {
    en: 'Multiple Choice',
    tr: 'Çoktan Seçmeli',
  },
  questionShortAnswerTitle: {
    en: 'Short Answer',
    tr: 'Kısa Cevap',
  },
  answerKey: {
    en: 'Answer Key',
    tr: 'Cevap Anahtarı',
  },
  sourcesTitle: {
    en: 'Possible Sources',
    tr: 'Olası Kaynaklar',
  },
  searchingSources: {
    en: 'Searching for sources...',
    tr: 'Kaynaklar aranıyor...',
  },
  noSourcesFound: {
    en: 'No sources were found for this passage.',
    tr: 'Bu metin için kaynak bulunamadı.',
  },
  studentChoiceTitle: {
    en: 'Your Lesson is Ready!',
    tr: 'Dersin Hazır!',
  },
  studentChoiceTakeTest: {
    en: 'Take Test Online',
    tr: 'Testi Çevrimiçi Çöz',
  },
  studentChoiceDownloadPdf: {
    en: 'Download PDF for Practice',
    tr: 'Alıştırma için PDF İndir',
  },
  // Feedback
  feedbackQuestion: {
    en: 'Was this lesson plan helpful?',
    tr: 'Bu ders planı yardımcı oldu mu?',
  },
  feedbackThanks: {
    en: 'Thank you for your feedback!',
    tr: 'Geri bildiriminiz için teşekkürler!',
  },
  feedbackGood: {
    en: 'Good lesson plan',
    tr: 'İyi ders planı',
  },
  feedbackBad: {
    en: 'Bad lesson plan',
    tr: 'Kötü ders planı',
  },
  feedbackGoodTooltip: {
    en: 'This was helpful',
    tr: 'Bu yardımcı oldu',
  },
  feedbackBadTooltip: {
    en: 'This was not helpful',
    tr: 'Bu yardımcı olmadı',
  },
  // Loader
  loaderDefaultMessage: {
    en: 'Generating your lesson...',
    tr: 'Dersiniz oluşturuluyor...',
  },
  loaderSubMessage: {
    en: 'This may take a moment.',
    tr: 'Bu işlem biraz zaman alabilir.',
  },
  // Interactive Lesson Test
  lessonTestQuit: {
    en: 'Quit Test',
    tr: 'Testten Çık',
  },
  lessonTestProgress: {
    en: 'Question',
    tr: 'Soru',
  },
  lessonTestTimeLeft: {
    en: 'Time Left',
    tr: 'Kalan Süre',
  },
  lessonTestScore: {
    en: 'Score',
    tr: 'Skor',
  },
  lessonTestNext: {
    en: 'Next',
    tr: 'Sonraki',
  },
  lessonTestSubmit: {
    en: 'Submit & See Results',
    tr: 'Gönder ve Sonuçları Gör',
  },
  lessonTestGrading: {
    en: 'Grading...',
    tr: 'Değerlendiriliyor...',
  },
  lessonTestCorrect: {
    en: 'Correct',
    tr: 'Doğru',
  },
  lessonTestIncorrect: {
    en: 'Incorrect',
    tr: 'Yanlış',
  },
  lessonTestYourAnswer: {
    en: 'Your Answer',
    tr: 'Cevabınız',
  },
  lessonTestCorrectAnswer: {
    en: 'Correct Answer',
    tr: 'Doğru Cevap',
  },
  // BUEPT Exam Generator
  bueptGeneratorTitle: {
    en: 'BUEPT Practice Exam Generator',
    tr: 'BUEPT Alıştırma Sınavı Oluşturucu',
  },
  bueptGeneratorSubtitle: {
    en: 'Generate a practice section for the BUEPT-style reading exam on-demand.',
    tr: 'İsteğe bağlı olarak BUEPT tarzı okuma sınavı için bir alıştırma bölümü oluşturun.',
  },
  bueptGenerateReading1: {
    en: 'Generate Reading 1 Practice',
    tr: 'Okuma 1 Alıştırması Oluştur',
  },
  bueptGenerateReading2: {
    en: 'Generate Reading 2 Practice',
    tr: 'Okuma 2 Alıştırması Oluştur',
  },
  bueptGeneratingButton: {
    en: 'Generating Section...',
    tr: 'Bölüm Oluşturuluyor...',
  },
  bueptLoaderMessage: {
    en: 'Generating your BUEPT exam section...',
    tr: 'BUEPT sınav bölümünüz oluşturuluyor...',
  },
  bueptLoaderSubMessage: {
    en: 'This is a complex task and may take up to a minute.',
    tr: 'Bu karmaşık bir işlemdir ve bir dakika kadar sürebilir.',
  },
  bueptReading1Title: {
    en: 'Reading 1: Literal Comprehension',
    tr: 'Okuma 1: Doğrudan Anlama',
  },
  bueptReading2Title: {
    en: 'Reading 2: Inference & Academic Reading',
    tr: 'Okuma 2: Çıkarım & Akademik Okuma',
  },
  bueptSuggestedTime: {
    en: 'Suggested Time',
    tr: 'Önerilen Süre',
  },
  bueptMinutes: {
    en: 'minutes',
    tr: 'dakika',
  },
  bueptShowAnswers: {
    en: 'Show Answers',
    tr: 'Cevapları Göster',
  },
  bueptHideAnswers: {
    en: 'Hide Answers',
    tr: 'Cevapları Gizle',
  },
  bueptAnswer: {
    en: 'Answer',
    tr: 'Cevap',
  },
  bueptAnswerKeyTitle: {
    en: 'Answer Key',
    tr: 'Cevap Anahtarı',
  },
  bueptDownloadKey: {
    en: 'Download Answer Key',
    tr: 'Cevap Anahtarını İndir',
  },
  bueptSourceCredit: {
    en: 'Source Credit (based on)',
    tr: 'Kaynak (dayanmaktadır)',
  },
  bueptChooseSection: {
    en: 'Choose a section to begin.',
    tr: 'Başlamak için bir bölüm seçin.',
  },
  bueptTakeReading1: {
    en: 'Take Reading 1',
    tr: 'Okuma 1\'i Çöz',
  },
  bueptTakeReading2: {
    en: 'Take Reading 2',
    tr: 'Okuma 2\'yi Çöz',
  },
  bueptSubmitButton: {
    en: 'Submit & Check Answers',
    tr: 'Gönder ve Cevapları Kontrol Et',
  },
  bueptGradingButton: {
    en: 'Grading...',
    tr: 'Değerlendiriliyor...',
  },
  bueptScore: {
    en: 'Score',
    tr: 'Skor',
  },
  bueptCorrect: {
    en: 'Correct',
    tr: 'Doğru',
  },
  bueptIncorrect: {
    en: 'Incorrect',
    tr: 'Yanlış',
  },
  bueptYourAnswer: {
    en: 'Your Answer',
    tr: 'Cevabınız',
  },
  bueptCorrectAnswer: {
    en: 'Correct Answer',
    tr: 'Doğru Cevap',
  },
  bueptBackToOverview: {
    en: 'Back to Exam Overview',
    tr: 'Sınav Genel Görünümüne Geri Dön',
  },
  bueptBackToSelection: {
    en: 'Back to Selection',
    tr: 'Bölüm Seçimine Dön',
  },
  bueptStartSection: {
    en: 'Start Section',
    tr: 'Bölüme Başla',
  },
  bueptNext: {
    en: 'Next',
    tr: 'Sonraki',
  },
  bueptQuit: {
    en: 'Quit Test',
    tr: 'Testten Çık',
  },
  bueptQuestionProgress: {
    en: 'Question',
    tr: 'Soru',
  },
  bueptTimeLeft: {
    en: 'Time Left',
    tr: 'Kalan Süre',
  },
  bueptPracticeReadyTitle: {
    en: 'Your Practice Section is Ready!',
    tr: 'Alıştırma Bölümünüz Hazır!',
  },
  bueptTakeTestOnline: {
    en: 'Take Test Online',
    tr: 'Testi Çevrimiçi Çöz',
  },
  bueptDownloadPdf: {
    en: 'Download PDF for Offline Practice',
    tr: 'Çevrimdışı Alıştırma için PDF İndir',
  },
  bueptBackToGeneration: {
    en: 'Generate Another Section',
    tr: 'Başka Bir Bölüm Oluştur',
  },
  bueptFeedbackQuestion: {
    en: 'How did you find this practice section?',
    tr: 'Bu alıştırma bölümünü nasıl buldunuz?',
  },
  bueptFeedbackOptionEasy: {
    en: 'Too Easy',
    tr: 'Çok Kolay',
  },
  bueptFeedbackOptionGood: {
    en: 'Just Right',
    tr: 'Tam Kıvamında',
  },
  bueptFeedbackOptionHard: {
    en: 'Too Hard',
    tr: 'Çok Zor',
  },
  bueptFeedbackThanks: {
    en: 'Thank you for your feedback!',
    tr: 'Geri bildiriminiz için teşekkürler!',
  },
};

export const LOADING_MESSAGES: Record<string, { en: string; tr: string }> = {
  CONNECTING: {
    en: 'Connecting to the FLED-AI...',
    tr: 'FLED-AI\'ya bağlanılıyor...',
  },
  CRAFTING: {
    en: 'Crafting a level-appropriate reading passage...',
    tr: 'Seviyeye uygun bir okuma metni hazırlanıyor...',
  },
  SELECTING: {
    en: 'Selecting key Tier 2 vocabulary...',
    tr: 'Anahtar Tier 2 kelimeler seçiliyor...',
  },
  WRITING: {
    en: 'Writing comprehension questions...',
    tr: 'Anlama soruları yazılıyor...',
  },
  FORMULATING: {
    en: 'Formulating the pedagogical rationale...',
    tr: 'Pedagojik gerekçe formüle ediliyor...',
  },
  ALMOST: {
    en: 'Almost there...',
    tr: 'Neredeyse hazır...',
  },
};

export const CEFR_DESCRIPTIONS_TRANSLATED: Record<CEFRLevel, { en: string, tr: string }> = {
  'A1': {
    en: 'Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type.',
    tr: 'Somut ihtiyaçları karşılamaya yönelik bilinen, günlük ifadeleri ve çok temel kalıpları anlayabilir ve kullanabilir.',
  },
  'A1+': {
    en: 'At the high end of A1. Can interact in a simple way provided the other person talks slowly and clearly.',
    tr: 'A1 seviyesinin üst düzeyinde. Karşısındaki kişi yavaş ve net konuştuğu sürece basit bir şekilde etkileşim kurabilir.',
  },
  'A2-': {
    en: 'At the low end of A2. Can understand sentences and frequently used expressions related to areas of most immediate relevance.',
    tr: 'A2 seviyesinin alt düzeyinde. En temel kişisel alanlarla ilgili cümleleri ve sık kullanılan ifadeleri anlayabilir.',
  },
  'A2': {
    en: 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.',
    tr: 'Bilinen ve alışılmış konularda basit ve doğrudan bilgi alışverişi gerektiren basit ve rutin görevlerde iletişim kurabilir.',
  },
  'A2+': {
    en: 'At the high end of A2. Can describe in simple terms aspects of their background, immediate environment and matters in areas of immediate need.',
    tr: 'A2 seviyesinin üst düzeyinde. Kendi geçmişini, yakın çevresini ve acil ihtiyaç alanlarındaki konuları basit terimlerle tanımlayabilir.',
  },
  'B1-': {
    en: 'At the low end of B1. Starting to understand the main points of clear standard input on familiar matters.',
    tr: 'B1 seviyesinin alt düzeyinde. Bilinen konulardaki net ve standart girdilerin ana noktalarını anlamaya başlar.',
  },
  'B1': {
    en: 'Can deal with most situations likely to arise whilst travelling. Can produce simple connected text on topics which are familiar or of personal interest.',
    tr: 'Seyahat sırasında ortaya çıkabilecek çoğu durumla başa çıkabilir. Bilinen veya kişisel ilgi alanına giren konularda basit ve bağlantılı metinler üretebilir.',
  },
  'B1+': {
    en: 'At the high end of B1. Can describe experiences, dreams, and ambitions and briefly give reasons for opinions.',
    tr: 'B1 seviyesinin üst düzeyinde. Deneyimleri, hayalleri ve hedefleri anlatabilir ve görüşleri için kısaca nedenler belirtebilir.',
  },
  'B2-': {
    en: 'At the low end of B2. Starting to understand the main ideas of complex text on both concrete and abstract topics.',
    tr: 'B2 seviyesinin alt düzeyinde. Hem somut hem de soyut konulardaki karmaşık metinlerin ana fikirlerini anlamaya başlar.',
  },
  'B2': {
    en: 'Can interact with a degree of fluency that makes regular interaction with native speakers quite possible without strain for either party.',
    tr: 'Ana dili konuşanlarla her iki taraf için de zorluk yaratmadan düzenli etkileşim kurmayı mümkün kılan bir akıcılık düzeyinde etkileşimde bulunabilir.',
  },
  'B2+': {
    en: 'At the high end of B2. Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue.',
    tr: 'B2 seviyesinin üst düzeyinde. Geniş bir konu yelpazesinde net, ayrıntılı metinler üretebilir ve güncel bir konuda bir bakış açısını açıklayabilir.',
  },
};

export const PASSAGE_LENGTH_OPTIONS_TRANSLATED: { label: { en: string, tr: string }, value: number, description: { en: string, tr: string } }[] = [
  { label: { en: 'Quick Read', tr: 'Hızlı Okuma' }, value: 250, description: { en: '~1/2 Page', tr: '~1/2 Sayfa' } },
  { label: { en: 'Standard', tr: 'Standart' }, value: 500, description: { en: '~1 Page', tr: '~1 Sayfa' } },
  { label: { en: 'In-Depth', tr: 'Detaylı' }, value: 750, description: { en: '~1.5 Pages', tr: '~1.5 Sayfa' } },
  { label: { en: 'Extended', tr: 'Uzun' }, value: 1000, description: { en: '~2+ Pages', tr: '~2+ Sayfa' } },
];