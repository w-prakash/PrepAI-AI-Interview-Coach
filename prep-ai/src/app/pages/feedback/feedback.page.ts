import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { AiService } from '../../services/ai';
import { RouterModule } from '@angular/router';
import { ExplainModalComponent } from 'src/app/components/explain-modal/explain-modal.component';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class FeedbackPage implements OnInit {
explainingIndex: number | null = null;

  results: any[] = [];
  loading = true;
  totalScore = 0;
  averageScore = 0;
bestIndex = -1;
weakestIndex = -1;
  constructor(private ai: AiService,   private modalCtrl: ModalController
) {}

  ngOnInit() {
   
  }

  ionViewWillEnter() {
    this.bestIndex = -1;
this.weakestIndex = -1;
    this.results = [];
  this.averageScore = 0;

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
    const correctText = q.explanation;

     
    this.results.push({
      mode: 'mcq',
      question: q.question,
      topic: q.topic,
      userAnswer: q.options[q.userIndex] || 'N/A',
      correctAnswer: correctText,
      feedback: isCorrect ? 'Correct answer selected.' : 'Incorrect answer selected.',
      explanation: `The correct answer is "${correctText}". This option is correct based on the concept of ${q.topic}.`,
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
        mode: 'text',
        question: q.question,
        topic: q.topic,
        userAnswer: q.userAnswer || '',
        correctAnswer: res.improvedAnswer,
        feedback: res.feedback,
        explanation: res.explanation || res.feedback,   // 🔥 ALWAYS SAVE EXPLANATION
        score: res.score
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
  // 🔥 FIND BEST & WEAKEST QUESTION
// 🔥 FIND BEST & WEAKEST ONLY IF MORE THAN 1 QUESTION
if (this.results.length > 1) {

  let maxScore = -1;
  let minScore = 11;

  this.results.forEach((r, i) => {
    if (r.score > maxScore) {
      maxScore = r.score;
      this.bestIndex = i;
    }

    if (r.score < minScore) {
      minScore = r.score;
      this.weakestIndex = i;
    }
  });

} else {
  // Only one question → no best / weakest
  this.bestIndex = -1;
  this.weakestIndex = -1;
}


    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.push({
      date: new Date().toISOString(),
      results: this.results,
      averageScore: this.averageScore
    });

    localStorage.setItem('history', JSON.stringify(history));
    localStorage.removeItem('sessionQuestions');
localStorage.removeItem('currentQuestionIndex');

  }

  async showExplainModal(text: string) {

  const modal = await this.modalCtrl.create({
    component: ExplainModalComponent,
    componentProps: {
      explanation: text
    }
  });

  await modal.present();
}

explainWrong(r: any, index: number) {

  const role = localStorage.getItem('selectedRole') || 'frontend';

  this.explainingIndex = index;   // 🔥 START LOADER ONLY FOR THIS QUESTION

  this.ai.explainWrong({
    question: r.question,
    options: r.options || [],
    correctAnswer: r.correctAnswer,
    userAnswer: r.userAnswer,
    role
  }).subscribe({
    next: (res: any) => {
      this.explainingIndex = null;   // 🔥 STOP LOADER
      this.showExplainModal(res.explanation);
    },
    error: () => {
      this.explainingIndex = null;   // 🔥 STOP LOADER
      alert('Failed to explain this answer');
    }
  });
}




}
