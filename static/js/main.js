import {
  getAudioInputDevices,
  inDeviceNameMap,
  getAudioOutputDevices,
  outDeviceNameMap,
} from "./audio-devices.js";
import { playAudioStream, resetScheduledTime } from "./audio-player.js";

const WEBSOCKET_URL = "wss://127.0.0.1:8501/ws";
const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 512;

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const wsStatusButton = document.getElementById("ws-status");
const micVolumeIndicator = document.getElementById("micVolumeIndicator");
const spkVolumeIndicator = document.getElementById("spkVolumeIndicator");

let ws = null;
let inAudioContext = null;
let outAudioContext = null;

startButton.onclick = async () => {
  ws = new WebSocket(WEBSOCKET_URL);
  ws.onopen = function () {
    console.log("WebSocket connection established");
    wsStatusButton.textContent = "Connected";
    wsStatusButton.style.color = "red";
    wsStatusButton.style.fontWeight = "bold";
    startButton.disabled = true;
    stopButton.disabled = false;
  };
  ws.onclose = function () {
    console.log("WebSocket connection closed");
    wsStatusButton.textContent = "Disconnected";
    wsStatusButton.style.color = "black";
    wsStatusButton.style.fontWeight = "normal";
    startButton.disabled = false;
    stopButton.disabled = true;
  };
  ws.onerror = function (error) {
    console.error("WebSocket error:", error);
  };
  ws.onmessage = async (event) => {
    if (outAudioContext === null) {
      console.error("AudioContext is not initialized");
      return false;
    }
    const arrayBuffer = await event.data.arrayBuffer();
    let audioData = new Float32Array(arrayBuffer);
    playAudioStream(audioData, outAudioContext);
    return true;
  };

  const outDeviceId = document.getElementById("audio-output-devices").value;
  const outDeviceName = outDeviceNameMap.get(outDeviceId);
  outAudioContext = new AudioContext({
    deviceId: outDeviceId,
    sampleRate: SAMPLE_RATE,
  });
  console.log(
    "output device:",
    outDeviceName,
    "sampleRate:",
    outAudioContext.sampleRate
  );

  console.log("Trying to get audio stream...");
  const deviceId = document.getElementById("audio-input-devices").value;
  const constraints = {
    audio: {
      deviceId: { exact: deviceId },
      sampleRate: SAMPLE_RATE,
      channelCount: 1,
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const track = stream.getAudioTracks()[0].getCapabilities();
  const deviceName = inDeviceNameMap.get(track.deviceId);
  console.log("Use microphone:", deviceName);

  inAudioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
  const source = inAudioContext.createMediaStreamSource(stream);
  const sampleRate = source.context.sampleRate;
  console.log(
    "input sampleRate:",
    sampleRate,
    "output sampleRate:",
    outAudioContext.sampleRate
  );

  await inAudioContext.audioWorklet.addModule("static/js/audio-processor.js");
  const workletNode = new AudioWorkletNode(inAudioContext, "audioProcessor", {
    processorOptions: {
      bufferSize: BUFFER_SIZE,
    },
  });
  resetScheduledTime();

  source.connect(workletNode);

  // Send microphone audio data to server
  workletNode.port.onmessage = (event) => {
    if (ws && ws.readyState === ws.OPEN) {
      const audioData = event.data;
      const maxVolume = parseInt(Math.max(...audioData) * 100).toString();
      micVolumeIndicator.style.width = maxVolume + "%";
      ws.send(audioData.buffer);
    }
  };
};

stopButton.onclick = () => {
  if (ws && ws.readyState === ws.OPEN) {
    console.log("WebSocket connection closed");
    ws.close();
  }

  if (inAudioContext) {
    inAudioContext.close().then(() => {
      console.log("Input AudioContext closed.");
    });
    inAudioContext = null;
  }

  if (outAudioContext) {
    outAudioContext.close().then(() => {
      console.log("Output AudioContext closed.");
    });
    outAudioContext = null;
  }
};

window.onload = async function () {
  await getAudioInputDevices();
  await getAudioOutputDevices();
};
