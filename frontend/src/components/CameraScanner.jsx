import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function CameraScanner({ onFinish }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const faceBoxRef = useRef(null);
  const samplesRef = useRef([]);

  // Phase 5: store repeated HR readings
  const hrHistoryRef = useRef([]);
  const rrHistoryRef = useRef([]);

  const [faceDetected, setFaceDetected] = useState(false);
  const [signalSamples, setSignalSamples] = useState(0);

  const [rgb, setRgb] = useState({
    r: 0,
    g: 0,
    b: 0
  });

  const [heartRate, setHeartRate] = useState(null);
  const [respiratoryRate, setRespiratoryRate] = useState(null);

  const [signalQuality, setSignalQuality] =
    useState("Waiting");

  // Phase 5
  const [stability, setStability] = useState(0);
  const [stableResult, setStableResult] = useState(false);

  const [signalData, setSignalData] = useState([]);

  const [scanStartedAt] = useState(Date.now());

  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState("");

  // --------------------------------------------------
  // START CAMERA
  // --------------------------------------------------

  useEffect(() => {
    startScanner();

    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(
        "/models"
      );

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user"
          },
          audio: false
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);

      setCameraError(
        "Unable to start camera. Please allow camera permission."
      );

      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FACE DETECTION
  // --------------------------------------------------

  const detectFace = async () => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      return;
    }

    try {
      const detection =
        await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
          })
        );

      if (detection) {
        faceBoxRef.current = detection.box;
        setFaceDetected(true);
      } else {
        faceBoxRef.current = null;
        setFaceDetected(false);
      }
    } catch (error) {
      console.error(
        "Face detection error:",
        error
      );
    }
  };

  // --------------------------------------------------
  // COLLECT CAMERA SIGNAL
  // --------------------------------------------------

  const collectRGB = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const box = faceBoxRef.current;

    if (!video || !canvas || !box) {
      return;
    }

    if (video.readyState < 2) {
      return;
    }

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });

    const roiWidth = 120;
    const roiHeight = 60;

    canvas.width = roiWidth;
    canvas.height = roiHeight;

    // Forehead region
    const sx =
      box.x + box.width * 0.25;

    const sy =
      box.y + box.height * 0.12;

    const sw =
      box.width * 0.5;

    const sh =
      box.height * 0.20;

    try {
      ctx.drawImage(
        video,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        roiWidth,
        roiHeight
      );
    } catch {
      return;
    }

    const imageData =
      ctx.getImageData(
        0,
        0,
        roiWidth,
        roiHeight
      );

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    let validPixels = 0;

    for (
      let i = 0;
      i < imageData.data.length;
      i += 4
    ) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      const brightness =
        (r + g + b) / 3;

      if (
        brightness > 40 &&
        brightness < 240
      ) {
        totalR += r;
        totalG += g;
        totalB += b;

        validPixels++;
      }
    }

    if (validPixels === 0) {
      return;
    }

    const r =
      totalR / validPixels;

    const g =
      totalG / validPixels;

    const b =
      totalB / validPixels;

    setRgb({
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    });

    const now = performance.now();

    samplesRef.current.push({
      time: now,
      value: g
    });

    // Keep last 30 seconds
    const cutoff = now - 30000;

    samplesRef.current =
      samplesRef.current.filter(
        (sample) =>
          sample.time >= cutoff
      );

    setSignalSamples(
      samplesRef.current.length
    );

    // Show only last 120 points
    const recent =
      samplesRef.current.slice(-120);

    setSignalData(
      recent.map(
        (sample) => sample.value
      )
    );
  };

  // --------------------------------------------------
  // MOVING AVERAGE
  // --------------------------------------------------

  const movingAverage = (
    data,
    windowSize
  ) => {
    const result =
      new Array(data.length).fill(0);

    let sum = 0;

    for (
      let i = 0;
      i < data.length;
      i++
    ) {
      sum += data[i];

      if (i >= windowSize) {
        sum -=
          data[i - windowSize];
      }

      const count =
        Math.min(
          i + 1,
          windowSize
        );

      result[i] =
        sum / count;
    }

    return result;
  };

  // --------------------------------------------------
  // CREATE PULSE SIGNAL
  // --------------------------------------------------

  const createPulseSignal = (
    samples
  ) => {
    const values =
      samples.map(
        (sample) =>
          sample.value
      );

    if (values.length < 150) {
      return [];
    }

    // Remove slow lighting variation
    const slow =
      movingAverage(
        values,
        45
      );

    const highPassed =
      values.map(
        (value, i) =>
          value - slow[i]
      );

    // Smooth noise
    const filtered =
      movingAverage(
        highPassed,
        5
      );

    const mean =
      filtered.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / filtered.length;

    const variance =
      filtered.reduce(
        (sum, value) =>
          sum +
          Math.pow(
            value - mean,
            2
          ),
        0
      ) / filtered.length;

    const std =
      Math.sqrt(variance);

    if (std < 0.15) {
      return [];
    }

    return filtered.map(
      (value) =>
        (value - mean) / std
    );
  };

  // --------------------------------------------------
  // CALCULATE HR FROM SIGNAL
  // --------------------------------------------------
   const estimateHeartRate = () => {
  const samples = samplesRef.current;

  if (samples.length < 300) {
    return null;
  }

  const duration =
    (samples[samples.length - 1].time -
      samples[0].time) / 1000;

  if (duration < 10) {
    return null;
  }

  const signal = createPulseSignal(samples);

  if (signal.length < 200) {
    return null;
  }

  const sampleRate =
    (samples.length - 1) / duration;

  const minBpm = 45;
  const maxBpm = 180;

  const minLag = Math.max(
    1,
    Math.floor(sampleRate * (60 / maxBpm))
  );

  const maxLag = Math.floor(
    sampleRate * (60 / minBpm)
  );

  let bestLag = -1;
  let bestCorrelation = -Infinity;

  for (
    let lag = minLag;
    lag <= maxLag;
    lag++
  ) {
    let sum = 0;
    let count = 0;

    for (
      let i = lag;
      i < signal.length;
      i++
    ) {
      sum += signal[i] * signal[i - lag];
      count++;
    }

    if (count === 0) continue;

    const correlation = sum / count;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag <= 0) {
    return null;
  }

  const bpm = Math.round(
    (60 * sampleRate) / bestLag
  );

  if (bpm < 45 || bpm > 180) {
    return null;
  }

  return {
    bpm,
    correlation: bestCorrelation
  };
};

  // --------------------------------------------------
  // PHASE 5: STABLE HEART RATE
  // --------------------------------------------------
    const calculateHeartRate = () => {
  const result = estimateHeartRate();

  if (!result) {
    if (samplesRef.current.length < 300) {
      setSignalQuality("Collecting");
    } else {
      setSignalQuality("Poor");
    }

    return;
  }

  const { bpm, correlation } = result;

  // Signal quality
  if (correlation >= 0.25) {
    setSignalQuality("Good");
  } else if (correlation >= 0.08) {
    setSignalQuality("Fair");
  } else {
    setSignalQuality("Poor");
  }

  // Accept usable readings
  if (correlation < 0.08) {
    return;
  }

  hrHistoryRef.current.push(bpm);

  // Keep last 6 readings
  if (hrHistoryRef.current.length > 6) {
    hrHistoryRef.current.shift();
  }

  const history = hrHistoryRef.current;

  // First reading
  if (history.length === 1) {
    setHeartRate(bpm);
    setStability(20);
    setStableResult(false);
    return;
  }

  // Average HR
  const average =
    history.reduce(
      (sum, value) => sum + value,
      0
    ) / history.length;

  // Standard deviation
  const variance =
    history.reduce(
      (sum, value) =>
        sum + Math.pow(value - average, 2),
      0
    ) / history.length;

  const std = Math.sqrt(variance);

  // Stability score
  let stabilityScore =
    100 - std * 10;

  stabilityScore = Math.max(
    0,
    Math.min(100, stabilityScore)
  );

  stabilityScore = Math.round(
    stabilityScore
  );

  setHeartRate(
    Math.round(average)
  );

  setStability(
    stabilityScore
  );

  // Stable result
  if (
    history.length >= 3 &&
    stabilityScore >= 50
  ) {
    setStableResult(true);
  } else {
    setStableResult(false);
  }
}; 


  // --------------------------------------------------
  // RESPIRATORY RATE
  // --------------------------------------------------

  const calculateRespiratoryRate =
    () => {
      const samples =
        samplesRef.current;

      if (samples.length < 450) {
        return;
      }

      const duration =
        (
          samples[
            samples.length - 1
          ].time -
          samples[0].time
        ) / 1000;

      if (duration < 15) {
        return;
      }

      const values =
        samples.map(
          (sample) =>
            sample.value
        );

      const mean =
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length;

      const normalized =
        values.map(
          (value) =>
            value - mean
        );

      const sampleRate =
        samples.length /
        duration;

      let bestRpm = 0;
      let bestPower = 0;

      for (
        let rpm = 6;
        rpm <= 30;
        rpm++
      ) {
        const frequency =
          rpm / 60;

        let real = 0;
        let imaginary = 0;

        for (
          let i = 0;
          i < normalized.length;
          i++
        ) {
          const time =
            i / sampleRate;

          const angle =
            2 *
            Math.PI *
            frequency *
            time;

          real +=
            normalized[i] *
            Math.cos(angle);

          imaginary -=
            normalized[i] *
            Math.sin(angle);
        }

        const power =
          real * real +
          imaginary *
            imaginary;

        if (
          power > bestPower
        ) {
          bestPower =
            power;

          bestRpm = rpm;
        }
      }

      if (bestRpm > 0) {
        rrHistoryRef.current.push(
          bestRpm
        );

        if (
          rrHistoryRef.current
            .length > 4
        ) {
          rrHistoryRef.current.shift();
        }

        const history =
          rrHistoryRef.current;

        const average =
          history.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / history.length;

        setRespiratoryRate(
          Math.round(average)
        );
      }
    };

  // --------------------------------------------------
  // INTERVALS
  // --------------------------------------------------

  useEffect(() => {
    if (loading) return;

    const faceInterval =
      setInterval(
        detectFace,
        500
      );

    const signalInterval =
      setInterval(
        collectRGB,
        33
      );

    const heartInterval =
      setInterval(
        calculateHeartRate,
        3000
      );

    const respiratoryInterval =
      setInterval(
        calculateRespiratoryRate,
        5000
      );

    return () => {
      clearInterval(
        faceInterval
      );

      clearInterval(
        signalInterval
      );

      clearInterval(
        heartInterval
      );

      clearInterval(
        respiratoryInterval
      );
    };
  }, [loading]);

  // --------------------------------------------------
  // FINISH SCAN
  // --------------------------------------------------

  const handleFinish = () => {
    const duration =
      Math.round(
        (Date.now() -
          scanStartedAt) /
          1000
      );

    /*
      Require a stable estimation.
    */
    if (
      !heartRate ||
      !stableResult
    ) {
      alert(
        "Estimation is still unstable. Please keep your face steady and continue scanning."
      );

      return;
    }

    onFinish({
      heartRate,
      respiratoryRate,
      signalQuality,
      stability,
      duration
    });
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="scanner">

      <h2>
        Face Health Scanner
      </h2>

      {loading && (
        <p>
          Loading face detection...
        </p>
      )}

      {cameraError && (
        <p className="error">
          {cameraError}
        </p>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        style={{
          display: "none"
        }}
      />

      <p>
        Keep your face steady
        inside the camera frame.
      </p>

      {!loading && (
        <>
          <div
            className={
              faceDetected
                ? "face-status detected"
                : "face-status"
            }
          >
            {faceDetected
              ? "✓ Face Detected"
              : "Searching for face..."}
          </div>

          <div className="signal-info">

            <p>
              Signal Samples:{" "}
              {signalSamples}
            </p>

            <p>
              RGB: R {rgb.r} | G{" "}
              {rgb.g} | B {rgb.b}
            </p>

            <p>
              📡 Signal Quality:{" "}
              <strong>
                {signalQuality}
              </strong>
            </p>

            <p>
              ❤️ Estimated Heart Rate:{" "}
              <strong>
                {heartRate
                  ? `${heartRate} BPM`
                  : "Collecting signal..."}
              </strong>
            </p>

            <p>
              🫁 Estimated Respiratory Rate:{" "}
              <strong>
                {respiratoryRate
                  ? `${respiratoryRate} breaths/min`
                  : "Collecting signal..."}
              </strong>
            </p>

            <p>
              🎯 Estimation Stability:{" "}
              <strong>
                {stability}%
              </strong>
            </p>

            <p>
              {stableResult
                ? "✅ Result Stable"
                : "⏳ Stabilizing result..."}
            </p>

          </div>

          <div className="signal-graph">

            <h3>
              Live Green Signal
            </h3>

            <div className="graph">

              {signalData.map(
                (value, index) => (
                  <span
                    key={index}
                    style={{
                      height:
                        `${Math.max(
                          2,
                          value / 2
                        )}px`
                    }}
                  />
                )
              )}

            </div>

          </div>

          <button
            className="finish-button"
            onClick={handleFinish}
          >
            {stableResult
              ? "Finish Scan"
              : "Continue Scanning"}
          </button>

        </>
      )}

    </div>
  );
}

export default CameraScanner;