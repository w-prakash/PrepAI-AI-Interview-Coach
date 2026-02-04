import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-role-selector',
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.scss'],
    standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RoleSelectorComponent {

  @Input() roleGroups: any[] = [];

  searchText: string = '';

  constructor(private modalCtrl: ModalController) {}

  getFilteredRoles(group: any) {
    if (!this.searchText) return group.roles;

    return group.roles.filter((r: string) =>
      r.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectRole(role: string) {
    console.log("selectRole...", role);
    this.modalCtrl.dismiss(role);
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

  getRoleClass(role: string): string {
  return (
    'role-' +
    role
      .toLowerCase()
      .replace(/\./g, '')   // remove dots
      .replace(/\s+/g, '')  // remove spaces
  );
}

}
