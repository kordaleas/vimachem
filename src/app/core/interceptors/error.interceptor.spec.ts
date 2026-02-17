import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: messageService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show toast and re-throw on HTTP error', () => {
    http.get('/api/test').subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        expect(err.status).toBe(404);
      },
    });

    httpTesting.expectOne('/api/test').flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error 404',
        life: 5000,
      }),
    );
  });

  it('should not call messageService on success', () => {
    http.get('/api/test').subscribe();

    httpTesting.expectOne('/api/test').flush({ data: 'ok' });

    expect(messageService.add).not.toHaveBeenCalled();
  });
});
