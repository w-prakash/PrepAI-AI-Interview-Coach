import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockInterviewPage } from './mock-interview.page';

describe('MockInterviewPage', () => {
  let component: MockInterviewPage;
  let fixture: ComponentFixture<MockInterviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MockInterviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
