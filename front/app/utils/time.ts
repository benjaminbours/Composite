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
