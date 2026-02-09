import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IonContent, IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai';

@Component({
  selector: 'app-explain-modal',
  templateUrl: './explain-modal.component.html',
  styleUrls: ['./explain-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExplainModalComponent {
@ViewChild('replyBlock') replyBlock!: ElementRef;
@ViewChild(IonContent) pageContent!: IonContent;
  @Input() explanation = '';
  @Input() question = '';

  followText = '';
  followReply = '';
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private ai: AiService
  ) {}

  close() {
    this.modalCtrl.dismiss();
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
