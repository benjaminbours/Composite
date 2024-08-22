export const waitUntilConditionMet = async <T>(
    conditionCallback: () => Promise<{ conditionMet: boolean; data: T }>,
    maxAttempts: number = 20,
    interval: number = 1000, // 1 second
): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { conditionMet, data } = await conditionCallback().catch(
            (err) => {
                console.error(err);
                throw new Error(
                    `Error while checking condition: ${err.message}`,
                );
            },
        );

        if (conditionMet) {
            return data;
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(
        `Condition not met after polling for ${maxAttempts} seconds.`,
    );
};

export const formatElapsedTime = (elapsedTime: number): string => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const hundredthsOfSecond = Math.floor((elapsedTime % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredthsOfSecond.toString().padStart(2, '0')}`;
};
