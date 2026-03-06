async function test() {
    console.log("Starting...");
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("timeout")), 1000);
    });

    const aiCall = new Promise(resolve => setTimeout(() => resolve("done"), 500));

    try {
        await Promise.race([aiCall, timeoutPromise]).finally(() => {
            // NOT clearing the timeout intentionally to see what happens
        });
    } catch (e) {
        console.error("Caught error:", e);
    }

    console.log("Finished test(), waiting for 2 seconds to see if node crashes...");
}

test();
