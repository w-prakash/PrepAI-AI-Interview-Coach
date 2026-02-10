import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { RoleSelectorComponent } from 'src/app/components/role-selector/role-selector.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.page.html',
  styleUrls: ['./role-select.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RoleSelectPage {
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  mode = 'mcq';
@ViewChild('thumb', { static: false }) thumb!: ElementRef;
@ViewChild('track', { static: false }) track!: ElementRef;
@ViewChild('fill', { static: false }) fill!: ElementRef;

isDragging = false;
startX = 0;
maxTranslate = 0;
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
roleJustSelected = false;

selectedRole: string = '';
customRole: string = '';
searchText: string = '';

constructor(
  private router: Router,
  private modalCtrl: ModalController,
  private toastCtrl: ToastController
) {}

  ionViewWillEnter() {
      const lastRole = localStorage.getItem('selectedRole');
  if (lastRole) {
    this.selectedRole = lastRole;
  }
    const saved = localStorage.getItem('selectedMode');
  if (saved) {
    this.mode = saved;
  }

  }

  getFilteredRoles(group: any) {
  if (!this.searchText) return group.roles;

  return group.roles.filter((r: string) =>
    r.toLowerCase().includes(this.searchText.toLowerCase())
  );
}


startPractice() {
  console.log( this.selectedRole, this.mode);
  let roleToSave = this.selectedRole;

  // If custom role selected
  if (this.selectedRole === 'custom') {
    if (!this.customRole.trim()) {
      alert('Please enter a custom role');
      return;
    }
    roleToSave = this.customRole.trim();
  }

  // 🔥 CLEAR OLD SESSION COMPLETELY
  localStorage.removeItem('sessionQuestions');
  localStorage.removeItem('sessionAnswers');
  localStorage.removeItem('currentQuestionIndex');
  localStorage.removeItem('practiceMode');
  localStorage.removeItem('currentAnswer');
  localStorage.removeItem('currentAnswerIndex');
  localStorage.removeItem('mcqCorrectIndex');
  localStorage.removeItem('selectedTopic');

  // Save selections
  localStorage.setItem('selectedRole', roleToSave);
  localStorage.setItem('selectedDifficulty', this.difficulty);
  localStorage.setItem('selectedMode', this.mode);

  console.log('Starting practice for:', roleToSave);

  // Navigate to practice page
  this.router.navigate(['/tabs/practice'], { replaceUrl: true });
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
    this.selectedRole = data.toLowerCase();
    localStorage.setItem('selectedRole', this.selectedRole);
      // 🔔 SHOW TOAST
  const toast = await this.toastCtrl.create({
    message: `Role selected: ${this.selectedRole}`,
    duration: 1500,
    position: 'bottom',
    color: 'success'
  });

  toast.present();
  }
}



get canStart() {
  return !!(this.selectedRole || this.customRole) && !!this.difficulty && !!this.mode;
}

onSwipeStart(event: PointerEvent) {
  this.isDragging = true;

  const trackWidth = this.track.nativeElement.offsetWidth;
  const thumbWidth = this.thumb.nativeElement.offsetWidth;

  this.maxTranslate = trackWidth - thumbWidth - 8;
  this.startX = event.clientX;

  (event.target as HTMLElement).setPointerCapture(event.pointerId);
}

onSwipeMove(event: PointerEvent) {
  if (!this.isDragging) return;

  const deltaX = event.clientX - this.startX;
  const translateX = Math.min(Math.max(deltaX, 0), this.maxTranslate);

  this.thumb.nativeElement.style.transform =
    `translateX(${translateX}px)`;

  this.fill.nativeElement.style.width =
    `${translateX + 46}px`;
}

onSwipeEnd() {
  if (!this.isDragging) return;
  this.isDragging = false;

  const currentX =
    parseFloat(
      this.thumb.nativeElement.style.transform.replace(/[^\d.]/g, '')
    ) || 0;

  if (currentX >= this.maxTranslate * 0.85) {
    this.triggerSuccess();
    return;
  }

  this.resetSwipe();
}

onTapFallback() {
  this.triggerSuccess();
}

triggerSuccess() {
  // Haptic feedback (mobile only)
  if ('vibrate' in navigator) {
    navigator.vibrate(40);
  }

  this.fill.nativeElement.style.width = '100%';
  this.thumb.nativeElement.classList.add('success');

  setTimeout(() => {
    this.startPractice();
    this.resetSwipe();
  }, 300);
}

onModeChange(ev: any) {
  console.log(ev);
  localStorage.setItem('selectedMode', ev.detail.value);
}

resetSwipe() {
  this.thumb.nativeElement.style.transform = 'translateX(0)';
  this.fill.nativeElement.style.width = '0';
  this.thumb.nativeElement.classList.remove('success');
}

selectMode(val: string) {
  this.mode = val;
  localStorage.setItem('selectedMode', val);
  console.log('Selected:', val);
}

}
