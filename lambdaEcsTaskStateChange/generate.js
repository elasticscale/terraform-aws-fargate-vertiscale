const fargateConfigurations = {
    Windows: {
        1024: {
        memoryStart: 2048,
        memoryEnd: 8192,
        memoryStep: 1024,
        },
        2048: {
        memoryStart: 4096,
        memoryEnd: 16384,
        memoryStep: 1024,
        },
        4096: {
        memoryStart: 8192,
        memoryEnd: 30720,
        memoryStep: 1024,
        },
    },
    Linux: {
        // we can get away with ommitting the 512 mb as when this invokes would already be double
        256: {
        memoryStart: 1024,
        memoryEnd: 2048,
        memoryStep: 1024,
        },
        512: {
        memoryStart: 1024,
        memoryEnd: 4096,
        memoryStep: 1024,
        },
        1024: {
        memoryStart: 2048,
        memoryEnd: 8192,
        memoryStep: 1024,
        },
        2048: {
        memoryStart: 4096,
        memoryEnd: 16384,
        memoryStep: 1024,
        },
        4096: {
        memoryStart: 8192,
        memoryEnd: 30720,
        memoryStep: 1024,
        },
        8192: {
        memoryStart: 16384,
        memoryEnd: 61440,
        memoryStep: 4096,
        },
        16384: {
        memoryStart: 32768,
        memoryEnd: 122880,
        memoryStep: 8192,
        },
    },
};

for(const [platform, platformConfig] of Object.entries(fargateConfigurations)) {
    for(const [memory, memoryConfig] of Object.entries(platformConfig)) {
        const { memoryStart, memoryEnd, memoryStep } = memoryConfig;
        for(let i = memoryStart; i <= memoryEnd; i += memoryStep) {
            console.log(`{family: '${platform}', cpu: ${memory}, memory: ${i}},`)
        }
    }
}