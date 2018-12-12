import { Component } from '@angular/core';
@Component({
  selector: 'mock-component',
  template: '<p>Mock Component</p>'
})
export class MockComponent {}

export const mockRoutes = [
  { path: '', component: MockComponent },
  { path: 'color-palette', component: MockComponent },
  { path: 'color-palette/:id', component: MockComponent }
];
