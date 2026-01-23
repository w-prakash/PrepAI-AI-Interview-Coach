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
selectedTopic: string | null = null;
isTopicQuiz = false;

  questions: any[] = [];
  currentIndex = 0;
  loading = true;

  mode: 'text' | 'mcq' = 'text';
  role = 'frontend';
  difficulty = 'easy';

  constructor(private router: Router, private ai: AiService) {}

  ngOnInit() {}

  // 🔥 Called every time page opens
  ionViewWillEnter() {
const selectedTopic = localStorage.getItem('selectedTopic');

if (selectedTopic) {
  console.log('Practicing weak topic:', selectedTopic);
}

    // Load selections
    this.role = localStorage.getItem('selectedRole') || 'frontend';
    this.difficulty = localStorage.getItem('selectedDifficulty') || 'easy';
    this.mode = (localStorage.getItem('selectedMode') as any) || 'text';
this.selectedTopic = localStorage.getItem('selectedTopic');
  const topicQuizMode = localStorage.getItem('practiceMode') === 'topic-quiz';
  // 🔥 SAVE FLAG
  this.isTopicQuiz = topicQuizMode;


  // 🔥 IF QUIZ FROM WEAK TOPIC MODE
  if (topicQuizMode && this.selectedTopic) {
    this.loadTopicQuiz(this.selectedTopic);
    return;
  }
    // 🔥 CHECK IF THERE IS AN UNFINISHED SESSION
    const savedSession = localStorage.getItem('sessionQuestions');
    const savedIndex = localStorage.getItem('currentQuestionIndex');

    if (savedSession) {
      // 🔁 RESTORE PREVIOUS SESSION
      this.questions = JSON.parse(savedSession);
      this.currentIndex = Number(savedIndex || 0);
      this.loading = false;

      console.log('Restored previous session');
      return;
    }

    // 🆕 NO SESSION → START FRESH
    this.questions = [];
    this.currentIndex = 0;
    this.addNewQuestion();
  }

  // 🔥 Save active session (auto resume feature)
  saveSession() {
    localStorage.setItem('sessionQuestions', JSON.stringify(this.questions));
    localStorage.setItem('currentQuestionIndex', String(this.currentIndex));
  }

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  // 🔥 Load a new question
  addNewQuestion() {
    this.loading = true;

    if (this.mode === 'mcq') {
      this.ai.getMcqQuestion(this.role, this.difficulty, localStorage.getItem('selectedTopic')).subscribe({
        next: (res: any) => {

          this.questions.push({
            mode: 'mcq',
            question: res.question,
            topic: res.topic,
            options: res.options,
            correctIndex: res.correctIndex,
            explanation: res.explanation || '',
            userIndex: null
          });

          this.currentIndex = this.questions.length - 1;
          this.loading = false;

          // 🔥 Save session
          this.saveSession();
        },
        error: () => {
          alert('Failed to load MCQ question');
          this.loading = false;
        }
      });

    } else {
      this.ai.getQuestion(this.role, this.difficulty, localStorage.getItem('selectedTopic')).subscribe({
        next: (res: any) => {

          this.questions.push({
            mode: 'text',
            question: res.question,
            topic: res.topic,
            userAnswer: ''
          });

          this.currentIndex = this.questions.length - 1;
          this.loading = false;

          // 🔥 Save session
          this.saveSession();
        },
        error: () => {
          alert('Failed to load question');
          this.loading = false;
        }
      });
    }
  }

  // 🔥 When user selects MCQ option
  selectOption(index: number) {
    this.currentQuestion.userIndex = index;
    this.saveSession();
  }

  // 🔥 When user types text answer (call from template on blur)
  saveTextAnswer() {
    this.saveSession();
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.saveSession();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.saveSession();
    }
  }

  // 🔥 FINAL SUBMIT – FINISH SESSION
  submitAll() {

    // Save final session for feedback page
    localStorage.setItem('sessionQuestions', JSON.stringify(this.questions));

    // 🔥 Clear only index (feedback still needs questions)
    localStorage.removeItem('currentQuestionIndex');

    this.router.navigate(['tabs/feedback']);
  }

  loadTopicQuiz(topic: string) {
  this.loading = true;

  this.ai.quizFromTopic(topic, this.role).subscribe({
    next: (res: any) => {

      // res.questions = array of 5 MCQs
      this.questions = res.questions.map((q: any) => ({
        mode: 'mcq',
        question: q.question,
        topic: q.topic,
        options: q.options,
        correctIndex: q.correctIndex,
        userIndex: null
      }));

      this.currentIndex = 0;
      this.loading = false;
    },
    error: () => {
      alert('Failed to load topic quiz');
      this.loading = false;
    }
  });
}

}
