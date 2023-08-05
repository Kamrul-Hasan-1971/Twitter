// trends.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.scss']
})
export class TrendsComponent implements OnInit {

  trends: string[] = [
    'TechCare',
    'Technology',
    'Design',
    'Development',
    'Angular',
    'NodeJS',
    'ExpressJS',
    'JavaScript',
    'TypeScript',
    'CSS',
    'HTML'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
