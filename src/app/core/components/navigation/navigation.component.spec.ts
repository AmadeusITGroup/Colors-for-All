import { LayoutModule } from '@angular/cdk/layout';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatMenuModule,
  MatToolbarModule
} from '@angular/material';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import * as uuid from 'uuid';

import { ColorPaletteSaveModalComponent } from '../color-palette-save-modal/color-palette-save-modal.component';
import { MockComponent, mockRoutes } from './../../../../../mock/routes.mock';
import { ColorPaletteConfirmDeleteModalComponent } from './../../../color-palette/components/color-palette-confirm-delete-modal/color-palette-confirm-delete-modal.component';
import { ScreenSize } from './../../enums/screen-size.enum';
import { ColorPalette } from './../../models/color-palette.model';
import {
  DeleteColorPalette,
  SaveColorPalette
} from './../../state/color-palette.actions';
import { ColorPaletteState } from './../../state/color-palette.state';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let store: Store;
  let router: any;
  let dialog: any;
  const colorPaletteId = '4564';
  const selectedColorPaletteSnapShot = {
    id: colorPaletteId,
    title: 'colorPaletteForTest',
    data: ['#444', '#555']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        LayoutModule,
        MatDialogModule,
        MatToolbarModule,
        MatSidenavModule,
        MatButtonModule,
        BrowserAnimationsModule,
        NgxsModule.forRoot([ColorPaletteState]),
        RouterTestingModule.withRoutes(mockRoutes)
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
        }
      ],
      declarations: [NavigationComponent, MockComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    dialog = TestBed.get(MatDialog);
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('Should initialize', () => {
    spyOn(router.events, 'subscribe').and.callFake(() => of({}));
    spyOn(component.selectedColorPalette$, 'subscribe');
    component.ngOnInit();
    expect(router.events.subscribe).toHaveBeenCalled();
    expect(component.currentScreenSize).toEqual(ScreenSize.LARGE);
    expect(component.selectedColorPalette$.subscribe).toHaveBeenCalled();
  });

  it('Should navigate to help when goToHelp method called', () => {
    spyOn(router, 'navigate').and.callFake(() => {});
    component.goToHelp();
    expect(router.navigate).toHaveBeenCalledWith(['/color-palette/help']);
  });

  it('Should navigate to color palette list when goBackToColorPaletteList method called', () => {
    spyOn(router, 'navigate').and.callFake(() => {});
    component.goBackToColorPaletteList();
    expect(router.navigate).toHaveBeenCalledWith(['/color-palette']);
  });

  describe('When createColorPalette activated', () => {
    const modalResult = { title: 'test', data: ['#777'] };
    it('should open colorPalette creation modal', () => {
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of() });

      component.createColorPalette();

      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Create' }
      });
    });

    it('should dispatch SaveColorPalette when color palette modal closed an result not undefined', () => {
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(modalResult)
      });
      spyOn(store, 'dispatch');
      spyOn(router, 'navigate').and.callFake(() => {});

      component.createColorPalette();

      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Create' }
      });
      expect(store.dispatch).toHaveBeenCalledWith(
        new SaveColorPalette(modalResult)
      );
    });
  });
  describe('When editColorPalette activated', () => {
    const modalResult = {
      id: colorPaletteId,
      title: 'colorPalette for test',
      data: ['#444', '#555', '#777']
    };
    it('should open colorPalette edit modal', () => {
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of() });
      spyOn(router, 'navigate').and.callFake(() => {});

      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      component.editColorPalette(colorPaletteId);

      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Edit', colorPalette: selectedColorPaletteSnapShot }
      });
    });

    it('should dispatch SaveColorPalette when color palette modal closed an result not undefined', () => {
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(modalResult)
      });
      spyOn(store, 'dispatch');
      spyOn(router, 'navigate').and.callFake(() => {});

      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      component.editColorPalette(colorPaletteId);

      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Edit', colorPalette: selectedColorPaletteSnapShot }
      });
      expect(store.dispatch).toHaveBeenCalledWith(
        new SaveColorPalette(modalResult)
      );
    });
  });

  describe('When deleteColorPalette activated', () => {
    it('should open color palette delete confirmation modal', () => {
      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of() });
      spyOn(router, 'navigate').and.callFake(() => {});

      component.deleteColorPalette(colorPaletteId);
      expect(dialog.open).toHaveBeenCalledWith(
        ColorPaletteConfirmDeleteModalComponent,
        {
          width: '550px',
          data: { title: selectedColorPaletteSnapShot.title }
        }
      );
    });

    it('should dispatch DeleteColorPalette when color palette modal closed an result not undefined', () => {
      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(true)
      });
      spyOn(store, 'dispatch');
      spyOn(router, 'navigate').and.callFake(() => {});

      component.deleteColorPalette(colorPaletteId);
      expect(dialog.open).toHaveBeenCalledWith(
        ColorPaletteConfirmDeleteModalComponent,
        {
          width: '550px',
          data: { title: selectedColorPaletteSnapShot.title }
        }
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new DeleteColorPalette(colorPaletteId)
      );
    });
  });

  describe('When duplicateColorPalette activated', () => {
    const duplicatedColorPalette = {
      id: '1234',
      title: `${selectedColorPaletteSnapShot.title}_Copy`,
      data: selectedColorPaletteSnapShot.data
    } as ColorPalette;
    const modalResult = {
      ...duplicatedColorPalette,
      ...{ data: ['#456', '#789'] }
    };
    it('should open color palette delete confirmation modal', () => {
      spyOn(uuid, 'v4').and.returnValue('1234');
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of() });
      spyOn(router, 'navigate').and.callFake(() => {});

      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      component.duplicateColorPalette(duplicatedColorPalette.id);

      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Edit', colorPalette: duplicatedColorPalette }
      });
    });

    it('should dispatch duplicateColorPalette when color palette modal closed an result not undefined', () => {
      spyOn(uuid, 'v4').and.returnValue('1234');
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(modalResult)
      });
      spyOn(store, 'dispatch');
      spyOn(router, 'navigate').and.callFake(() => {});
      component.selectedColorPaletteSnapShot = selectedColorPaletteSnapShot;
      component.duplicateColorPalette(duplicatedColorPalette.id);

      expect(store.dispatch).toHaveBeenCalledWith(
        new SaveColorPalette(duplicatedColorPalette)
      );
      expect(dialog.open).toHaveBeenCalledWith(ColorPaletteSaveModalComponent, {
        width: '500px',
        height: '500px',
        data: { action: 'Edit', colorPalette: duplicatedColorPalette }
      });
      expect(store.dispatch).toHaveBeenCalledWith(
        new SaveColorPalette(modalResult)
      );
    });
  });
});
