import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShowCardComponent } from './show-card.component';
import { Show } from '../../../../core/models/show.model';

function mockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Breaking Bad',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Thriller', 'Crime'],
    status: 'Ended',
    runtime: 60,
    premiered: '2008-01-20',
    ended: '2013-09-29',
    rating: { average: 9.2 },
    image: { medium: 'https://example.com/img.jpg', original: 'https://example.com/img-lg.jpg' },
    summary: 'A chemistry teacher turns to crime.',
    network: { id: 1, name: 'AMC' },
    isFavorite: false,
    ...overrides,
  };
}

describe('ShowCardComponent', () => {
  let fixture: ComponentFixture<ShowCardComponent>;
  let el: HTMLElement;

  function setup(show: Show) {
    TestBed.configureTestingModule({
      imports: [ShowCardComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ShowCardComponent);
    fixture.componentRef.setInput('show', show);
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  it('should render show name', () => {
    setup(mockShow());
    expect(el.querySelector('.card-title')?.textContent).toContain('Breaking Bad');
  });

  it('should render at most 2 genres', () => {
    setup(mockShow({ genres: ['Drama', 'Thriller', 'Crime'] }));
    const tags = el.querySelectorAll('.card-genres p-tag');
    expect(tags.length).toBe(2);
  });

  it('should render rating when present', () => {
    setup(mockShow({ rating: { average: 9.2 } }));
    expect(el.querySelector('.rating')?.textContent).toContain('9.2');
  });

  it('should render status', () => {
    setup(mockShow({ status: 'Ended' }));
    const statusEl = el.querySelector('.status');
    expect(statusEl?.textContent?.trim()).toBe('Ended');
    expect(statusEl?.classList.contains('ended')).toBeTrue();
  });

  it('should show placeholder image when image is null', () => {
    setup(mockShow({ image: null }));
    const img = el.querySelector('.card-poster') as HTMLImageElement;
    expect(img.src).toContain('placeholder');
  });

  it('should emit favoriteToggled with show id on favorite click', () => {
    setup(mockShow({ id: 42 }));
    spyOn(fixture.componentInstance.favoriteToggled, 'emit');

    const favBtn = el.querySelector('[aria-label="Add to favorites"]') as HTMLElement;
    favBtn?.click();

    expect(fixture.componentInstance.favoriteToggled.emit).toHaveBeenCalledWith(42);
  });

  it('should emit editRequested with show on edit click', () => {
    const show = mockShow({ id: 5 });
    setup(show);
    spyOn(fixture.componentInstance.editRequested, 'emit');

    const editBtn = el.querySelector('[aria-label="Edit show"]') as HTMLElement;
    editBtn?.click();

    expect(fixture.componentInstance.editRequested.emit).toHaveBeenCalledWith(show);
  });

  it('should emit deleteRequested with show id on delete click', () => {
    setup(mockShow({ id: 7 }));
    spyOn(fixture.componentInstance.deleteRequested, 'emit');

    const delBtn = el.querySelector('[aria-label="Delete show"]') as HTMLElement;
    delBtn?.click();

    expect(fixture.componentInstance.deleteRequested.emit).toHaveBeenCalledWith(7);
  });

  it('should link poster and title to /shows/:id', () => {
    setup(mockShow({ id: 99 }));
    const links = el.querySelectorAll('a[href="/shows/99"]');
    expect(links.length).toBe(2); // poster link + title link
  });
});
