import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HistoryPage implements OnInit {
sessions: any[] = [];
constructor(private router: Router) {}
  ngOnInit() {
  }

  ionViewWillEnter() {
        this.sessions = JSON.parse(localStorage.getItem('history') || '[]').reverse();
  }

    clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('history');
      this.sessions = [];
    }
  }

  openSession(index: number) {
this.router.navigate(['/history-detail', index]);
}

}
