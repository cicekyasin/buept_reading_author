import { GoogleGenAI, Type } from '@google/genai';
import type { LessonPlan, Source, CEFRLevel, ComprehensionQuestion, BueptReadingSection } from '../types';

// FIX: Initialize the GoogleGenAI client. The API key must be read from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A creative and engaging title for the lesson plan based on the topic.' },
    cefrLevel: { type: Type.STRING, description: 'The target CEFR level for this lesson plan.' },
    pedagogicalRationale: { type: Type.STRING, description: 'A brief explanation of the pedagogical approach and why the text and activities are suitable for the target CEFR level. This should be 2-4 sentences.' },
    readingPassage: { type: Type.STRING, description: 'The reading passage itself, tailored to the topic, CEFR level, and desired length. It should be engaging and contextually rich.' },
    keyVocabulary: {
      type: Type.ARRAY,
      description: 'A list of 5-7 key Tier 2 vocabulary words from the passage that are appropriate for the CEFR level.',
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: 'The vocabulary word.' },
          partOfSpeech: { type: Type.STRING, description: 'The part of speech (e.g., noun, verb, adjective).' },
          definition: { type: Type.STRING, description: 'A simple, student-friendly definition of the word.' },
          exampleSentence: { type: Type.STRING, description: 'An example sentence using the word in context, different from the one in the passage.' },
        },
        required: ['word', 'partOfSpeech', 'definition', 'exampleSentence'],
      },
    },
    comprehensionQuestions: {
      type: Type.ARRAY,
      description: 'A list of comprehension questions about the passage. The types of questions should be a balanced mix of "true-false", "multiple-choice", and "short-answer".',
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'The comprehension question.' },
          type: { 
            type: Type.STRING, 
            description: "The type of question. Must be one of: 'true-false', 'multiple-choice', or 'short-answer'." 
          },
          answer: { 
            type: Type.STRING, 
            description: "The correct answer to the question. For 'true-false', this should be 'True' or 'False'. For 'multiple-choice', this should be one of the provided options. For 'short-answer', this should be a concise, correct response."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 strings representing the options for a 'multiple-choice' question. This field is ONLY required for 'multiple-choice' questions and should be omitted otherwise.",
            items: { type: Type.STRING }
          }
        },
        required: ['question', 'type', 'answer'],
      },
    },
  },
  required: ['title', 'cefrLevel', 'pedagogicalRationale', 'readingPassage', 'keyVocabulary', 'comprehensionQuestions'],
};


export const generateLessonPlan = async (
  topic: string,
  cefrLevel: CEFRLevel,
  advancedInstructions: string,
  passageLength: number,
  numberOfQuestions: number,
  exemplarPassage: string,
  exemplarQuestions: string,
  pedagogicalFocus: string,
  customVocabulary: string
): Promise<LessonPlan> => {
  const structureExample = (bodyCount: string) => `It must be formatted with double line breaks between paragraphs (like \\n\\n). Example:\\n[Introduction text]\\n\\n[Body paragraph 1 text]\\n\\n... (${bodyCount}) ...\\n\\n[Conclusion text]`;

  let paragraphInstruction = '';
  if (passageLength <= 300) { // Quick Read (~250 words)
      paragraphInstruction = `**CRITICAL STRUCTURE:** The passage MUST have an introduction, 1-2 body paragraphs, and a conclusion. ${structureExample('1-2 body paragraphs')}`;
  } else if (passageLength <= 600) { // Standard (~500 words)
      paragraphInstruction = `**CRITICAL STRUCTURE:** The passage MUST have an introduction, 2-3 body paragraphs, and a conclusion. ${structureExample('2-3 body paragraphs')}`;
  } else { // In-Depth & Extended (750+ words)
      paragraphInstruction = `**CRITICAL STRUCTURE:** The passage MUST have an introduction, at least 3-4 well-developed body paragraphs, and a conclusion. ${structureExample('3-4+ body paragraphs')}`;
  }


  const prompt = `
    Generate a complete EFL/ESL lesson plan for a reading passage.

    **Topic:** "${topic}"
    **Target CEFR Level:** ${cefrLevel}
    **Approximate Passage Word Count:** ${passageLength} words.
    
    ${customVocabulary ? `**Required Vocabulary:** You MUST naturally integrate the following comma-separated words into the reading passage: "${customVocabulary}". The words must be used in a way that is contextually appropriate for the topic and linguistically appropriate for the target CEFR level. If a word is too advanced, you may use a simpler form of it if appropriate, but you must still use the word.` : ''}
    ${pedagogicalFocus ? `**Core Pedagogical Focus:** "${pedagogicalFocus}"` : ''}
    ${exemplarPassage ? `**Style Guide (Exemplar Passage):** Emulate the style, tone, and sentence structure of this text: "${exemplarPassage}"` : ''}
    ${exemplarQuestions ? `**Question Style Guide (Exemplar Questions):** Model the new questions on the style and cognitive level of these examples: "${exemplarQuestions}"` : ''}

    **Instructions:**
    1.  **Title:** Create a catchy title related to the topic.
    2.  **Pedagogical Rationale:** Write a short (2-4 sentences) rationale explaining why this lesson is appropriate for the ${cefrLevel} level. It should explain how the sentence structure and vocabulary choices align with Second Language Acquisition (SLA) principles. ${pedagogicalFocus ? `Critically, it must also explain how the lesson addresses the Core Pedagogical Focus.` : ''} ${customVocabulary ? `It must also mention how the required vocabulary was integrated.` : ''}
    3.  **Reading Passage:** Write a highly engaging, narrative-driven reading passage on the specified topic. The passage should tell a simple story or describe a vivid scene to captivate the reader. It must have a clear flow with a beginning, middle, and end. If characters are included, give them relatable motivations. The topic "${topic}" must be central to the narrative. ${paragraphInstruction} Crucially, the passage must be carefully crafted to match the grammatical complexity, vocabulary, and sentence structure appropriate for a ${cefrLevel} learner, and its length should be approximately ${passageLength} words. ${customVocabulary ? `**CRITICAL CONSTRAINT:** The passage MUST include and naturally weave in the following words: ${customVocabulary}.` : ''}
    4.  **Key Vocabulary:** Identify 5-7 key Tier 2 vocabulary words from the passage. For each word, provide its part of speech, a simple definition, and a new example sentence.
    5.  **Comprehension Questions:** Create exactly ${numberOfQuestions} questions to check understanding. The difficulty and linguistic complexity of these questions MUST be calibrated to the target ${cefrLevel} level. 
        **CRITICAL:** Generate a balanced mix of the following three question types:
        *   **'true-false':** A statement that the student must verify as true or false based on the text. The 'answer' must be either "True" or "False".
        *   **'multiple-choice':** A question with four plausible options. Provide the options in the 'options' array. The 'answer' must be one of the provided options. The options should be well-designed distractors.
        *   **'short-answer':** An open-ended question that requires a brief, precise answer from the text. The 'answer' should be the concise, correct response.

    ${advancedInstructions ? `**Additional Instructions:** ${advancedInstructions}` : ''}

    Return the lesson plan in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: lessonPlanSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    const lessonPlan = JSON.parse(jsonText);

    if (!lessonPlan.comprehensionQuestions) {
        lessonPlan.comprehensionQuestions = [];
    } else {
        lessonPlan.comprehensionQuestions = lessonPlan.comprehensionQuestions.filter((q: any) => q.question && q.type && q.answer);
    }
    
    return lessonPlan as LessonPlan;

  } catch (error) {
    console.error('Error generating lesson plan:', error);
    if (error instanceof Error) {
        throw new Error(`The AI model failed to generate a valid lesson plan. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the lesson plan.');
  }
};

export const findSourcesForPassage = async (
  passage: string
): Promise<Source[]> => {
  const prompt = `
    Based on the following text, find relevant and authoritative online sources. Provide the top 3-5 most relevant web pages.
    Text: "${passage}"
  `;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata && groundingMetadata.groundingChunks) {
      const sources: Source[] = groundingMetadata.groundingChunks
        .map((chunk: any) => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        }))
        .filter((source, index, self) => 
          index === self.findIndex((s) => s.uri === source.uri)
        );
      return sources;
    }

    return [];
  } catch (error) {
    console.error('Error finding sources:', error);
    return [];
  }
};

export const generateRandomTopic = async (): Promise<string> => {
  const prompt = `
    Your role is an AI idea generator for language teachers, specializing in unique and engaging topics. Your output must be a single, creative topic phrase for an EFL/ESL reading passage.

    **Core Directive:** You MUST randomly adopt ONE of the following creative personas for each topic you generate. Do not be predictable. Your goal is to provide fresh, unexpected, and memorable ideas.

    **Personas (Choose one at random):**
    1.  **The Absurdist:** Generate a funny, strange, or surreal scenario. (e.g., 'A cat who secretly runs a famous restaurant', 'Why pigeons deliberately walk instead of fly', 'The day the color blue went on strike')
    2.  **The Trendsetter:** Generate a topic that feels current, internet-savvy, or meme-ish. (e.g., 'Explaining the concept of "cringe" to a grandparent', 'The secret life of a delivery drone', 'A group of friends trying to take the perfect selfie')
    3.  **The Philosopher:** Generate a simple concept explored with surprising depth. (e.g., 'What a forgotten toy thinks about', 'The feeling of "Sunday evening dread"', 'A conversation between the sun and the moon')
    4.  **The Storyteller:** Generate a gentle, comforting, or nostalgic scene. (e.g., 'The smell of rain on a warm day', 'Finding an old photograph in a library book', 'The joy of sharing a perfect cup of tea')

    **Output Constraints:**
    - Return ONLY the topic phrase.
    - DO NOT reveal which persona you chose.
    - DO NOT add extra text, quotation marks, or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0, 
        stopSequences: ['\n'],
      },
    });

    const topic = response.text.trim().replace(/['"]+/g, ''); 
    if (!topic) {
      throw new Error('The AI returned an empty topic.');
    }
    return topic;

  } catch (error) {
    console.error('Error generating random topic:', error);
    if (error instanceof Error) {
        throw new Error(`The AI model failed to generate a random topic. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating a random topic.');
  }
};

export const gradeOpenEndedAnswer = async (
    questionText: string,
    correctAnswer: string,
    userAnswer: string
): Promise<'Correct' | 'Incorrect'> => {
    if (!userAnswer.trim()) {
        return 'Incorrect';
    }
    
    const prompt = `
        You are an AI grader for an English exam. A student has provided an answer to a short-answer question. 
        Your task is to perform a semantic comparison. The student's answer does not need to be an exact word-for-word match with the correct answer, but it MUST be semantically correct and capture the key information.
        
        **CRITICAL INSTRUCTION:** Your response MUST BE ONLY ONE WORD: either 'Correct' or 'Incorrect'. Do not provide any explanation, punctuation, or any other text.

        **Question:** "${questionText}"
        **Correct Answer:** "${correctAnswer}"
        **Student's Answer:** "${userAnswer}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                stopSequences: ['\n'],
            },
        });
        
        const result = response.text.trim().toLowerCase();
        if (result === 'correct') {
            return 'Correct';
        }
        return 'Incorrect';

    } catch (error) {
        console.error('Error grading open-ended answer:', error);
        return 'Incorrect';
    }
};

const bueptReadingSectionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        passage: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionNumber: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    type: { type: Type.STRING },
                    paragraphReference: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING },
                    additionalPassage: { type: Type.STRING },
                    missingSentence: { type: Type.STRING },
                    paragraphWithMarkers: { type: Type.STRING },
                    matchOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["questionNumber", "questionText", "type", "answer", "paragraphReference"],
            },
        },
        sourceCredit: { type: Type.STRING },
    },
    required: ["title", "passage", "questions"],
};

const getReading1Prompt = () => `
    **Part 1: Literal Reading Section**
    - **Topic:** Choose a suitable, engaging topic from general interest areas like history, social science, or technology.
    - **Passage:** 1800-2000 words. Number all paragraphs.
    - **Questions:** Generate a random number of questions between 10 and 13. Follow the specified question types and order strictly. Questions must follow the paragraph order of the passage.
    
    **Question Blueprint for Part 1:**
    1.  **Type 'vocabulary-in-context':** (Multiple Choice) Ask for the meaning of a challenging, context-dependent word from an early paragraph.
    2.  **Type 'primary-purpose':** (Multiple Choice) Ask for the primary purpose of a specific paragraph.
    3.  **Type 'sentence-completion':** (Open Ended - Answer is the completion) Provide an unfinished quote/idea from a paragraph and ask the user to complete it. The answer should be a short, precise phrase or sentence from the text.
    4.  **Type 'vocabulary-in-context':** (Multiple Choice) Same as Q1, but for a word in a later paragraph.
    5.  **Type 'main-idea':** (Multiple Choice) Ask for the main idea of a specific paragraph.
    6.  **Type 'sentence-completion':** (Open Ended) Same as Q3.
    7.  **Type 'not-mentioned':** (Multiple Choice) Ask which of the given options was NOT mentioned in a specific paragraph.
    8.  **Type 'paragraph-relationship':** (Multiple Choice) Ask how a specific paragraph (e.g., [P8]) relates to the paragraph before it (e.g., [P7]).
    9.  **Type 'insert-sentence':** (Multiple Choice - Answer is just the letter A, B, C, or D). The 'questionText' MUST be formatted with newlines like this: "Read the paragraph below and decide where the following sentence would best fit.\\n\\nSentence: '[Insert the sentence to be placed here]'\\n\\nParagraph: '[Insert the full paragraph with [A], [B], [C], and [D] markers here]'". The 'options' array MUST be ["A", "B", "C", "D"]. The 'answer' is the correct letter. The 'missingSentence' and 'paragraphWithMarkers' fields MUST NOT be used.
    10. **Type 'cross-textual-inference':** (Multiple Choice). The 'questionText' MUST be formatted with newlines like this: "Read the short passage below and answer the question that follows, based on your understanding of BOTH the short passage and the main reading text.\\n\\nPassage: '[Insert the ~50 word additional passage here]'\\n\\nQuestion: '[Insert the actual question here]'". The 'additionalPassage' field MUST NOT be used.
    11. **Type 'global-inference-negative':** (Multiple Choice) Ask what CANNOT be inferred from the entire text.
    * **For randomization (10-13 questions):** If you need more than 11 questions, add more 'vocabulary-in-context' or 'main-idea' questions. If you need fewer, remove one of the duplicates (e.g., remove Q4 or Q6). Always maintain the core structure.
`;

const getReading2Prompt = () => `
    **Part 2: Inference Reading Section**
    - **Source Material:** Generate a passage that reads like it is from a real academic paper in fields like psychology, sociology, linguistics, or environmental science. It should discuss theories, studies, and findings.
    - **Source Credit:** You MUST create a plausible, properly formatted academic citation for this fictional paper and provide it in the 'sourceCredit' field. (e.g., "Smith, J. A. (2021). The Cognitive Effects of Bilingualism on Executive Function. Journal of Experimental Psychology, 45(3), 284-301.").
    - **Passage:** 1800-2000 words, broken into 13-17 numbered paragraphs.
    - **Questions:** Generate exactly 12 questions. The first 9 must follow the paragraph order. The final 3 (10, 11, 12) are a mandatory set and can refer to any earlier paragraphs.

    **Question Blueprint for Part 2:**
    1.  **Type 'phrase-in-context':** (Multiple Choice) Ask for the meaning of a specific academic or idiomatic phrase (e.g., "a priori," "pis aller," "a paradigm shift") based on its context in a paragraph.
    2.  **Type 'case-application-mcq':** (Multiple Choice) Describe a short case/scenario. The question asks to apply a model or guideline from the text to this case.
    3.  **Type 'authors-purpose':** (Multiple Choice) Ask why the author mentions two different phrases or concepts from different paragraphs to convey a larger idea.
    4.  **Type 'term-application-open':** (Open Ended) Present a case and ask the student to apply a specific term explained in the passage to it.
    5.  **Type 'author-personification':** (Multiple Choice) Refer to an author cited in the text (e.g., "Viladot (1994) in [P6]"). Ask what this author would most likely say or think about the ideas in the preceding paragraph (e.g., [P5]).
    6.  **Type 'study-prediction':** (Multiple Choice) Based on a study mentioned in a paragraph, ask what is most likely to happen in a given new situation.
    7.  **Type 'research-results-open':** (Open Ended) Ask a "what is the most..." question based on the results of research presented in a paragraph.
    8.  **Type 'case-matching':** (Multiple Choice) Describe a case and ask which option from the text (e.g., a theory, a category) it is closest to, based on a study's findings.
    9.  **Type 'research-mindset-open':** (Open Ended) Ask a question that requires the student to identify a mindset, category, or framework from the text and apply it (e.g., "According to which mindset in Berry’s four-way categorization...").
    10. **Type 'paragraph-matching':** (Open-ended). The 'questionText' must be formatted as: "Which paragraph does the following summary best describe?\\n\\nSummary: '[Insert a unique, ~100-word summary of a paragraph here]'". The 'answer' must be the correct paragraph number string (e.g., "[P5]"). Do not provide 'options'.
    11. **Type 'paragraph-matching':** (Open-ended). Create another, different summary and question in the same format as Q10.
    12. **Type 'paragraph-matching':** (Open-ended). Create a third, different summary and question in the same format as Q10.
`;


export const generateBueptSection = async (section: 'reading1' | 'reading2'): Promise<BueptReadingSection> => {
    const sectionPrompt = section === 'reading1' ? getReading1Prompt() : getReading2Prompt();

    const prompt = `
    You are an expert AI assistant tasked with creating a single, high-quality BUEPT (Boğaziçi University English Proficiency Exam) style reading section. The target audience is university preparatory school students, and the language level must be a mix of B1 and B2, targeting a final B2 proficiency. The entire output must be a single JSON object that conforms to the provided schema.

    **Overall Structure Rules:**
    - The section has a long passage (1800-2000 words) and a set of questions.
    - The passage MUST be formatted with numbered paragraph markers at the start of each paragraph, like: [P1], [P2], [P3], etc. This is critical for question referencing.

    ---
    
    **Instructions for the requested section:**
    ${sectionPrompt}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', 
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: bueptReadingSectionSchema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        const sectionData = JSON.parse(jsonText);
        return sectionData as BueptReadingSection;
    } catch (error) {
        console.error(`Error generating BUEPT ${section}:`, error);
        if (error instanceof Error) {
            throw new Error(`The AI model failed to generate a valid BUEPT section. Details: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the BUEPT section.');
    }
};