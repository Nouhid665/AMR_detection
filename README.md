🚀 Automatic Modulation Recognition (AMR) – SIH Hackathon Project

<img width="1488" height="486" alt="image" src="https://github.com/user-attachments/assets/d4746f10-5614-47cb-b887-d982960a37dc" />


📌 Problem Statement

This project was developed for the Smart India Hackathon (SIH) under a problem statement given by ISRO (Indian Space Research Organisation).
The challenge: Automatic Modulation Recognition (AMR) of wireless signals to improve spectrum monitoring, communication security, and efficient signal analysis.

🔥 Project Overview

This is a complete end-to-end Machine Learning project, designed to classify different modulation schemes from raw I/Q (In-phase & Quadrature) signal data.

We implemented a CLDNN architecture (Convolutional + LSTM + Dense) for capturing both spatial and temporal dependencies in signal data.
The final solution was not just trained but also deployed for real-world accessibility using Render Cloud Platform.

🛠️ Tech Stack

Language: Python 🐍

Deep Learning: TensorFlow, Keras

Machine Learning Utilities: scikit-learn

Visualization: Matplotlib, Seaborn

Deployment: Render (Cloud-based deployment for end-to-end accessibility)

Dataset: RadioML 2016.10a

📊 Dataset

Source: RadioML 2016.10a Dataset

Contains multiple modulation schemes (e.g., AM, FM, QPSK, 16QAM, etc.) across various SNR (Signal-to-Noise Ratios).

Preprocessed and normalized I/Q samples for robust training.

🧠 Model Architecture (CLDNN)

Conv1D Layers – feature extraction from I/Q signal sequences.

Batch Normalization + Dropout – regularization to prevent overfitting.

BiLSTM Layer – temporal sequence modeling.

Dense Layers – final classification with softmax output.

⚡ Training & Evaluation

Training with Early Stopping + ReduceLROnPlateau for optimal convergence.

Achieved strong accuracy across multiple modulation types and varying SNR levels.

Evaluation included:

Classification Report (Precision, Recall, F1-Score)

Confusion Matrix (saved as confusion_matrix_cldnn.png)

Accuracy vs SNR Curve (performance benchmark across noise levels)

🌍 End-to-End Deployment

This project was deployed on Render, making it:

Scalable ☁️

Accessible via API/UI endpoints 🔗

Ready for real-world applications 🚀

📈 Results

High test accuracy across modulation types.

Accuracy vs SNR analysis showed strong robustness in noisy environments.

🌍 Live Demo

You don’t need to set up anything locally — the project is live here:

👉 Click to Try the Deployed AMR Model on Render
https://amr-detection-3.onrender.com/#hero
