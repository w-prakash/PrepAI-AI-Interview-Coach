import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplainTopicPage } from './explain-topic.page';

describe('ExplainTopicPage', () => {
  let component: ExplainTopicPage;
  let fixture: ComponentFixture<ExplainTopicPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplainTopicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
