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
  mode: 'text' | 'mcq' = 'text';

  constructor(private router: Router) {}

  selectRole(role: string) {
    localStorage.setItem('selectedRole', role);
    localStorage.setItem('selectedDifficulty', this.difficulty);
        localStorage.setItem('selectedMode', this.mode);

  // 🔥 Navigate inside tabs
  this.router.navigate(['/tabs/practice']);  }
}
