export const inDeviceNameMap = new Map();
export const outDeviceNameMap = new Map();

async function getDevices(kind, selectId, deviceNameMap) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter((device) => device.kind === kind);
  const select = document.getElementById(selectId);

  audioDevices.forEach((device) => {
    deviceNameMap.set(device.deviceId, device.label);
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label || "Device " + (select.length + 1);
    select.appendChild(option);
  });

  select.value = audioDevices.find(
    (device) => device.deviceId === "default"
  )?.deviceId;
}

export async function getAudioInputDevices() {
  getDevices("audioinput", "audio-input-devices", inDeviceNameMap);
}

export async function getAudioOutputDevices() {
  getDevices("audiooutput", "audio-output-devices", outDeviceNameMap);
}
