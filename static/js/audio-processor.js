class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this.bufferSize = options.processorOptions.bufferSize;
    this.audioBuffer = [];
  }

  process(inputs, outputs, parameters) {
    const inputData = inputs[0][0];
    if (!inputData) {
      return true;
    }

    for (let i = 0; i < inputData.length; i++) {
      this.audioBuffer.push(inputData[i]);
    }

    if (this.audioBuffer.length >= this.bufferSize) {
      const sendData = new Float32Array(
        this.audioBuffer.slice(0, this.bufferSize)
      );
      // rm sent data
      this.audioBuffer = this.audioBuffer.slice(this.bufferSize);
      this.port.postMessage(sendData);
    }

    return true;
  }
}
registerProcessor("audioProcessor", AudioProcessor);
