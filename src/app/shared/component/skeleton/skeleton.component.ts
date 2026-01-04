import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'busnaa-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  standalone: true,
  imports: []
})
export class SkeletonComponent implements OnInit {
  @Input() 
  type: string = "card";
  
  constructor() { }

  ngOnInit(): void {

  }

}
