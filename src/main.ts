// main.ts
import './style.css';
import shaderCode from './add.wgsl?raw';

async function run() {
    if (!navigator.gpu) {
        document.body.innerHTML = 'WebGPU is not supported in your browser.';
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        document.body.innerHTML = 'Failed to get GPU adapter.';
        return;
    }

    const device = await adapter.requestDevice();

    const ARRAY_SIZE = 30;
    const dataSize = ARRAY_SIZE * Float32Array.BYTES_PER_ELEMENT;

    // Create input array 'a' with values from 1 to 30
    const aArray = new Float32Array(Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1));

    // Create input buffer
    const inBuffer = device.createBuffer({
        size: dataSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Create output buffer
    const outBuffer = device.createBuffer({
        size: dataSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    // Create a read buffer to read back the output
    const readBuffer = device.createBuffer({
        size: dataSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    // Write input data to the GPU
    device.queue.writeBuffer(inBuffer, 0, aArray.buffer);

    // Load the shader code
    const shaderModule = device.createShaderModule({
        code: shaderCode,
    });

    // Create compute pipeline
    const computePipeline = device.createComputePipeline({
        layout: 'auto',
        compute: {
            module: shaderModule,
            entryPoint: 'main',
        },
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: inBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: outBuffer,
                },
            },
        ],
    });

    // Create command encoder
    const commandEncoder = device.createCommandEncoder();

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, bindGroup);

    // Calculate workgroup sizes
    const workgroupSize = 9;
    const numWorkgroups = Math.ceil(ARRAY_SIZE / workgroupSize);
    computePass.dispatchWorkgroups(numWorkgroups);
    computePass.end();

    // Copy the output buffer to the read buffer
    commandEncoder.copyBufferToBuffer(
        outBuffer, 0,
        readBuffer, 0,
        dataSize
    );

    // Submit commands
    device.queue.submit([commandEncoder.finish()]);

    // Read the results
    await readBuffer.mapAsync(GPUMapMode.READ);
    const copyArrayBuffer = readBuffer.getMappedRange();

    // **Copy data before unmapping the buffer**
    const outArrayCopy = new Float32Array(copyArrayBuffer.slice(0));

    // Unmap buffer
    readBuffer.unmap();

    // Now it's safe to use 'outArrayCopy'
    const aValues = aArray.join(', ');
    const outValues = outArrayCopy.join(', ');

    document.body.innerHTML = `<p>a = [${aValues}]<br>out = [${outValues}]</p>`;
}

run();
