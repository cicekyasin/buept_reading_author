import { GoogleGenAI, Type } from '@google/genai';
import type { LessonPlan, Source, CEFRLevel, ComprehensionQuestion, BueptReadingSection, BueptQuestion, CefrAnalysisResult } from '../types';

// FIX: Initialize the GoogleGenAI client. The API key must be read from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Reliably parses JSON from a string, even if it's wrapped in markdown code fences.
 * @param text The raw text response from the model.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
function parseJsonFromMarkdown(text: string): any {
  const codeBlockRegex = /```json\n([\s\S]*?)\n```/;
  const match = text.match(codeBlockRegex);

  let jsonText = text.trim();
  if (match && match[1]) {
    jsonText = match[1];
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse JSON. Raw text:", text);
    throw new Error("The AI returned a response in an invalid format. Please try again.");
  }
}


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
    writingPrompts: {
        type: Type.ARRAY,
        description: "A list of 1-2 creative writing prompts related to the passage. The prompts should encourage students to use the key vocabulary and target grammatical structures from the lesson. They must be appropriate for the target CEFR level.",
        items: { type: Type.STRING }
    }
  },
  required: ['title', 'cefrLevel', 'pedagogicalRationale', 'readingPassage', 'keyVocabulary', 'comprehensionQuestions', 'writingPrompts'],
};

/**
 * Provides a detailed linguistic profile for a given CEFR level to guide the AI.
 * This is based on principles from readability tests like Flesch-Kincaid, focusing on
 * sentence length, word complexity, and grammatical structures.
 * @param level The target CEFR level.
 * @returns A string of instructions for the AI.
 */
const getCefrLinguisticProfile = (level: CEFRLevel): string => {
  const baseLevel = level.substring(0, 2); // A1, A2, B1, B2
  
  switch (baseLevel) {
    case 'A1':
      return `
        - **Vocabulary:** Strictly limit vocabulary to the top 1000 most frequent English words. Use only concrete nouns and basic verbs. Avoid all idioms, phrasal verbs, and abstract concepts.
        - **Sentence Structure:** Construct only simple sentences (one independent clause). Target an average sentence length of 8-10 words. Maximum sentence length must not exceed 15 words. Use 'and', 'but', and 'because' for simple connections.
        - **Grammar:** Use only Present Simple, Present Continuous, and 'can/can't'. Avoid past tenses and future forms.
        - **Flesch Reading Ease Score:** The passage MUST score between 90 and 100 on the Flesch Reading Ease scale. This is a hard constraint.
      `;
    case 'A2':
      return `
        - **Vocabulary:** Primarily use words from the top 2000 most frequent English words. Introduce a few common, easily understandable phrasal verbs (e.g., 'get up', 'look for').
        - **Sentence Structure:** Use a mix of simple and compound sentences. Target an average sentence length of 10-14 words. Introduce simple subordinate clauses with 'when' and 'if' (zero conditional).
        - **Grammar:** Use Past Simple (regular and common irregular verbs), Present Perfect for life experiences ('I have been to...'), and 'be going to' for future plans.
        - **Flesch Reading Ease Score:** The passage MUST score between 80 and 90 on the Flesch Reading Ease scale. This is a hard constraint.
      `;
    case 'B1':
      return `
        - **Vocabulary:** Use a broad range of vocabulary (top 3000 words). Introduce some abstract nouns (e.g., 'advantage', 'difficulty') and more descriptive adjectives. Some common, transparent idioms are acceptable if context makes the meaning clear.
        - **Sentence Structure:** Employ a mix of simple, compound, and complex sentences. Target an average sentence length of 14-18 words. Sentences should include relative clauses ('who', 'which', 'that') and conditional clauses (first and second conditionals).
        - **Grammar:** Must demonstrate correct use of Present Perfect (for recent past/unfinished actions), Past Continuous, and conditionals. Introduce the simple passive voice (e.g., 'The book was written by...').
        - **Flesch Reading Ease Score:** The passage MUST score between 60 and 70 on the Flesch Reading Ease scale (equivalent to 8th-9th grade level). This is a hard constraint.
      `;
    case 'B2':
      return `
        - **Vocabulary:** Use a wide and varied lexical range, including less frequent words, nuanced shades of meaning, and common idiomatic expressions.
        - **Sentence Structure:** Utilize complex and varied sentence structures. Target an average sentence length of 18-25 words, but ensure variety. Include participial clauses, reported speech, and a range of subordinate clauses to express complex relationships between ideas.
        - **Grammar:** Demonstrate a strong command of tenses, including Past Perfect and mixed conditionals. Use a wide range of modal verbs to express speculation, deduction, and advice. Employ the passive voice in various tenses.
        - **Flesch Reading Ease Score:** The passage MUST score between 50 and 60 on the Flesch Reading Ease scale (equivalent to 10th-12th grade level). This is a hard constraint.
      `;
    default:
      // Fallback for levels like A1+, B1-, etc. to their base level
      return getCefrLinguisticProfile(baseLevel as CEFRLevel);
  }
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
  const structureExample = (bodyCount: string) => `It should be formatted with double line breaks between paragraphs (like \\n\\n). Example:\\n[Introduction text]\\n\\n[Body paragraph 1 text]\\n\\n... (${bodyCount}) ...\\n\\n[Conclusion text]`;

  let paragraphInstruction = '';
  if (passageLength <= 300) { // Quick Read (~250 words)
      paragraphInstruction = `**Passage Structure:** The passage should have an introduction, 1-2 body paragraphs, and a conclusion. ${structureExample('1-2 body paragraphs')}`;
  } else if (passageLength <= 600) { // Standard (~500 words)
      paragraphInstruction = `**Passage Structure:** The passage should have an introduction, 2-3 body paragraphs, and a conclusion. ${structureExample('2-3 body paragraphs')}`;
  } else { // In-Depth & Extended (750+ words)
      paragraphInstruction = `**Passage Structure:** The passage should have an introduction, at least 3-4 well-developed body paragraphs, and a conclusion. ${structureExample('3-4+ body paragraphs')}`;
  }

  const linguisticProfile = getCefrLinguisticProfile(cefrLevel);

  const prompt = `
    Generate a complete EFL/ESL lesson plan for a reading passage.

    **Topic:** "${topic}"
    **Target CEFR Level:** ${cefrLevel}
    **Approximate Passage Word Count:** ${passageLength} words.

    **CEFR Linguistic Profile (CRITICAL):** You must strictly adhere to the following linguistic constraints for the target CEFR level when writing the reading passage. This is the most important instruction.
    ${linguisticProfile}
    
    ${customVocabulary ? `**Required Vocabulary:** You MUST naturally integrate the following comma-separated words into the reading passage: "${customVocabulary}". The words must be used in a way that is contextually appropriate for the topic and linguistically appropriate for the target CEFR level. If a word is too advanced, you may use a simpler form of it if appropriate, but you must still use the word.` : ''}
    ${pedagogicalFocus ? `**Core Pedagogical Focus:** "${pedagogicalFocus}"` : ''}
    ${exemplarPassage ? `**Style Guide (Exemplar Passage):** Emulate the style, tone, and sentence structure of this text: "${exemplarPassage}"` : ''}
    ${exemplarQuestions ? `**Question Style Guide (Exemplar Questions):** Model the new questions on the style and cognitive level of these examples: "${exemplarQuestions}"` : ''}

    **Instructions:**
    1.  **Title:** Create a catchy title related to the topic.
    2.  **Pedagogical Rationale:** Write a short (2-4 sentences) rationale explaining why this lesson is appropriate for the ${cefrLevel} level. It should explain how the sentence structure and vocabulary choices align with Second Language Acquisition (SLA) principles and the specific CEFR Linguistic Profile provided. ${pedagogicalFocus ? `Critically, it must also explain how the lesson addresses the Core Pedagogical Focus.` : ''} ${customVocabulary ? `It must also mention how the required vocabulary was integrated.` : ''}
    3.  **Reading Passage:** Write a highly engaging, narrative-driven reading passage on the specified topic. The passage should tell a simple story or describe a vivid scene to captivate the reader. It must have a clear flow with a beginning, middle, and end. If characters are included, give them relatable motivations. The topic "${topic}" must be central to the narrative. ${paragraphInstruction} Crucially, the passage must be carefully crafted to match the grammatical complexity, vocabulary, and sentence structure outlined in the CEFR Linguistic Profile, and its length should be approximately ${passageLength} words. ${customVocabulary ? `**CRITICAL CONSTRAINT:** The passage MUST include and naturally weave in the following words: ${customVocabulary}.` : ''}
    4.  **Key Vocabulary:** Identify 5-7 key Tier 2 vocabulary words from the passage. For each word, provide its part of speech, a simple definition, and a new example sentence.
    5.  **Comprehension Questions:** Create exactly ${numberOfQuestions} questions to check understanding. The difficulty and linguistic complexity of these questions MUST be calibrated to the target ${cefrLevel} level.
        **CRITICAL:** Generate a balanced mix of the following three question types. The questions in the final JSON array must be ordered by type: all 'true-false' questions first, then all 'multiple-choice' questions, then all 'short-answer' questions.
        *   **'true-false':** A statement that the student must verify as true or false based on the text. The 'answer' must be either "True" or "False".
        *   **'multiple-choice':** A question with four plausible options. Provide the options in the 'options' array. The 'answer' must be one of the provided options. The options should be well-designed distractors.
        *   **'short-answer':** An open-ended question that requires a brief, precise answer from the text. The 'answer' should be the concise, correct response.
    6.  **Writing Prompts:** Create 1-2 creative writing prompts based on the passage's theme. These prompts MUST encourage the student to use some of the key vocabulary and the grammatical structures relevant to the ${cefrLevel} level (e.g., if the focus is past tense, the prompt should naturally lead to a narrative in the past).

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

    if (!lessonPlan.comprehensionQuestions || !Array.isArray(lessonPlan.comprehensionQuestions)) {
        lessonPlan.comprehensionQuestions = [];
    } else {
        lessonPlan.comprehensionQuestions = lessonPlan.comprehensionQuestions.filter((q: any) => q && q.question && q.type && q.answer);
    }
    
    return lessonPlan as LessonPlan;

  } catch (error) {
    console.error('Error generating lesson plan:', error);
    // Throw a generic, user-friendly error message. The specific error is logged above for debugging.
    throw new Error('Failed to generate lesson plan. Please try again.');
  }
};

const cefrAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedLevel: { type: Type.STRING, description: 'The estimated CEFR level of the passage (e.g., "A2", "B1+").' },
        justification: { type: Type.STRING, description: 'A brief, 1-2 sentence justification for the estimated level, referencing vocabulary, sentence structure, and grammar.' },
    },
    required: ['estimatedLevel', 'justification'],
};

export const analyzePassageCefrLevel = async (passage: string, originalLevel: CEFRLevel): Promise<CefrAnalysisResult> => {
    const prompt = `
        You are a CEFR level assessment expert for EFL/ESL materials. Analyze the following text and provide a CEFR level assessment. 
        The passage was originally generated for a target level of **${originalLevel}**. Your analysis should determine if it successfully meets this target.
        
        Justify your rating based on its vocabulary (word frequency, abstract vs. concrete), grammatical structures (tense usage, complexity), and sentence complexity (length, use of clauses).
        
        **Passage to Analyze:**
        "${passage}"
        
        Return the result as a single, raw JSON object. Do not wrap it in markdown.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: cefrAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CefrAnalysisResult;
    } catch (error) {
        console.error('Error analyzing passage:', error);
        throw new Error('Failed to analyze the generated passage.');
    }
};

export const refinePassage = async (
    originalLessonPlan: LessonPlan,
    refinementDirection: 'simpler' | 'more complex',
    originalParams: {
        topic: string;
        passageLength: number;
        numberOfQuestions: number;
    }
): Promise<LessonPlan> => {
    const prompt = `
        You are an expert EFL/ESL curriculum designer. Your task is to refine an existing reading passage and its associated lesson materials.

        **Refinement Direction:** Make the passage and questions **${refinementDirection}**.

        **Original Lesson Plan:**
        - Title: ${originalLessonPlan.title}
        - Original Target CEFR Level: ${originalLessonPlan.cefrLevel}
        - Original Reading Passage: "${originalLessonPlan.readingPassage}"

        **Instructions:**
        1.  **Rewrite the Reading Passage:**
            - Keep the core topic ("${originalParams.topic}") and the main narrative/informational points the same.
            - Adjust the vocabulary, sentence length, and grammatical complexity according to the refinement direction.
            - If making it **'simpler'**, use more frequent words (e.g., from top 2000 words), shorten complex sentences, and simplify grammatical structures (e.g., reduce passive voice or complex clauses).
            - If making it **'more complex'**, introduce more nuanced or less frequent vocabulary, and use more varied and complex sentence structures (e.g., subordinate clauses, varied tenses).
            - The new passage should still be approximately **${originalParams.passageLength}** words.

        2.  **Update CEFR Level:** Based on your refinement, determine the new, most appropriate CEFR level for the rewritten passage (e.g., if the original was B1 and you made it simpler, the new level might be B1- or A2+). This is a critical step.

        3.  **Update Key Vocabulary:** Select 5-7 new Tier 2 vocabulary words from the **REFINED** passage that are appropriate for the new difficulty level. Provide definitions and new example sentences.

        4.  **Rewrite Comprehension Questions:** Create exactly **${originalParams.numberOfQuestions}** new questions that match the content and linguistic level of the **REFINED** passage. Maintain a balanced mix of 'true-false', 'multiple-choice', and 'short-answer' question types, ordered by type in the final array.
        
        5.  **Update Pedagogical Rationale:** Briefly update the rationale to reflect the changes made and justify the new CEFR level.

        6.  **Rewrite Writing Prompts:** Create 1-2 new writing prompts that are aligned with the content and linguistic level of the **REFINED** passage and vocabulary.

        Return the complete, refined lesson plan as a single, raw JSON object that conforms to the schema. Do not wrap it in markdown.
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
        return JSON.parse(jsonText) as LessonPlan;
    } catch (error) {
        console.error('Error refining lesson plan:', error);
        throw new Error('Failed to refine the lesson plan. Please try again.');
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

export const gradeOpenEndedAnswer = async (
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<'Correct' | 'Incorrect'> => {
  const prompt = `
    You are an AI grader for an English language test. Your task is to evaluate a user's answer to a reading comprehension question.
    You must determine if the user's answer is semantically equivalent to the correct answer. The user does not need to use the exact same words, but their answer must convey the same meaning.

    Question: "${question}"
    Correct Answer: "${correctAnswer}"
    User's Answer: "${userAnswer}"

    Is the user's answer correct? Respond with only the word "Correct" or "Incorrect".
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const result = response.text.trim().toLowerCase();
    if (result.includes('correct')) {
      return 'Correct';
    }
    return 'Incorrect';
  } catch (error) {
    console.error('Error grading answer:', error);
    return 'Incorrect';
  }
};

export const generateRandomTopic = async (): Promise<string> => {
    const prompt = "Generate a single, interesting, and specific topic suitable for an EFL reading passage. The topic should be a noun phrase. For example: 'A visit to the Spice Bazaar in Istanbul' or 'The history of Turkish coffee'. Do not add any extra text, just the topic itself.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, ''); // Remove quotes if the AI adds them
    } catch (error) {
        console.error("Error generating random topic:", error);
        return "The history of coffee"; // Fallback topic
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
                required: ['questionNumber', 'questionText', 'type', 'paragraphReference', 'answer'],
            },
        },
        sourceCredit: { type: Type.STRING },
    },
    required: ['title', 'passage', 'questions'],
};

/**
 * Normalizes and validates the raw JSON object from the AI to ensure it conforms to the BueptReadingSection interface.
 * @param rawData The raw parsed JSON from the AI.
 * @returns A validated and normalized BueptReadingSection object.
 * @throws An error if the data is fundamentally invalid (e.g., not an object, missing title/passage).
 */
const normalizeAndValidateBueptSection = (rawData: any): BueptReadingSection => {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error("The AI returned a response that was not a valid object.");
  }

  // 1. Normalize top-level structure (e.g., handle nested passage object)
  // AI sometimes returns { passage: { title: "...", text: "..." } }
  if (rawData.passage && typeof rawData.passage === 'object' && !Array.isArray(rawData.passage)) {
    const nestedPassage = rawData.passage as { title?: string, text?: string | string[] };
    if (!rawData.title && nestedPassage.title) {
      rawData.title = nestedPassage.title;
    }
    if (nestedPassage.text) {
      rawData.passage = nestedPassage.text;
    }
  }
  
  // AI sometimes returns passage as an array of strings
  if (Array.isArray(rawData.passage)) {
      rawData.passage = rawData.passage.join('\n\n');
  }

  // 2. Validate top-level fields after potential normalization
  if (!rawData.title || typeof rawData.title !== 'string' || !rawData.title.trim()) {
    throw new Error("The AI response is missing a valid 'title'.");
  }
  if (!rawData.passage || typeof rawData.passage !== 'string' || !rawData.passage.trim()) {
    throw new Error("The AI response is missing a valid 'passage'.");
  }

  // 3. Validate and sanitize questions array
  let validatedQuestions: BueptQuestion[] = [];
  if (!rawData.questions || !Array.isArray(rawData.questions)) {
    console.warn("AI response missing 'questions' array. Proceeding with empty questions.");
    rawData.questions = [];
  } else {
    validatedQuestions = rawData.questions
      .map((q: any, index: number): BueptQuestion | null => {
        if (!q || typeof q !== 'object') return null;

        // Normalize options: AI sometimes returns an object { A: "...", B: "..." }
        let normalizedOptions: string[] | undefined = undefined;
        if (q.options) {
            if (Array.isArray(q.options)) {
                normalizedOptions = q.options.filter((opt: any) => typeof opt === 'string');
            } else if (typeof q.options === 'object') {
                normalizedOptions = Object.values(q.options).filter((opt: any) => typeof opt === 'string') as string[];
            }
        }
        
        const hasRequiredFields = q.questionText && typeof q.questionText === 'string' &&
                                  q.type && typeof q.type === 'string' &&
                                  q.answer && typeof q.answer === 'string';

        if (!hasRequiredFields) {
          console.warn("Filtering out malformed question due to missing required fields:", q);
          return null;
        }

        return {
          questionNumber: typeof q.questionNumber === 'number' ? q.questionNumber : index + 1,
          questionText: q.questionText,
          type: q.type,
          paragraphReference: q.paragraphReference || '',
          options: normalizedOptions,
          answer: q.answer,
          additionalPassage: q.additionalPassage,
          missingSentence: q.missingSentence,
          paragraphWithMarkers: q.paragraphWithMarkers,
          matchOptions: Array.isArray(q.matchOptions) ? q.matchOptions.filter((opt: any) => typeof opt === 'string') : undefined,
        };
      })
      .filter((q): q is BueptQuestion => q !== null); // Filter out the nulls
  }
  
  // Sort questions by questionNumber to ensure order
  validatedQuestions.sort((a, b) => a.questionNumber - b.questionNumber);

  return {
    title: rawData.title,
    passage: rawData.passage,
    questions: validatedQuestions,
    sourceCredit: typeof rawData.sourceCredit === 'string' ? rawData.sourceCredit : undefined,
  };
};


export const generateBueptSection = async (
  sectionKey: 'reading1' | 'reading2'
): Promise<BueptReadingSection> => {
  try {
    if (sectionKey === 'reading1') {
      const prompt = `
        Generate a complete BUEPT Reading 1 section. This section focuses on literal comprehension of a narrative or descriptive text.
        
        **Constraints:**
        1.  **Passage:** Write a single, engaging narrative or descriptive passage of about 800-1000 words. It should be divided into 6-8 paragraphs, clearly marked with [P1], [P2], etc., at the beginning of each. The story should have characters, a plot, and a clear resolution. The language should be accessible, similar to a modern novel or a detailed feature article.
        2.  **Questions:** Generate exactly 12-13 questions based on the passage.
        3.  **Question Blueprint:** The questions must follow this flexible blueprint. You can choose which question types to use, but the total number must be 12-13.
            *   **Main Idea (1-2 questions):** Ask about the main idea, purpose, or best title for a specific paragraph or the whole passage. (type: 'main-idea'). These are multiple-choice with 4 options (A, B, C, D).
            *   **Factual Detail (4-6 questions):** Ask about specific details mentioned directly in the text. (type: 'detail'). These are multiple-choice with 4 options (A, B, C, D).
            *   **Pronoun Reference (2-3 questions):** Ask what a specific pronoun (e.g., "it," "they," "this") in a paragraph refers to. (type: 'reference'). These are multiple-choice with 4 options (A, B, C, D).
            *   **Vocabulary in Context (2-3 questions):** Ask for the meaning of a specific word or phrase as used in the passage. (type: 'vocabulary'). These are multiple-choice with 4 options (A, B, C, D).
        4.  **Formatting:**
            *   The 'questionNumber' must be sequential (1, 2, 3...).
            *   The 'paragraphReference' must state which paragraph the question is about (e.g., "P1", "P3-P4").
            *   The 'answer' for multiple-choice questions must be the letter of the correct option (e.g., "A", "C").
            
        Return a single, valid JSON object that conforms to the specified schema.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: bueptReadingSectionSchema,
          temperature: 0.8,
        },
      });
      const rawData = parseJsonFromMarkdown(response.text);
      return normalizeAndValidateBueptSection(rawData);

    } else if (sectionKey === 'reading2') {
      // Step 1: Find a niche, engaging academic topic
      const topicResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Find a niche, specific, and engaging topic from an academic field like linguistics, anthropology, cognitive science, or niche history. Provide only the topic name.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      const topic = topicResponse.text.trim();

      // Step 2: Generate the section based on the found topic
      const prompt = `
          You are an expert in creating academic reading tests. Generate a complete BUEPT Reading 2 section based on the niche academic topic: "${topic}". This section tests inference, understanding of academic language, and complex text structures. Use Google Search to find credible information to ground your writing.

          **Constraints:**
          1.  **Passage:** Write a single, dense academic passage of about 800-1000 words. The style should be formal and objective, typical of a university-level textbook or journal article. It must be divided into 6-8 paragraphs, clearly marked with [P1], [P2], etc.
          2.  **Questions:** Generate exactly 12-13 questions.
          3.  **Question Blueprint:** The questions must follow this flexible blueprint. You can choose which question types to use, but the total number must be 12-13.
              *   **Inference (3-5 questions):** Ask what can be inferred or implied from a paragraph, not stated directly. (type: 'inference'). Multiple-choice with 4 options.
              *   **Paraphrase (2-3 questions):** Provide a sentence from the passage and ask which option best restates its meaning. (type: 'paraphrase'). Multiple-choice with 4 options.
              *   **Insert Sentence (1-2 questions):** Provide a sentence and ask where it would best fit within a specific paragraph that has numbered markers [1], [2], etc. The 'questionText' should contain the paragraph with markers and the sentence to insert. (type: 'insert-sentence'). The answer is the number marker.
              *   **Cross-textual Inference (1-2 questions):** Provide a short, new passage (1-2 sentences) on a related topic. Then ask a question that requires understanding both the original passage and the new one. The 'questionText' MUST contain this new passage. (type: 'cross-textual-inference'). Multiple-choice with 4 options.
              *   **Paragraph Matching (1 question, optional):** Provide 3-4 short summaries (A, B, C, D). The question asks to match these summaries to 3 specific paragraphs from the text. The 'questionText' should contain the summaries. The answer should be in the format "P1:B, P3:A, P5:C". (type: 'paragraph-matching').
          4.  **Formatting:**
              *   'answer' for multiple-choice is the letter (e.g., "A").
              *   'sourceCredit' field MUST be included, citing the web source(s) used as a single comma-separated string.
              
          Return ONLY a raw, single, valid JSON object that strictly adheres to the following structure. Do not wrap it in markdown. The 'title' and 'passage' must be top-level string properties. For multiple-choice questions, 'options' MUST be an array of 4 strings.

          **JSON Structure Example:**
          \`\`\`json
          {
            "title": "The Ethno-Ornithology of Language Evolution",
            "passage": "[P1] The first paragraph of the passage text goes here...\\n\\n[P2] The second paragraph...",
            "questions": [
              {
                "questionNumber": 1,
                "questionText": "This is a multiple-choice inference question.",
                "type": "inference",
                "paragraphReference": "P1",
                "options": ["This is option A.", "This is option B.", "This is option C.", "This is option D."],
                "answer": "B"
              },
              {
                "questionNumber": 2,
                "questionText": "This is an insert-sentence question. The paragraph with markers [1], [2], etc. and the sentence to insert are all included here.",
                "type": "insert-sentence",
                "paragraphReference": "P3",
                "answer": "2"
              }
            ],
            "sourceCredit": "https://example.com/source1, https://example.com/source2"
          }
          \`\`\`
        `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.5,
        },
      });
      const rawData = parseJsonFromMarkdown(response.text);
      return normalizeAndValidateBueptSection(rawData);
    }
    throw new Error('Invalid section key provided.');

  } catch (error) {
    console.error(`Error generating BUEPT ${sectionKey}:`, error);
    // Throw a generic, user-friendly error message. The specific error is logged above for debugging.
    throw new Error('Failed to generate BUEPT section. Please try again.');
  }
};