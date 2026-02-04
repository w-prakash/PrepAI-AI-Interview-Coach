import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AiService } from '../../services/ai';
import { AlertController } from '@ionic/angular/standalone';

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
@ViewChild('card', { static: false }) card!: ElementRef;
@ViewChildren('stepEl') stepElements!: QueryList<ElementRef>;
@ViewChild('stepperScroll') stepperScroll!: ElementRef;
showLeftArrow = false;
showRightArrow = false;
prefetchedQuestion: any = null;
showSwipeHint = true;

startY = 0;
deltaY = 0;
isSwiping = false;
  questions: any[] = [];
  currentIndex = 0;
  loading = true;

  mode: 'text' | 'mcq' = 'text';
  role = 'frontend';
  difficulty = 'easy';
  constructor(private router: Router, private ai: AiService, private alertController: AlertController) {}

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

  ngAfterViewInit() {
  setTimeout(() => this.onStepperScroll());
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
  // addNewQuestion() {
  //   this.loading = true;

  //   if (this.mode === 'mcq') {
  //     this.ai.getMcqQuestion(this.role, this.difficulty, localStorage.getItem('selectedTopic')).subscribe({
  //       next: (res: any) => {

  //         this.questions.push({
  //           mode: 'mcq',
  //           question: res.question,
  //           topic: res.topic,
  //           options: res.options,
  //           correctIndex: res.correctIndex,
  //           explanation: res.explanation || '',
  //           userIndex: null
  //         });

  //         this.currentIndex = this.questions.length - 1;
  //         this.loading = false;

  //         // 🔥 Save session
  //         this.saveSession();
  //       },
  //       error: () => {
  //         alert('Failed to load MCQ question');
  //         this.loading = false;
  //       }
  //     });

  //   } else {
  //     this.ai.getQuestion(this.role, this.difficulty, localStorage.getItem('selectedTopic')).subscribe({
  //       next: (res: any) => {

  //         this.questions.push({
  //           mode: 'text',
  //           question: res.question,
  //           topic: res.topic,
  //           userAnswer: ''
  //         });

  //         this.currentIndex = this.questions.length - 1;
  //         this.loading = false;

  //         // 🔥 Save session
  //         this.saveSession();
  //       },
  //       error: () => {
  //         alert('Failed to load question');
  //         this.loading = false;
  //       }
  //     });
  //   }
  // }

  async addNewQuestion() {
  // 1️⃣ Instantly use prefetched question
  if (this.prefetchedQuestion) {
    this.questions.push(this.prefetchedQuestion);
    this.currentIndex = this.questions.length - 1;
  } else {
    // safety fallback
    this.loading = true;
    const q = await this.fetchQuestion();
    this.questions.push(q);
    this.currentIndex = this.questions.length - 1;
    this.loading = false;
    
  }

  // 2️⃣ Prefetch the next one in background
  try {
    this.prefetchedQuestion = await this.fetchQuestion();
  } catch {
    this.prefetchedQuestion = null;
  }

  // 3️⃣ Save session
  this.saveSession();
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

  async submitAll() {
  const alert = await this.alertController.create({
    header: 'Submit All Answers?',
    message: 'You won’t be able to change your answers after submission.',
    cssClass: 'submit-confirm-alert',
    mode: "ios",
    buttons: [
      {
        text: 'Review',
        role: 'cancel'
      },
      {
        text: 'Submit',
        handler: () => {
          this.finalSubmit();
        }
      }
    ]
  });

  await alert.present();
}

  // 🔥 FINAL SUBMIT – FINISH SESSION
  finalSubmit() {

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

fetchQuestion(): Promise<any> {
  return new Promise((resolve, reject) => {

    if (this.mode === 'mcq') {
      this.ai.getMcqQuestion(
        this.role,
        this.difficulty,
        localStorage.getItem('selectedTopic')
      ).subscribe({
        next: (res: any) => {
          resolve({
            mode: 'mcq',
            question: res.question,
            topic: res.topic,
            options: res.options,
            correctIndex: res.correctIndex,
            explanation: res.explanation || '',
            userIndex: null
          });
        },
        error: reject
      });

    } else {
      this.ai.getQuestion(
        this.role,
        this.difficulty,
        localStorage.getItem('selectedTopic')
      ).subscribe({
        next: (res: any) => {
          resolve({
            mode: 'text',
            question: res.question,
            topic: res.topic,
            userAnswer: ''
          });
        },
        error: reject
      });
    }

  });
  
}

async initQuestions() {
  this.loading = true;

  const first = await this.fetchQuestion();
  const second = await this.fetchQuestion();

  this.questions.push(first);
  this.prefetchedQuestion = second;

  this.currentIndex = 0;
  this.loading = false;

  this.saveSession();
}

onSwipeStart(event: PointerEvent) {
  this.startY = event.clientY;
  this.isSwiping = true;

  (event.target as HTMLElement).setPointerCapture(event.pointerId);
  
}

onSwipeMove(event: PointerEvent) {
  if (!this.isSwiping) return;

  this.deltaY = event.clientY - this.startY;

  // Only swipe UP
  if (this.deltaY > 0) return;

  const pull = Math.min(Math.abs(this.deltaY), 160);

  const rotateX = pull / 7;     // fold angle
  const lift = pull / 14;       // slight lift

  this.card.nativeElement.style.transform =
    `translateY(${-lift}px) rotateX(${rotateX}deg)`;

  this.card.nativeElement.style.setProperty(
    '--fold-opacity',
    (pull / 160).toString()
  );

  this.card.nativeElement.style.boxShadow =
    `0 ${pull}px ${pull * 1.5}px rgba(0,0,0,0.35)`;

  this.card.nativeElement.style.setProperty(
    'opacity',
    '1'
  );

  this.card.nativeElement.style.setProperty(
    'filter',
    `brightness(${1 - pull / 600})`
  );

  this.card.nativeElement.style.setProperty(
    '--after-opacity',
    (pull / 160).toString()
  );

  this.card.nativeElement.style.setProperty(
    'transform-style',
    'preserve-3d'
  );

  this.card.nativeElement.style.setProperty(
    'transition',
    'none'
  );

  this.card.nativeElement.style.setProperty(
    '--shadow-opacity',
    (pull / 160).toString()
  );

  this.card.nativeElement.style.setProperty(
    'opacity',
    '1'
  );

  this.card.nativeElement.style.setProperty(
    '--fold',
    pull.toString()
  );

  this.card.nativeElement.style.setProperty(
    '--fold-opacity',
    (pull / 160).toString()
  );

  this.card.nativeElement.style.setProperty(
    '--shadow',
    pull.toString()
  );

  this.card.nativeElement.style.style =
    `--after-opacity:${pull / 160}`;
}

onSwipeEnd() {
  if (!this.isSwiping) return;
  this.isSwiping = false;

  const threshold = -120; // swipe up distance

  // commit animation
  this.card.nativeElement.style.transition =
    'transform 0.95s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.95s ease';

  if (this.deltaY < threshold) {
    // ✅ FINAL EXIT (NO COMING BACK)
    this.card.nativeElement.style.transform =
      'translateY(-140%) rotateX(35deg)';
    this.card.nativeElement.style.opacity = '0';

    setTimeout(() => {
      this.addNewQuestion();   // prefetched → instant
      this.prepareNextCard(); // reset for next card
          setTimeout(() => {
      this.scrollActiveStepIntoView();
    });
    }, 280);

  } else {
    // ❌ Not enough swipe → return back
    this.resetCard();
  }

  this.deltaY = 0;
}

prepareNextCard() {
  const el = this.card.nativeElement;

  // 🔥 Hard reset all visual states
  el.style.transition = 'none';
  el.style.transform = 'translateY(0) rotateX(0deg)';
  el.style.opacity = '1';
  el.style.filter = 'none';

  // 🔥 Force browser repaint
  el.offsetHeight;

  // Restore transitions for next interaction
  el.style.transition = '';
}

resetCard() {
  this.card.nativeElement.style.transform =
    'translateY(0) rotateX(0deg)';
  this.card.nativeElement.style.opacity = '1';

  setTimeout(() => {
    this.card.nativeElement.style.transition = '';
  }, 300);
}

goToQuestion(index: number) {
  if (index === this.currentIndex || this.loading) {
    return;
  }

  this.currentIndex = index;

  setTimeout(() => {
    this.scrollActiveStepIntoView();
  });
}

scrollActiveStepIntoView() {
  const steps = this.stepElements?.toArray();

  if (!steps || !steps[this.currentIndex]) {
    return;
  }

  steps[this.currentIndex].nativeElement.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  });
}
onStepperScroll() {
  const el = this.stepperScroll.nativeElement;

  this.showLeftArrow = el.scrollLeft > 4;
  this.showRightArrow = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
}

}
