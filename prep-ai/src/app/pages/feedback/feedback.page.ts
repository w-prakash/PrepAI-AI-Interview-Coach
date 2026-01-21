import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AiService } from '../../services/ai';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class FeedbackPage implements OnInit {

  results: any[] = [];
  loading = true;
  totalScore = 0;
  averageScore = 0;

  constructor(private ai: AiService) {}

  ngOnInit() {
    const session = JSON.parse(localStorage.getItem('sessionQuestions') || '[]');

    if (!session.length) {
      this.loading = false;
      return;
    }

    let pending = session.length;

    session.forEach((q: any, index: number) => {

      // MCQ MODE
      if (q.mode === 'mcq') {
        const isCorrect = q.userIndex === q.correctIndex;
        const score = isCorrect ? 10 : 3;

        this.results.push({
          question: q.question,
          topic: q.topic,
          userAnswer: q.options[q.userIndex] || 'N/A',
          correctAnswer: q.options[q.correctIndex],
          feedback: isCorrect ? 'Correct' : 'Incorrect',
          score
        });

        this.totalScore += score;
        pending--;

        if (pending === 0) this.finish();
      }

      // TEXT MODE
      else {
        this.ai.evaluate(
          localStorage.getItem('selectedRole') || 'frontend',
          q.question,
          q.userAnswer || ''
        ).subscribe(res => {
          this.results.push({
            question: q.question,
            topic: q.topic,
            userAnswer: q.userAnswer || '',
            ...res
          });

          this.totalScore += res.score;
          pending--;

          if (pending === 0) this.finish();
        });
      }

    });
  }

  finish() {
    this.averageScore = Math.round(this.totalScore / this.results.length);
    this.loading = false;

    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({
      date: new Date().toISOString(),
      results: this.results,
      averageScore: this.averageScore
    });

    localStorage.setItem('history', JSON.stringify(history));
  }
}
