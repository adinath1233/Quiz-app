import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  languages = ['C', 'Java', 'Python'];
  loading = false;

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  async startQuiz(language: string): Promise<void> {
    this.loading = true;
    this.quizService.startNewQuiz(language);
    const questions = await this.quizService.generateQuestions(language);
    this.quizService.setQuestions(questions);
    this.loading = false;
    this.router.navigate(['/quiz']);
  }
} 