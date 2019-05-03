import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatCardModule,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatMenuModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { ColorPaletteConfirmDeleteModalComponent } from '../color-palette-confirm-delete-modal/color-palette-confirm-delete-modal.component';
import { MockComponent, mockRoutes } from './../../../../../mock/routes.mock';
import {
  DeleteColorPalette,
  SetSelectedColorPalette
} from './../../../core/state/color-palette.actions';
import { ColorPaletteState } from './../../../core/state/color-palette.state';
import { ColorPaletteCardComponent } from './color-palette-card.component';

describe('ColorPaletteCardComponent', () => {
  let component: ColorPaletteCardComponent;
  let fixture: ComponentFixture<ColorPaletteCardComponent>;
  let store: Store;
  let dialog: any;
  let router: any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes(mockRoutes)
      ],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
        }
      ],
      declarations: [ColorPaletteCardComponent, MockComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteCardComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    dialog = TestBed.get(MatDialog);
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open color palette confirmation modal with color palette title when deleteColorPalette method called', () => {
    const modalResult = true;
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(modalResult)
    });
    component.colorPalette = {
      id: '49805fbc-11da-40ec-be35-c10774f22739',
      title: 'test',
      data: ['#555']
    };
    component.deleteColorPalette(component.colorPalette.id);
    expect(dialog.open).toHaveBeenCalledWith(
      ColorPaletteConfirmDeleteModalComponent,
      {
        width: '550px',
        data: {
          title: 'test'
        }
      }
    );
  });

  it('should dispatch DeleteColorPalette action when delete confirmation dialog  closes with confirmation', () => {
    const modalResult = true;
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(modalResult)
    });
    spyOn(store, 'dispatch');
    component.colorPalette = {
      id: '49805fbc-11da-40ec-be35-c10774f22739',
      title: 'test',
      data: ['#555']
    };
    component.deleteColorPalette(component.colorPalette.id);
    expect(store.dispatch).toHaveBeenCalledWith(
      new DeleteColorPalette(component.colorPalette.id)
    );
  });
  it('should not dispatch DeleteColorPalette action when delete confirmation dialog  closes without confirmation', () => {
    const modalResult = null;
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(modalResult)
    });
    spyOn(store, 'dispatch');
    component.colorPalette = {
      id: '49805fbc-11da-40ec-be35-c10774f22739',
      title: 'test',
      data: ['#555']
    };
    component.deleteColorPalette(component.colorPalette.id);
    expect(store.dispatch).not.toHaveBeenCalledWith(
      new DeleteColorPalette(component.colorPalette.id)
    );
  });

  it('should got to color palette page', () => {
    spyOn(store, 'dispatch');
    component.colorPalette = {
      id: '49805fbc-11da-40ec-be35-c10774f22739',
      title: 'test',
      data: ['#555']
    };
    component.goToColorPalette();
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetSelectedColorPalette(component.colorPalette.id)
    );
    expect(router.navigate).toHaveBeenCalledWith([
      `/color-palette/${component.colorPalette.id}`
    ]);
  });
});
