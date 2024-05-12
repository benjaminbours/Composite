import { configureServices } from '../core/frameworks/inversify.config';

export function setupProjectEnv(executionContext: 'client' | 'server') {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('No variable NEXT_PUBLIC_BACKEND_URL found');
    }

    let apiOrigin = process.env.NEXT_PUBLIC_BACKEND_URL!;
    if (executionContext === 'server') {
        if (!process.env.INTERNAL_BACKEND_URL) {
            throw new Error('No variable INTERNAL_BACKEND_URL found');
        }
        apiOrigin = process.env.INTERNAL_BACKEND_URL!;
    }

    configureServices({
        api: {
            origin: apiOrigin,
        },
    });
}
