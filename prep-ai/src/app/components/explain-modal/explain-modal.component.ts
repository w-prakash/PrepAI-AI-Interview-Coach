import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai';

@Component({
  selector: 'app-explain-modal',
  templateUrl: './explain-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExplainModalComponent {

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
  }
}
