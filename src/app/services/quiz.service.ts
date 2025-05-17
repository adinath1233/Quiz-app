import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, QuizState } from '../models/question.interface';
import { environment } from '../../environments/environment';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly STORAGE_KEY = 'quiz_state';
  private quizState = new BehaviorSubject<QuizState>({
    language: '',
    questions: [],
    currentQuestionIndex: 0,
    score: 0
  });

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      this.quizState.next(JSON.parse(savedState));
    }
  }

  private saveState(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.quizState.value));
  }

  getQuizState(): Observable<QuizState> {
    return this.quizState.asObservable();
  }

  async generateQuestions(language: string): Promise<Question[]> {
    const prompt = `I want you to generate exactly 10 multiple choice questions (MCQs) based on the programming language ${language}. Each question must follow this structure in JSON format. Example:\n\n{\n"question": "What does the following ${language} code output?",\n"options": ["10", "20", "Compile Error", "Runtime Error"],\n"answer": "10",\n"explanation": "The code initializes x to 10 and prints it."\n}\n\nReturn a JSON array of 10 such questions.`;
    try {
      const genAI = new GoogleGenerativeAI(environment.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || result.response.text || '';
      if (typeof text !== 'string') text = String(text);
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      const questions: Question[] = JSON.parse(jsonString);
      return questions;
    } catch (err) {
      // fallback to mock data
      return [
        {
          question: `What is the output of the following ${language} code?`,
          options: ['10', '20', 'Compile Error', 'Runtime Error'],
          answer: '10',
          explanation: 'The code initializes x to 10 and prints it.'
        }
      ];
    }
  }

  startNewQuiz(language: string): void {
    this.quizState.next({
      language,
      questions: [],
      currentQuestionIndex: 0,
      score: 0
    });
    this.saveState();
  }

  setQuestions(questions: Question[]): void {
    const currentState = this.quizState.value;
    this.quizState.next({
      ...currentState,
      questions
    });
    this.saveState();
  }

  submitAnswer(answer: string): void {
    const currentState = this.quizState.value;
    const currentQuestion = currentState.questions[currentState.currentQuestionIndex];
    
    currentQuestion.userAnswer = answer;
    currentQuestion.isCorrect = answer === currentQuestion.answer;

    const newScore = currentQuestion.isCorrect ? currentState.score + 1 : currentState.score;

    this.quizState.next({
      ...currentState,
      score: newScore
    });
    this.saveState();
  }

  nextQuestion(): void {
    const currentState = this.quizState.value;
    if (currentState.currentQuestionIndex < currentState.questions.length - 1) {
      this.quizState.next({
        ...currentState,
        currentQuestionIndex: currentState.currentQuestionIndex + 1
      });
      this.saveState();
    }
  }

  resetQuiz(): void {
    const currentState = this.quizState.value;
    const resetQuestions = currentState.questions.map(q => ({
      ...q,
      userAnswer: undefined,
      isCorrect: undefined
    }));
    this.quizState.next({
      ...currentState,
      questions: resetQuestions,
      currentQuestionIndex: 0,
      score: 0
    });
    this.saveState();
  }

  clearQuiz(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.quizState.next({
      language: '',
      questions: [],
      currentQuestionIndex: 0,
      score: 0
    });
  }
} 