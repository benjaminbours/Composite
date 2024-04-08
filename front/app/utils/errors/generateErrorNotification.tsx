// types
import type { SnackbarMessage } from 'notistack';
import { getDictionary } from '../../../getDictionary';

interface ApiError {
    statusCode: number;
    message: string;
    error: string;
}

export function generateErrorNotification(
    { statusCode, message }: ApiError,
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'],
): SnackbarMessage {
    let errorMessage: SnackbarMessage;
    switch (statusCode) {
        case 409:
            errorMessage = dictionary.notification['error-user-name-taken'];
            break;
        case 403:
            errorMessage = dictionary.notification['error-forbidden'];
            break;
        case 400:
            if (Array.isArray(message)) {
                errorMessage = (
                    <ul>
                        {message.map((str: any, index) => {
                            const text = (() => {
                                switch (str) {
                                    case 'email must be an email':
                                        return dictionary.notification[
                                            'error-bad-request'
                                        ].email;
                                    default:
                                        return str;
                                }
                            })();
                            return <li key={index}>{text}</li>;
                        })}
                    </ul>
                );
            } else {
                errorMessage = dictionary.notification['error-unknown'];
            }
            break;
        default:
            errorMessage = dictionary.notification['error-unknown'];
            break;
    }

    return errorMessage;
}
