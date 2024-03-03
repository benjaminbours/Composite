// // types
// import type { TFunction } from 'next-i18next';
// import type { SnackbarMessage } from 'notistack';
// import type { AxiosError } from 'axios';

// interface ApiError {
//   statusCode: number;
//   message: string;
//   error: string;
// }

// export function generateErrorNotification(
//   error: AxiosError,
//   t: TFunction,
// ): SnackbarMessage {
//   console.log(error);
//   let errorMessage: SnackbarMessage;
//   const data = error.response?.data as ApiError;
//   if (data) {
//     switch (data.statusCode) {
//       case 409:
//         if (data.message.includes('actor')) {
//           errorMessage = t('notification.unique-constraint-violation-actor');
//         } else {
//           errorMessage = t('notification.unique-constraint-violation-email');
//         }
//         break;
//       case 403:
//         errorMessage = t('notification.forbidden-error');
//         break;
//       case 400:
//         if (Array.isArray(data.message)) {
//           errorMessage = (
//             <ul>
//               {data.message.map((str: any) => {
//                 const text = (() => {
//                   switch (str) {
//                     case 'email must be an email':
//                       return t('notification.bad-request-error.email');
//                     default:
//                       return str;
//                   }
//                 })();
//                 return <li>{text}</li>;
//               })}
//             </ul>
//           );
//         } else {
//           errorMessage = t('notification.unknown-error');
//         }
//         break;
//       default:
//         errorMessage = t('notification.unknown-error');
//         break;
//     }
//   } else {
//     errorMessage = t('notification.unknown-error');
//   }

//   return errorMessage;
// }
