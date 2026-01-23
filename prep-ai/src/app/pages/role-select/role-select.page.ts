import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { RoleSelectorComponent } from 'src/app/components/role-selector/role-selector.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RoleSelectPage {
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  mode: 'text' | 'mcq' = 'mcq';
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
  }

  getFilteredRoles(group: any) {
  if (!this.searchText) return group.roles;

  return group.roles.filter((r: string) =>
    r.toLowerCase().includes(this.searchText.toLowerCase())
  );
}


startPractice() {

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



}
