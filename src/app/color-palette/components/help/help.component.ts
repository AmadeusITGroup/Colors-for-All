import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cm-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule]
})
export class HelpComponent {
  constructor(public dialogRef: MatDialogRef<HelpComponent>) { }

  public close(): void {
    this.dialogRef.close();
  }
}
