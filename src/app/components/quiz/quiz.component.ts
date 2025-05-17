import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { Question, QuizState } from '../../models/question.interface';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  currentQuestion: Question | null = null;
  currentQuestionIndex = 0;
  selectedAnswer: string | null = null;
  showFeedback = false;
  isLastQuestion = false;
  private subscription: Subscription;

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {
    this.subscription = this.quizService.getQuizState().subscribe(state => {
      if (state.questions.length === 0) {
        this.router.navigate(['/']);
        return;
      }

      this.currentQuestion = state.questions[state.currentQuestionIndex];
      this.currentQuestionIndex = state.currentQuestionIndex;
      this.isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
      this.selectedAnswer = this.currentQuestion.userAnswer || null;
      this.showFeedback = !!this.currentQuestion.userAnswer;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  selectAnswer(answer: string): void {
    if (this.showFeedback) return;
    this.selectedAnswer = answer;
  }

  submitAnswer(): void {
    if (!this.selectedAnswer) return;
    this.quizService.submitAnswer(this.selectedAnswer);
    this.showFeedback = true;
  }

  nextQuestion(): void {
    if (this.isLastQuestion) {
      this.router.navigate(['/result']);
    } else {
      this.quizService.nextQuestion();
      this.selectedAnswer = null;
      this.showFeedback = false;
    }
  }
} 