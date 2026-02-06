import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai';
import { Router, RouterModule } from '@angular/router';
import { RoleSelectorComponent } from 'src/app/components/role-selector/role-selector.component';

@Component({
  selector: 'app-mock-interview',
  templateUrl: './mock-interview.page.html',
  styleUrls: ['./mock-interview.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class MockInterviewPage implements OnInit {
timeLeft = 60;          // seconds per question
timer: any = null;
timePerQuestion = 180;  // configurable
reviewMode = false;

  role = '';
  difficulty = 'easy';
  count = 1;

  questions: any[] = [];
  currentIndex = 0;
  answers: any[] = [];

  userAnswer = '';
  loading = false;
  finished = false;
selectedRole = '';
customRole = '';

  result: any = null;
roleGroups = [
  {
    group: 'Frontend',
    roles: ['Angular', 'React', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS']
  },
  {
    group: 'Backend',
    roles: ['Node.js', 'Express', 'Java', 'Python', 'C#', 'Spring Boot', 'Django']
  },
  {
    group: 'Mobile',
    roles: ['Ionic', 'Flutter', 'React Native', 'Android', 'iOS']
  },
  {
    group: 'Database',
    roles: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQL']
  },
  {
    group: 'Full Stack',
    roles: ['Full Stack Developer']
  }
];
constructor(
  private ai: AiService,
  private router: Router,
  private modalCtrl: ModalController,
  private toastCtrl: ToastController
) {}

  ngOnInit() {
    this.role = localStorage.getItem('selectedRole') || 'frontend';
  }

  ionViewWillEnter() {
  // 🔥 RESET EVERYTHING WHEN PAGE IS OPENED AGAIN
  this.questions = [];
  this.currentIndex = 0;
  this.finished = false;
  this.result = null;
  this.loading = false;
  this.userAnswer = '';

  // reload role in case changed
this.selectedRole = localStorage.getItem('selectedRole') || 'frontend';
}


start() {

  let finalRole = this.selectedRole;

  // 🔥 If custom selected, use typed role
  if (this.selectedRole === 'custom') {

    if (!this.customRole || !this.customRole.trim()) {
      alert('Please enter a custom role');
      return;
    }

    finalRole = this.customRole.trim().toLowerCase();
  }

  // Save final role globally
  localStorage.setItem('selectedRole', finalRole);

  this.loading = true;

  this.ai.startMockInterview(finalRole, this.difficulty, this.count).subscribe({
    next: (res: any) => {
      this.questions = res.questions.map((q: any) => ({
        ...q,
        userIndex: null,
        isCorrect: false
      }));

      this.currentIndex = 0;
      this.loading = false;
      this.startTimer();

    },
    error: () => {
      alert('Failed to start interview');
      this.loading = false;
    }
  });
}




submitAnswer() {

  const q = this.questions[this.currentIndex];

  if (q.userIndex === null || q.userIndex === undefined) {
    alert('Please select an option');
    return;
  }

  // Mark correctness
  q.isCorrect = q.userIndex === q.correctIndex;

  if (this.currentIndex < this.questions.length - 1) {
    this.currentIndex++;
      this.startTimer();   // 🔥 RESET TIMER FOR NEXT QUESTION

  } else {
    this.finishInterview();
  }
}

finishInterview() {
    if (this.timer) {
    clearInterval(this.timer);
  }
  this.loading = true;

  this.ai.evaluateMockInterview(this.role, this.questions).subscribe({
    next: (res: any) => {
      this.result = res;
      this.finished = true;
      // this.reviewMode = true;
      this.loading = false;
    },
    error: () => {
      alert('Evaluation failed');
      this.loading = false;
    }
  });
}

goToDashboard() {
  this.router.navigate(['/tabs/dashboard'], { replaceUrl: true });
}

restartInterview() {
  // Reset everything
  this.questions = [];
  this.currentIndex = 0;
  this.finished = false;
  this.result = null;

  // Go back to setup screen
}

async openRoleModal() {

  const modal = await this.modalCtrl.create({
    component: RoleSelectorComponent,
    componentProps: {
      roleGroups: this.roleGroups
    }
  });

  await modal.present();

  const { data } = await modal.onDidDismiss();

  if (data) {

    // 🔥 If user chose custom
    if (data === 'custom') {
      this.selectedRole = 'custom';
      this.customRole = '';
      return;   // show input field, do NOT save yet
    }

    // Normal role selected
    this.selectedRole = data.toLowerCase();
    localStorage.setItem('selectedRole', this.selectedRole);

    const toast = await this.toastCtrl.create({
      message: `Role selected: ${this.selectedRole}`,
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });

    toast.present();
  }
}


startTimer() {

  // Clear old timer
  if (this.timer) {
    clearInterval(this.timer);
  }

  this.timeLeft = this.timePerQuestion;

  this.timer = setInterval(() => {
    this.timeLeft--;

    // ⛔ Time over
    if (this.timeLeft <= 0) {
      clearInterval(this.timer);
      this.autoSubmit();
    }

  }, 1000);
}

autoSubmit() {

  const q = this.questions[this.currentIndex];

  // Mark unanswered if user did not select
  if (q.userIndex === null || q.userIndex === undefined) {
    q.userIndex = -1;       // special value = not answered
    q.isCorrect = false;
  } else {
    q.isCorrect = q.userIndex === q.correctIndex;
  }

  // Move next or finish
  if (this.currentIndex < this.questions.length - 1) {
    this.currentIndex++;
    this.startTimer();
  } else {
    this.finishInterview();
  }
}


}
