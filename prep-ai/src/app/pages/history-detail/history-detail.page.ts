import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HistoryDetailPage implements OnInit, AfterViewInit {
  session: any;
  weakestIndex = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const index = Number(this.route.snapshot.paramMap.get('index'));
    const history = JSON.parse(
      localStorage.getItem('history') || '[]',
    ).reverse();

    this.session = history[index];

    if (!this.session) {
      this.router.navigate(['/tabs/history']);
      return;
    }

    // 🔥 FIND WEAKEST QUESTION
    let minScore = 11;
    this.session.results.forEach((r: any, i: number) => {
      if (r.score < minScore) {
        minScore = r.score;
        this.weakestIndex = i;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.session) {
        this.loadChart();
      }
    }, 300);
  }

  loadChart() {
    const labels = this.session.results.map((_: any, i: number) => `Q${i + 1}`);
    const scores = this.session.results.map((r: any) => r.score);

    const ctx: any = document.getElementById('questionChart');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Score per Question',
            data: scores,
            backgroundColor: scores.map((s: number, i: number) => {
              if (i === this.weakestIndex) return '#f97316'; // 🔥 Orange = weakest
              return s >= 7 ? '#10b981' : '#ef4444';
            }),
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
          },
        },
      },
    });
  }

  goBack() {
    this.router.navigate(['/tabs/history']);
  }

  openQuestion(questionIndex: number) {
const sessionIndex = Number(this.route.snapshot.paramMap.get('index'));
this.router.navigate(['/question-detail', sessionIndex, questionIndex]);
}
}
