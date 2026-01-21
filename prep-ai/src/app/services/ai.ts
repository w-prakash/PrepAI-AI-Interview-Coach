import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = 'http://localhost:3000/ai/evaluate';

  constructor(private http: HttpClient) {}

  evaluate(role: string, question: string, userAnswer: string) {
    return this.http.post<any>(this.apiUrl, {
      role,
      question,
      userAnswer
    });
  }
  getQuestion(role: string, difficulty: string) {
  return this.http.post<any>('http://localhost:3000/ai/question', {
    role,
    difficulty
  });
}
getMcqQuestion(role: string, difficulty: string) {
  return this.http.post<any>('http://localhost:3000/ai/mcq-question', {
    role,
    difficulty
  });
}

}
