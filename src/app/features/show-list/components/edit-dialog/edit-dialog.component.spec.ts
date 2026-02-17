import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditDialogComponent } from './edit-dialog.component';
import { Show } from '../../../../core/models/show.model';

function mockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Test Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Thriller'],
    status: 'Running',
    runtime: 60,
    premiered: '2020-01-01',
    ended: null,
    rating: { average: 7.5 },
    image: null,
    summary: '<p>A <b>great</b> show.</p>',
    network: null,
    ...overrides,
  };
}

describe('EditDialogComponent', () => {
  let fixture: ComponentFixture<EditDialogComponent>;
  let component: EditDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditDialogComponent, NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(EditDialogComponent);
    component = fixture.componentInstance;
  });

  it('should patch form values when show input is set', async () => {
    fixture.componentRef.setInput('show', mockShow({ name: 'My Show', genres: ['Comedy'] }));
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.get('name')?.value).toBe('My Show');
    expect(component.form.get('genres')?.value).toBe('Comedy');
  });

  it('should strip HTML from summary when patching', async () => {
    fixture.componentRef.setInput('show', mockShow({ summary: '<p>Hello <b>World</b></p>' }));
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.get('summary')?.value).toBe('Hello World');
  });

  it('should emit saved with parsed genres on save', async () => {
    fixture.componentRef.setInput('show', mockShow());
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({ name: 'Updated', summary: 'New summary', genres: 'Action, Sci-Fi' });
    spyOn(component.saved, 'emit');

    component.save();

    expect(component.saved.emit).toHaveBeenCalledWith({
      name: 'Updated',
      summary: 'New summary',
      genres: ['Action', 'Sci-Fi'],
    });
  });

  it('should not emit saved when form is invalid', async () => {
    fixture.componentRef.setInput('show', mockShow());
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({ name: '' });
    spyOn(component.saved, 'emit');

    component.save();

    expect(component.saved.emit).not.toHaveBeenCalled();
  });

  it('should reset form and emit closed on close', () => {
    fixture.componentRef.setInput('show', mockShow());
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    spyOn(component.closed, 'emit');

    component.close();

    expect(component.closed.emit).toHaveBeenCalled();
    expect(component.form.get('name')?.value).toBeNull();
  });
});
