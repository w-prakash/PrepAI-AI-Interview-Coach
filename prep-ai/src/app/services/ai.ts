import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as env from '../../environments/environment';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  // private apiUrl = 'https://prep-ai-backend-2xpj.onrender.com/ai/evaluate';
  private apiUrl = environment.baseUrl;



  constructor(private http: HttpClient) {
    console.log('production:', environment.production);
console.log('baseUrl:', environment.baseUrl);

  }

  evaluate(role: string, question: string, userAnswer: string) {
    return this.http.post<any>(`${this.apiUrl}ai/evaluatex`, {
      role,
      question,
      userAnswer
    });
  }
  getQuestion(role: string, difficulty: string,  topic?: any) {
  return this.http.post<any>(`${this.apiUrl}ai/question`, {
    role,
    difficulty,
    topic
  });
}
getMcqQuestion(role: string, difficulty: string,  topic?: any) {
  return this.http.post<any>(`${this.apiUrl}ai/mcq-question`, {
    role,
    difficulty,
    topic
  });
}

checkServer() {
  return this.http.get(
    `${this.apiUrl}health`
  );
}
explainTopic(topic: string, role: string) {
  return this.http.post(
    `${this.apiUrl}ai/explain`,
    { topic, role }
  );
}

quizFromTopic(topic: string, role: string) {
  return this.http.post(
    `${this.apiUrl}ai/quiz-topic`,
    { topic, role }
  );
}
explainWrong(data: {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  role: string;
}) {
  return this.http.post(
    `${this.apiUrl}ai/explain-wrong`,
    data
  );
}
followUp(data: {
  question: string;
  context: string;
  userQuery: string;
  role: string;
}) {
  return this.http.post(
    `${this.apiUrl}ai/followup`,
    data
  );
}
startMockInterview(role: string, difficulty: string, count: number) {
  return this.http.post(
    `${this.apiUrl}ai/mock-interview/start`,
    { role, difficulty, count }
  );
}

evaluateMockInterview(role: string, answers: any[]) {
  return this.http.post(
    `${this.apiUrl}ai/mock-interview/evaluate`,
    { role, answers }
  );
}


}
