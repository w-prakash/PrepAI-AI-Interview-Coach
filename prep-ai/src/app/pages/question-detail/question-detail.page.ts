import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';


@Component({
selector: 'app-question-detail',
templateUrl: './question-detail.page.html',
styleUrls: ['./question-detail.page.scss'],
standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class QuestionDetailPage implements OnInit {


question: any;


constructor(
private route: ActivatedRoute,
private router: Router
) {}


ngOnInit() {
const sessionIndex = Number(this.route.snapshot.paramMap.get('sessionIndex'));
const questionIndex = Number(this.route.snapshot.paramMap.get('questionIndex'));


const history = JSON.parse(localStorage.getItem('history') || '[]').reverse();


const session = history[sessionIndex];


if (!session || !session.results[questionIndex]) {
this.router.navigate(['/tabs/history']);
return;
}


this.question = session.results[questionIndex];
console.log("questionss...", this.question);
}
}