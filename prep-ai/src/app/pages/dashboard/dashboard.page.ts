import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { AiService } from 'src/app/services/ai';
import { ActionSheetController } from '@ionic/angular';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class DashboardPage implements OnInit {
@ViewChild('topicChart', { static: false }) chartRef!: ElementRef;
chart: any;
serverConnected: boolean | null = null;

  totalQuestions = 0;
  averageScore = 0;
  accuracy = 0;
  weakTopics: any[] = [];
recentSessions: any[] = [];
  topicLabels: string[] = [];
  topicScores: number[] = [];
canResume = false;

  constructor(private router: Router, private ai: AiService,  private actionSheetCtrl: ActionSheetController) {}


  ngOnInit() {
  }

  ionViewWillEnter() {
      this.checkServerStatus();

      this.totalQuestions = 0;
 this.averageScore = 0;
  this.accuracy = 0;
  this.weakTopics = [];
this.recentSessions = [];
  this.topicLabels = [];
  this.topicScores = [];
  this.checkResume();   // 🔥 refresh every time user comes back
    const history = JSON.parse(localStorage.getItem('history') || '[]');
this.recentSessions = history.slice(-3).reverse();
console.log("recentSessions...", this.recentSessions);
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
    //   console.log("topic...",this.weakTopics);
this.loadWeakTopics();

    });
  }

  // ngAfterViewInit() {
  //   setTimeout(() => this.loadChart(), 300);
  // }
ionViewDidEnter() {
  this.loadChart();
}


loadChart() {

  if (!this.chartRef) return;

  const ctx = this.chartRef.nativeElement.getContext('2d');

  // 🔥 Destroy old chart if exists (important when coming back to dashboard)
  if (this.chart) {
    this.chart.destroy();
  }

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.topicLabels,
 datasets: [
  {
    label: 'Average Score per Topic',
    data: this.topicScores,
    backgroundColor: this.getBarColors(this.topicScores),
    borderRadius: 6,
    borderSkipped: false
  }
]

    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
  // 🔥 CLEAR ALL OLD SESSION DATA
  localStorage.removeItem('sessionQuestions');
  localStorage.removeItem('sessionAnswers');
  localStorage.removeItem('currentQuestionIndex');
  localStorage.removeItem('practiceMode');
  localStorage.removeItem('currentAnswer');
  localStorage.removeItem('currentAnswerIndex');
  localStorage.removeItem('mcqCorrectIndex');

  // Go to fresh role select
  this.router.navigate(['/tabs/role-select']);
}



resumePractice() {
this.router.navigate(['/tabs/practice']);
}

checkResume() {
  const session = localStorage.getItem('sessionQuestions');

  if (session) {
    const questions = JSON.parse(session);
    this.canResume = questions.length > 0;
  } else {
    this.canResume = false;
  }

}

practiceWeakTopic(topic: string) {
console.log("topic...",this.weakTopics, topic);
  // 🔥 CLEAR OLD SESSION
  localStorage.removeItem('sessionQuestions');
  localStorage.removeItem('currentQuestionIndex');

  // 🔥 SAVE SELECTED WEAK TOPIC
  localStorage.setItem('selectedTopic', topic);

  // Navigate to practice directly
  this.router.navigate(['/tabs/practice']);
}

loadWeakTopics() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');

  const topicMap: any = {};

  // Collect all scores by topic
  history.forEach((session: any) => {
    session.results.forEach((r: any) => {
      if (!topicMap[r.topic]) {
        topicMap[r.topic] = { total: 0, count: 0 };
      }

      topicMap[r.topic].total += r.score;
      topicMap[r.topic].count += 1;
    });
  });

  // Build weak topics list with average score
  const topics = Object.keys(topicMap).map(topic => {
    const avg = Math.round(topicMap[topic].total / topicMap[topic].count);

    return { topic, avg };
  });

  // Sort by weakest first (low score first)
  topics.sort((a, b) => a.avg - b.avg);

  // Take only weakest 8–10 topics (optional limit)
  this.weakTopics = topics.slice(0, 10);
}

getWeakColor(avg: number): string {

  if (avg <= 4) {
    return 'danger';   // 🔴 Very weak
  }

  if (avg <= 7) {
    return 'warning';  // 🟠 Medium weak
  }

  return 'tertiary';   // 🟡 Slight weak
}

getBarColors(scores: number[]): string[] {
  return scores.map(score => {

    if (score <= 4) {
      return '#ef4444';   // 🔴 Red - very weak
    }

    if (score <= 7) {
      return '#f59e0b';   // 🟠 Orange - medium
    }

    if (score <= 9) {
      return '#eab308';   // 🟡 Yellow - improving
    }

    return '#22c55e';     // 🟢 Green - strong
  });
}

checkServerStatus() {
  this.serverConnected = null; // loading state

  this.ai.checkServer().subscribe({
    next: () => {
      this.serverConnected = true;
    },
    error: () => {
      this.serverConnected = false;
    }
  });
}


openExplain(topic: string) {
  this.router.navigate(['/tabs/explain', encodeURIComponent(topic)]);
}

async openWeakTopicActions(topic: string) {

  const actionSheet = await this.actionSheetCtrl.create({
    header: `Topic: ${topic}`,
    buttons: [
      {
        text: '🎯 Practice this topic',
        handler: () => {
          this.practiceWeakTopic(topic);
        }
      },
      {
        text: '🧠 Explain this topic',
        handler: () => {
          this.openExplain(topic);
        }
      },
      {
        text: '📝 Quiz this topic',
        handler: () => {
          this.openQuizFromTopic(topic);   // 🔥 NEW
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
}

openQuizFromTopic(topic: string) {

  // 🔥 CLEAR OLD SESSION
  localStorage.removeItem('sessionQuestions');
  localStorage.removeItem('currentQuestionIndex');

  // Save quiz mode
  localStorage.setItem('practiceMode', 'topic-quiz');
  localStorage.setItem('selectedTopic', topic);

  // Go to practice page
  this.router.navigate(['/tabs/practice']);
}


}