import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MatAnchor, MatButton } from "@angular/material/button";
@Component({
  selector: 'busnaa-pagination',
  templateUrl: './pagination.component.html',
  imports: [CommonModule, MatIconModule, TranslatePipe, MatAnchor,MatButton],
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() data: {
    nextPage: string,
    prevPage: string,
  } = {
      nextPage: '',
      prevPage: '',
    };
    count:number=0;
  @Output() pageChange: EventEmitter<string> = new EventEmitter<string>();
  nextPage(page: string) {
    this.count++;
    this.pageChange.emit(page)
  }
  prevPage(page: string){
    this.count--;
    this.pageChange.emit(page)
  }
}
