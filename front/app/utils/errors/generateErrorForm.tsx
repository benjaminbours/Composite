import type { RJSFValidationError } from '@rjsf/utils';
import type { getDictionary } from '../../../getDictionary';

export const generateErrorForm =
    (dictionary: Awaited<ReturnType<typeof getDictionary>>['common']) =>
    (errors: RJSFValidationError[]) => {
        return errors.map((error) => {
            switch (true) {
                case error.name === 'minLength' &&
                    (error.property === '.password' ||
                        error.property === '.confirmPassword'):
                    error.message =
                        dictionary.form.validation['password-min-length'];
                    break;
            }
            return error;
        });
    };
