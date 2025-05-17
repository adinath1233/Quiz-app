import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { QuizState } from '../../models/question.interface';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  quizState: QuizState | null = null;
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
      this.quizState = state;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  retryQuiz(): void {
    this.quizService.resetQuiz();
    this.router.navigate(['/quiz']);
  }

  newQuiz(): void {
    this.quizService.clearQuiz();
    this.router.navigate(['/']);
  }

  getScorePercentage(): number {
    if (!this.quizState) return 0;
    return (this.quizState.score / this.quizState.questions.length) * 100;
  }
} 