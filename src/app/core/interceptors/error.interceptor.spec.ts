import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should intercept and handle 404 error', done => {
    const testUrl = '/api/test';
    const errorMessage = 'Not Found';

    spyOn(console, 'error');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe(errorMessage);
        expect(console.error).toHaveBeenCalledWith(
          'Error HTTP interceptado:',
          `Error 404: Http failure response for ${testUrl}: 404 ${errorMessage}`,
          error
        );
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 404, statusText: errorMessage });
  });

  it('should intercept and handle 500 error', done => {
    const testUrl = '/api/test';
    const errorMessage = 'Internal Server Error';

    spyOn(console, 'error');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 500, statusText: errorMessage });
  });

  it('should intercept and handle 401 unauthorized error', done => {
    const testUrl = '/api/secure';
    const errorMessage = 'Unauthorized';

    spyOn(console, 'error');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed with 401 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.statusText).toBe(errorMessage);
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 401, statusText: errorMessage });
  });

  it('should intercept and handle 403 forbidden error', done => {
    const testUrl = '/api/forbidden';
    const errorMessage = 'Forbidden';

    spyOn(console, 'error');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed with 403 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 403, statusText: errorMessage });
  });

  it('should handle client-side error', done => {
    const testUrl = '/api/test';
    const clientError = new ErrorEvent('Network error', {
      message: 'Conexión perdida'
    });

    spyOn(console, 'error');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed with client error'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).toEqual(clientError);
        expect(console.error).toHaveBeenCalledWith(
          'Error HTTP interceptado:',
          'Error: Conexión perdida',
          error
        );
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.error(clientError);
  });

  it('should pass through successful requests', done => {
    const testUrl = '/api/test';
    const testData = { data: 'test' };

    httpClient.get(testUrl).subscribe({
      next: data => {
        expect(data).toEqual(testData);
        done();
      },
      error: () => fail('should not have failed')
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(testData);
  });

  it('should intercept and handle 400 bad request', done => {
    const testUrl = '/api/test';
    const errorMessage = 'Bad Request';

    spyOn(console, 'error');

    httpClient.post(testUrl, {}).subscribe({
      next: () => fail('should have failed with 400 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 400, statusText: errorMessage });
  });
});
