// Use player code from https://gist.github.com/ykst/6e80e3566bd6b9d63d19?permalink_comment_id=1877566
const initial_delay_sec = 1;
let scheduled_time = 0;

function playChunk(audio_src, scheduled_time) {
  if (audio_src.start) {
    audio_src.start(scheduled_time);
  } else {
    audio_src.noteOn(scheduled_time);
  }
}

export function resetScheduledTime() {
  scheduled_time = 0;
}

export function playAudioStream(audio_f32, outAudioContext) {
  var audio_buf = outAudioContext.createBuffer(
      1,
      audio_f32.length,
      outAudioContext.sampleRate
    ),
    audio_src = outAudioContext.createBufferSource(),
    current_time = outAudioContext.currentTime;

  audio_buf.getChannelData(0).set(audio_f32);

  audio_src.buffer = audio_buf;
  audio_src.connect(outAudioContext.destination);

  if (current_time < scheduled_time) {
    playChunk(audio_src, scheduled_time);
    scheduled_time += audio_buf.duration;
  } else {
    playChunk(audio_src, current_time);
    scheduled_time = current_time + audio_buf.duration + initial_delay_sec;
  }
}
