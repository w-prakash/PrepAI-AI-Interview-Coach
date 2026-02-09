import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AiService } from '../../services/ai';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explain-topic',
  templateUrl: './explain-topic.page.html',
  styleUrls: ['./explain-topic.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExplainTopicPage implements OnInit {
@ViewChild('replyBlock') replyBlock!: ElementRef;
@ViewChild(IonContent) pageContent!: IonContent;
  @Input() question = '';

  followText = '';
  followReply = '';


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
    askFollowUp() {

    if (!this.followText.trim()) return;

    const role = localStorage.getItem('selectedRole') || 'frontend';

    this.loading = true;

    this.ai.followUp({
      question: this.question,
      context: this.explanation,
      userQuery: this.followText,
      role
    }).subscribe({
      next: (res: any) => {
        this.followReply = res.reply;
        this.loading = false;
      },
      error: () => {
        this.followReply = 'Failed to get reply. Please try again.';
        this.loading = false;
      }
    });
setTimeout(async () => {
  if (!this.replyBlock) return;

  const y = this.replyBlock.nativeElement.offsetTop;
  await this.pageContent.scrollToPoint(0, y, 500);

  this.followText = "";
}, 1200);

  }
}
