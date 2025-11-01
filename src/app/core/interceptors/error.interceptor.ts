import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        errorMessage = `Error ${error.status}: ${error.message}`;
      }

      console.error('Error HTTP interceptado:', errorMessage, error);

      // Aquí podrías mostrar un toast/snackbar al usuario
      // Por ahora solo logueamos el error

      return throwError(() => error);
    })
  );
};
