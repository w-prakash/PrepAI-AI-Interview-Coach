import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AiService } from '../../services/ai';

@Component({
  selector: 'app-explain-topic',
  templateUrl: './explain-topic.page.html',
  styleUrls: ['./explain-topic.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ExplainTopicPage implements OnInit {

  topic = '';
  role = '';
  explanation = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ai: AiService
  ) {}

  ngOnInit() {
    this.topic = decodeURIComponent(
      this.route.snapshot.paramMap.get('topic') || ''
    );

    this.role = localStorage.getItem('selectedRole') || 'frontend';

    this.ai.explainTopic(this.topic, this.role).subscribe({
      next: (res: any) => {
        this.explanation = res.explanation;
        this.loading = false;
      },
      error: () => {
        this.explanation = 'Failed to load explanation. Please try again.';
        this.loading = false;
      }
    });
  }
}
