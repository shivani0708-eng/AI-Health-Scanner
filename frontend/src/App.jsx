import { useEffect, useState } from "react";
import CameraScanner from "./components/CameraScanner";
import "./index.css";

function App() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Load previous scans
  useEffect(() => {
    const savedHistory =
      localStorage.getItem("healthScanHistory");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const finishScan = (scanResult) => {
    const newScan = {
      ...scanResult,
      id: Date.now(),
      date: new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString("en-IN")
    };

    const updatedHistory = [
      newScan,
      ...history
    ];

    setHistory(updatedHistory);

    localStorage.setItem(
      "healthScanHistory",
      JSON.stringify(updatedHistory)
    );

    setResult(newScan);
    setScanning(false);
  };

  const startNewScan = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="app">

      <header>
        <h1>AI Health Scanner</h1>

        <p>
          AI-powered contactless health monitoring
        </p>
      </header>

      <main>

        {/* HOME */}
        {!scanning && !result && (
          <>
            <section className="welcome">

              <h2>
                Check Your Health
              </h2>

              <p>
                Start a camera-based health scan
                to estimate selected physiological
                signals.
              </p>

              <button
                onClick={() => setScanning(true)}
              >
                Start Health Scan
              </button>

            </section>

            {/* HISTORY */}
            {history.length > 0 && (
              <section className="history-card">

                <h2>
                  📋 Scan History
                </h2>

                <div className="history-list">

                  {history.map((scan) => (
                    <div
                      className="history-item"
                      key={scan.id}
                    >

                      <div>
                        <strong>
                          {scan.date}
                        </strong>

                        <p>
                          {scan.time}
                        </p>
                      </div>

                      <div>
                        ❤️{" "}
                        {scan.heartRate
                          ? `${scan.heartRate} BPM`
                          : "--"}
                      </div>

                      <div>
                        🫁{" "}
                        {scan.respiratoryRate
                          ? `${scan.respiratoryRate}/min`
                          : "--"}
                      </div>

                      <div>
                        📡 {scan.signalQuality}
                      </div>

                    </div>
                  ))}

                </div>

              </section>
            )}
          </>
        )}

        {/* SCANNER */}
        {scanning && (
          <CameraScanner
            onFinish={finishScan}
          />
        )}

        {/* RESULT */}
        {result && !scanning && (
          <section className="result-card">

            <h2>
              Health Scan Result
            </h2>

            <p className="result-subtitle">
              Your scan has been completed
            </p>

            <div className="result-grid">

              <div className="result-item">

                <div className="result-icon">
                  ❤️
                </div>

                <h3>
                  Heart Rate
                </h3>

                <strong>
                  {result.heartRate
                    ? `${result.heartRate} BPM`
                    : "Not available"}
                </strong>

              </div>

              <div className="result-item">

                <div className="result-icon">
                  🫁
                </div>

                <h3>
                  Respiratory Rate
                </h3>

                <strong>
                  {result.respiratoryRate
                    ? `${result.respiratoryRate} /min`
                    : "Not available"}
                </strong>

              </div>

              <div className="result-item">

                <div className="result-icon">
                  📡
                </div>

                <h3>
                  Signal Quality
                </h3>

                <strong>
                  {result.signalQuality}
                </strong>

              </div>

              <div className="result-item">

                <div className="result-icon">
                  ⏱️
                </div>

                <h3>
                  Scan Duration
                </h3>

                <strong>
                  {result.duration} sec
                </strong>

              </div>

            </div>

            <div className="result-note">

              <strong>
                Important:
              </strong>

              <p>
                These are camera-based experimental
                estimates for demonstration and
                monitoring purposes. They are not
                a medical diagnosis.
              </p>

            </div>

            <button
              onClick={startNewScan}
              className="new-scan-button"
            >
              Start New Scan
            </button>

            <button
              className="home-button"
              onClick={() => setResult(null)}
            >
              View Scan History
            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;