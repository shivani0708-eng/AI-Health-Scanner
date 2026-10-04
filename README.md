# 🩺 AI Health Scanner

A camera-based experimental health monitoring system that uses **Computer Vision and Signal Processing** to estimate basic physiological parameters from facial video.

The system uses a webcam to detect a face, extracts RGB information from a selected facial region, processes the captured signal, and generates experimental estimates of **Heart Rate** and **Respiratory Rate** along with **Signal Quality** and **Estimation Stability**.

> **Note:** This is an educational and experimental prototype. It is not a medical device and should not be used for diagnosis or medical decisions.

---

## 📌 Overview

AI Health Scanner explores the possibility of performing **contactless physiological signal estimation using a conventional camera**.

Instead of requiring a dedicated physical sensor, the application analyzes subtle changes in facial color captured by a webcam.

The project demonstrates how different technologies can work together:

**Webcam → Face Detection → RGB Signal Extraction → Signal Processing → Physiological Estimation → Stability Validation**

---

## 🎯 Problem Statement

Most physiological monitoring systems rely on dedicated sensors such as smartwatches, pulse oximeters, or other wearable devices.

This project explores an alternative approach:

> **Can a normal camera be used to experimentally estimate physiological parameters without physically attaching a sensor to the user?**

The project focuses on a non-contact approach using facial video and signal processing.

---

## 💡 Proposed Solution

The system captures live video through a webcam and detects the user's face.

A selected facial region, particularly the forehead area, is analyzed frame by frame to obtain RGB values.

The green-channel signal is then processed to identify periodic variations that can be used for experimental physiological estimation.

The system also checks signal quality and consistency before considering a result stable.

---

## 🔄 How the System Works

```text
                    Webcam
                       │
                       ▼
               Face Detection
                       │
                       ▼
              Facial ROI Selection
                       │
                       ▼
                RGB Extraction
                       │
                       ▼
             Green Signal Analysis
                       │
                       ▼
              Signal Processing
                       │
              ┌────────┴────────┐
              ▼                 ▼
       Heart Rate          Respiratory Rate
       Estimation             Estimation
              │                 │
              └────────┬────────┘
                       ▼
                Signal Quality
                       │
                       ▼
              Stability Validation
                       │
                       ▼
              Experimental Result
```

---

## 🧠 Core Technology

The project uses the concept of **Remote Photoplethysmography (rPPG)**.

rPPG is a camera-based approach that attempts to extract physiological information from subtle changes in skin color observed in video.

In this project:

1. The webcam captures facial video.
2. Face detection identifies the face.
3. A region of interest is selected from the forehead.
4. RGB pixel values are calculated.
5. The green-channel signal is extracted.
6. Signal processing reduces slow lighting variations and noise.
7. Periodic signal patterns are analyzed.
8. Heart-rate and respiratory-rate estimates are generated.
9. Repeated readings are evaluated for consistency.

---

## ✨ Features

### 🎥 Real-Time Camera Scanning

Uses the computer's webcam to capture live facial video.

### 👤 Face Detection

Uses **Tiny Face Detector** through `face-api.js` to locate the user's face.

### 🎨 RGB Signal Extraction

Extracts average Red, Green, and Blue values from the selected facial region.

### 📈 Live Green Signal

Displays the collected green-channel signal in real time.

### ❤️ Heart Rate Estimation

Uses signal processing and autocorrelation analysis to estimate heart rate from periodic variations in the camera signal.

### 🫁 Respiratory Rate Estimation

Analyzes low-frequency variations in the signal to generate an experimental respiratory-rate estimate.

### 📡 Signal Quality

Provides feedback about the quality of the detected signal:

* Waiting
* Collecting
* Poor
* Fair
* Good

### 🎯 Estimation Stability

Repeated heart-rate estimates are compared to calculate an estimation stability score.

This helps identify whether the current readings are reasonably consistent.

### ✅ Stable Result Validation

The system waits for multiple consistent readings before allowing the user to finish the scan.

### 💾 Scan History

Completed scans can be stored locally and displayed in the application's result/history interface.

---

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Computer Vision

* face-api.js
* Tiny Face Detector
* Web Camera API

### Signal Processing

* RGB pixel averaging
* Green-channel analysis
* Moving average filtering
* High-pass filtering
* Signal normalization
* Autocorrelation
* Frequency-based analysis
* Statistical stability calculation

### Browser APIs

* `navigator.mediaDevices.getUserMedia()`
* Canvas API
* Local Storage
* Performance API

---

## 📂 Project Structure

```text
AI Health Scanner/
│
├── frontend/
│   │
│   ├── public/
│   │   └── models/
│   │       └── Face detection model files
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── CameraScanner.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* A modern web browser
* Webcam

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shivani0708-eng/AI-Health-Scanner.git
```

### 2. Navigate to the Project

```bash
cd AI-Health-Scanner
```

### 3. Open the Frontend

```bash
cd frontend
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Development Server

```bash
npm run dev
```

Vite will provide a local development URL.

Open that URL in your browser.

---

## 📷 Using the Scanner

1. Open the application.
2. Allow camera permission.
3. Position your face inside the camera frame.
4. Keep your face relatively steady.
5. Make sure the face is well illuminated.
6. Wait while the application collects enough signal samples.
7. Monitor the signal quality.
8. Wait for repeated heart-rate estimates.
9. Once the result becomes stable, the **Finish Scan** option becomes available.
10. Finish the scan to view the result.

---

## 📊 Example Application Flow

```text
Start Scanner
      ↓
Camera Permission
      ↓
Face Detected
      ↓
Collect RGB Samples
      ↓
Signal Processing
      ↓
Heart Rate Estimation
      ↓
Respiratory Rate Estimation
      ↓
Signal Quality Check
      ↓
Stability Check
      ↓
Stable Result
      ↓
Finish Scan
      ↓
Result / History
```

---

## 🔬 Signal Processing Pipeline

### 1. RGB Collection

The application samples pixels from the selected facial region.

### 2. Green Channel

The green component is used as the primary signal because facial color variations can contain useful pulsatile information.

### 3. Moving Average

A moving average is used to reduce slow changes caused by lighting and other gradual variations.

### 4. High-Pass Processing

The slowly changing component is removed to emphasize faster periodic variations.

### 5. Normalization

The processed signal is normalized using its mean and standard deviation.

### 6. Autocorrelation

Autocorrelation is used to search for periodic patterns corresponding to plausible heart-rate frequencies.

### 7. Stability Analysis

Multiple heart-rate estimates are stored and compared.

The variation between these readings is used to calculate the application's **estimation stability score**.

---

## 📡 Signal Quality

The system evaluates the strength of the extracted signal and categorizes it as:

| Quality    | Meaning                             |
| ---------- | ----------------------------------- |
| Waiting    | Scanner is starting                 |
| Collecting | Not enough samples yet              |
| Poor       | Signal may be unreliable            |
| Fair       | Usable but noisy signal             |
| Good       | Stronger and more consistent signal |

---

## 🎯 Estimation Stability

The stability value represents the **consistency of repeated camera-based estimates**.

For example:

```text
Reading 1 → 78 BPM
Reading 2 → 77 BPM
Reading 3 → 79 BPM
Reading 4 → 78 BPM
```

These readings are relatively consistent, so the application can report higher estimation stability.

> Stability does **not** mean medical accuracy.

---

## ⚠️ Limitations

Camera-based physiological estimation can be affected by:

* Poor lighting
* Face movement
* Camera quality
* Camera frame rate
* Skin-region selection
* Background illumination
* Motion artifacts
* Camera noise
* Changes in facial position
* Different hardware and browsers

Therefore, results may vary between users and devices.

---

## 🛡️ Safety Disclaimer

This project is an **educational and experimental prototype**.

The heart-rate and respiratory-rate values generated by this application are **camera-based estimates** and are not guaranteed to be medically accurate.

This application:

* Is not a medical device.
* Does not diagnose diseases.
* Does not provide medical advice.
* Should not replace professional medical equipment.
* Should not be used for medical decisions or emergencies.

For reliable health measurements, users should use appropriate validated medical devices and consult qualified healthcare professionals.

---

## 🔮 Future Scope

The project can be further improved with:

### 🤖 Machine Learning

Train ML models using validated physiological datasets to improve signal interpretation.

### 🎥 Multi-Region Analysis

Use multiple facial regions instead of relying on a single forehead region.

### 💡 Lighting Compensation

Automatically detect and compensate for changes in illumination.

### 🚫 Motion Artifact Removal

Use advanced algorithms to reduce the effect of head movement.

### 📱 Mobile Application

Extend the system to smartphone cameras.

### 🗄️ Backend Integration

Store scan records in a secure backend database.

### 📊 Advanced Analytics

Provide historical graphs and trends for experimental analysis.

### 🧪 Validation

Compare camera-based estimates against validated reference devices and datasets before making any accuracy claims.

---

## 📚 Learning Outcomes

This project demonstrates practical implementation of:

* React development
* JavaScript
* Computer Vision
* Face Detection
* Webcam integration
* Canvas image processing
* RGB signal extraction
* Digital signal processing concepts
* Autocorrelation
* Frequency analysis
* Statistical analysis
* Real-time data visualization
* Local storage
* Frontend application architecture

---

## 🌟 Why This Project Is Different

Unlike a basic face-detection application, this project combines multiple concepts:

```text
Computer Vision
       +
Webcam Processing
       +
RGB Signal Analysis
       +
Signal Processing
       +
Physiological Estimation
       +
Stability Validation
```

The project therefore demonstrates how **Computer Vision and Signal Processing can be combined to explore contactless physiological monitoring**.

---

## 👩‍💻 Author

**Shivani Sethiya**

B.Tech Computer Science & Technology

Areas of Interest:

* Artificial Intelligence
* Machine Learning
* Data Science
* Computer Vision
* Data Analytics

---

## ⭐ Project Repository

GitHub:

https://github.com/shivani0708-eng/AI-Health-Scanner

---

## 📄 License

This project is intended for educational and experimental purposes.
