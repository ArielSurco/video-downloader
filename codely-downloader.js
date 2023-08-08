const { exec } = require('child_process');

const requestUrl = 'https://165vod-adaptive.akamaized.net/exp=1691307159~acl=%2F315198fa-440e-48d1-bfcb-bd41cd5461dc%2F%2A~hmac=791b4d163d2646b4b7569f7063a97f4b7c61d5c9541bed09f545a34edbad5635/315198fa-440e-48d1-bfcb-bd41cd5461dc/sep/video/49024a90,6189fe0f,63f3a570,c8e8875c,ca61d8f2/audio/8f392fec,f7ee6a1b/master.json?base64_init=1&query_string_ranges=1';
const youtubeDLPath = 'youtube-dl.exe';
const videoPath = '27 - Como gestionar los secretos y que hacer si alguno se compromete'; // No hace falta agregar el .mp4

/* UTILS */

const ResourceType = Object.freeze({
  VIDEO: 'video',
  AUDIO: 'audio',
});

const getVideoUrlFromRequest = (requestUrl) => {
  const [videoIds, ...fragments] = requestUrl.split('/').slice(0, -3).reverse();
  const hdVideoId = videoIds.split(',')[1];
  const auxUrl = [hdVideoId, ...fragments].reverse().join('/').replace('/sep/', '/parcel/');
  const parsedVideoUrl = `${auxUrl}.mp4`;

  return parsedVideoUrl;
};

const downloadOnlyResource = (resourceType, resourceUrl) => {
  console.log(`Descargando ${resourceType}...`);
  return new Promise((resolve, reject) => {
    exec(`${youtubeDLPath} -o "${resourceType}.mp4" "${resourceUrl}"`, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });
};

const getAudioUrlFromRequest = (requestUrl) => {
  const partialUrlResult = requestUrl.replace(/\/video\/.*\/audio/, '/audio').replace('/sep/', '/parcel/');
  const [audioIds, ...fragments] = partialUrlResult.split('/').slice(0, -1).reverse();
  const audioId = audioIds.split(',')[1];
  const audioUrl = [audioId, ...fragments].reverse().join('/');

  return `${audioUrl}.mp4`;
};

const mergeAudioAndVideo = (videoPath, audioPath, outputPath) => {
  console.log('Combinando audio y video...');
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac "${outputPath}"`, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });
};

const downloadClass = async (classUrl, path) => {
  const videoUrl = getVideoUrlFromRequest(classUrl);
  const audioUrl = getAudioUrlFromRequest(classUrl);

  await downloadOnlyResource(ResourceType.VIDEO, videoUrl);
  await downloadOnlyResource(ResourceType.AUDIO, audioUrl);
  await mergeAudioAndVideo('video.mp4', 'audio.mp4', `${path}.mp4`);
  console.log('Clase descargada');
};

downloadClass(requestUrl, videoPath);
