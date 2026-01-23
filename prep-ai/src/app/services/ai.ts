import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = 'https://prep-ai-backend-xsoj.onrender.com/ai/evaluate';

  constructor(private http: HttpClient) {}

  evaluate(role: string, question: string, userAnswer: string) {
    return this.http.post<any>(this.apiUrl, {
      role,
      question,
      userAnswer
    });
  }
  getQuestion(role: string, difficulty: string,  topic?: any) {
  return this.http.post<any>('https://prep-ai-backend-xsoj.onrender.com/ai/question', {
    role,
    difficulty,
    topic
  });
}
getMcqQuestion(role: string, difficulty: string,  topic?: any) {
  return this.http.post<any>('https://prep-ai-backend-xsoj.onrender.com/ai/mcq-question', {
    role,
    difficulty,
    topic
  });
}

checkServer() {
  return this.http.get(
    'https://prep-ai-backend-xsoj.onrender.com/health'
  );
}
explainTopic(topic: string, role: string) {
  return this.http.post(
    'https://prep-ai-backend-xsoj.onrender.com/ai/explain',
    { topic, role }
  );
}


}
