import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AiService } from '../../services/ai';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.page.html',
  styleUrls: ['./practice.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PracticePage implements OnInit {

  questions: any[] = [];
  currentIndex = 0;
  loading = true;

  mode: 'text' | 'mcq' = 'text';
  role = 'frontend';
  difficulty = 'easy';

  constructor(private router: Router, private ai: AiService) {}

  ngOnInit() {
    this.role = localStorage.getItem('selectedRole') || 'frontend';
    this.difficulty = localStorage.getItem('selectedDifficulty') || 'easy';
    this.mode = (localStorage.getItem('selectedMode') as any) || 'text';

    this.addNewQuestion(); // load first question
  }

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  addNewQuestion() {
    this.loading = true;

    if (this.mode === 'mcq') {
      this.ai.getMcqQuestion(this.role, this.difficulty).subscribe({
        next: (res: any) => {
          this.questions.push({
            question: res.question,
            topic: res.topic,
            options: res.options,
            correctIndex: res.correctIndex,
            mode: 'mcq'
          });
          this.currentIndex = this.questions.length - 1;
          this.loading = false;
        },
        error: () => {
          alert('Failed to load MCQ question');
          this.loading = false;
        }
      });
    } else {
      this.ai.getQuestion(this.role, this.difficulty).subscribe({
        next: (res: any) => {
          this.questions.push({
            question: res.question,
            topic: res.topic,
            mode: 'text'
          });
          this.currentIndex = this.questions.length - 1;
          this.loading = false;
        },
        error: () => {
          alert('Failed to load question');
          this.loading = false;
        }
      });
    }
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  submitAll() {
    localStorage.setItem('sessionQuestions', JSON.stringify(this.questions));
    this.router.navigate(['/feedback']);
  }
}
