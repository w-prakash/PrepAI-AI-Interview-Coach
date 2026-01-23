import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explain-modal',
  templateUrl: './explain-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ExplainModalComponent {

  @Input() explanation = '';

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }
}
