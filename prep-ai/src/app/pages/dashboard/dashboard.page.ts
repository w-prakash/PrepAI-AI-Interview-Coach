import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class DashboardPage implements OnInit, AfterViewInit {

  totalQuestions = 0;
  averageScore = 0;
  accuracy = 0;
  weakTopics: string[] = [];
recentSessions: any[] = [];
  topicLabels: string[] = [];
  topicScores: number[] = [];
canResume = false;
  constructor(private router: Router) {}


  ngOnInit() {
    const session = localStorage.getItem('sessionQuestions');
this.canResume = !!session;
    const history = JSON.parse(localStorage.getItem('history') || '[]');
this.recentSessions = history.slice(-3).reverse();
    if (!history.length) return;

    const topicMap: any = {};
    let totalScore = 0;
    let correctCount = 0;

    history.forEach((session: any) => {
      if (session.results) {
        session.results.forEach((r: any) => {
          this.totalQuestions++;
          totalScore += r.score;

          if (r.score >= 7) correctCount++;

          if (!topicMap[r.topic]) {
            topicMap[r.topic] = { total: 0, count: 0 };
          }

          topicMap[r.topic].total += r.score;
          topicMap[r.topic].count++;
        });
      }
    });

    this.averageScore = Math.round(totalScore / this.totalQuestions);
    this.accuracy = Math.round((correctCount / this.totalQuestions) * 100);

    // Prepare topic-wise chart data
    Object.keys(topicMap).forEach(topic => {
      const avg = Math.round(topicMap[topic].total / topicMap[topic].count);
      this.topicLabels.push(topic);
      this.topicScores.push(avg);

      if (avg < 6) {
        this.weakTopics.push(topic);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.loadChart(), 300);
  }

  loadChart() {
    const ctx: any = document.getElementById('topicChart');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.topicLabels,
        datasets: [
          {
            label: 'Average Score per Topic',
            data: this.topicScores,
            backgroundColor: '#4f46e5'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  }

startPractice() {
    localStorage.removeItem('practiceMode');
localStorage.removeItem('sessionQuestions');
this.router.navigate(['/tabs/role-select']);
}


resumePractice() {
this.router.navigate(['/tabs/practice']);
}

}