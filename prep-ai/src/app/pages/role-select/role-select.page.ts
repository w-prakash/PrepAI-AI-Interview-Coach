import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RoleSelectPage {
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  mode: 'text' | 'mcq' = 'mcq';

  constructor(private router: Router) {}

selectRole(role: string) {
console.log("mode..", this.mode);
  // 🔥 CLEAR OLD SESSION COMPLETELY
  localStorage.removeItem('sessionQuestions');
  localStorage.removeItem('sessionAnswers');
  localStorage.removeItem('currentQuestionIndex');
  localStorage.removeItem('practiceMode');
  localStorage.removeItem('currentAnswer');
  localStorage.removeItem('currentAnswerIndex');
  localStorage.removeItem('mcqCorrectIndex');

  // Save new selections
  localStorage.setItem('selectedRole', role);
  localStorage.setItem('selectedDifficultfy', this.difficulty);
  localStorage.setItem('selectedMode', this.mode);

  // 🔥 Navigate fresh
  this.router.navigate(['/tabs/practice'], { replaceUrl: true });
}

}
