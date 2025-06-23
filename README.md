# 🎯 AI Face Detection & Object Recognition API

<div align="center">

![Face Detection](https://img.shields.io/badge/Face-Detection-blue?style=for-the-badge&logo=opencv)
![Object Recognition](https://img.shields.io/badge/Object-Recognition-green?style=for-the-badge&logo=tensorflow)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)

**Advanced AI-powered face detection and object recognition API with clustering capabilities**

[🚀 Quick Start](#-quick-start) • [📖 API Documentation](#-api-documentation) • [🐳 Docker Setup](#-docker-deployment) • [🔧 Configuration](#-configuration)

</div>

---

## ✨ Features

### 🎭 **Face Recognition**
- **Real-time face matching** with 95%+ accuracy
- **Multiple face detection** in single image
- **Base64 & file upload** support
- **Euclidean distance** comparison algorithm

### 📱 **Smart Object Detection**
- **Mobile phones** & **cameras** detection
- **Electronic devices** recognition (laptops, TVs, keyboards)
- **People counting** with confidence scores
- **Custom threshold** settings for accuracy

### 🔧 **Advanced Features**
- **Multi-process clustering** with Node.js cluster
- **SSL/HTTPS** support with Nginx
- **Large file uploads** (up to 100MB)
- **Health monitoring** & auto-restart
- **Memory optimization** with tensor disposal

---

## 🚀 Quick Start

### 📦 **1. Clone & Install**
```bash
git clone <repository-url>
cd facedetect
npm install
```

### 🤖 **2. Download AI Models**
```bash
# Models are automatically downloaded on first run
# Or manually place in ./models/ directory
```

### 🖼️ **3. Add Reference Face**
```bash
# Place reference image in ./known_faces/1.jpeg
```

### ⚡ **4. Start Server**
```bash
# Development
npm start

# Production with clustering
node server.js
```

**🌐 API Ready at:** `http://localhost:3000`

---

## 📖 API Documentation

### 🔍 **Face Detection Endpoints**

#### `POST /detect` - File Upload
```bash
curl -X POST -F "image=@photo.jpg" http://localhost:3000/detect
```

#### `POST /detect-base64` - Base64 Image
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQ...","userImage":"https://example.com/reference.jpg"}' \
  http://localhost:3000/detect-base64
```

#### `GET /working` - Health Check
```bash
curl http://localhost:3000/working
```

### 📊 **Response Format**
```json
{
  "face": true,
  "objects": [
    "👥 2 person(s)",
    "📱 cell phone (87.3%)",
    "📷 camera (72.1%)",
    "💻 laptop (89.4%)"
  ]
}
```

---

## 🐳 Docker Deployment

### 🏠 **Single Site Setup**
```bash
# Development (HTTP)
docker-compose -f docker-compose.dev.yml up -d

# Production (HTTPS)
./ssl-setup.sh
docker-compose up -d
```

### 🌐 **Multi-Site Server**
```bash
# Use existing nginx server
docker-compose -f docker-compose.no-nginx.yml up -d

# Add to main nginx config
sudo cp nginx-main-server.conf /etc/nginx/sites-available/face-detection
sudo ln -s /etc/nginx/sites-available/face-detection /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### 🔧 **Custom Ports**
```bash
# Avoid port conflicts
docker-compose -f docker-compose.custom-port.yml up -d
# Access: http://localhost:8080
```

---

## 🎯 Detection Capabilities

<div align="center">

| Category | Objects | Confidence |
|----------|---------|------------|
| 📱 **Mobile Devices** | Cell phones, Tablets | 10%+ |
| 📷 **Cameras** | Digital cameras, Webcams | 10%+ |
| 💻 **Computers** | Laptops, Desktops | 20%+ |
| 📺 **Electronics** | TVs, Monitors | 25%+ |
| 🎮 **Accessories** | Remotes, Keyboards, Mouse | 15%+ |
| 👥 **People** | Person detection | 30%+ |

</div>

---

## 🔧 Configuration

### 🎛️ **Environment Variables**
```bash
NODE_ENV=production          # Environment mode
PORT=3000                   # Server port
```

### 📁 **Directory Structure**
```
facedetect/
├── 🤖 models/              # AI model files
├── 🖼️ known_faces/         # Reference images
├── 📤 uploads/             # Temporary uploads
├── 🐳 docker-compose.yml   # Docker configuration
├── 🔧 nginx.conf           # Nginx configuration
└── 📝 server.js            # Main application
```

### ⚙️ **Customization**
```javascript
// Adjust detection thresholds in server.js
const devices = [
  ...preds.filter(p => p.class === 'cell phone' && p.score > 0.1),
  ...preds.filter(p => p.class === 'camera' && p.score > 0.1),
  // Add more categories...
];
```

---

## 🚀 Performance & Scaling

### 📊 **Clustering**
- **Multi-process**: Utilizes all CPU cores
- **Load balancing**: Automatic request distribution
- **Auto-restart**: Failed processes automatically restarted
- **Memory management**: Optimized tensor disposal

### 🔒 **Security**
- **SSL/TLS**: HTTPS encryption
- **Security headers**: XSS, CSRF protection
- **File validation**: Image format verification
- **Rate limiting**: Built-in request throttling

### 📈 **Monitoring**
```bash
# View logs
docker-compose logs -f

# Health check
curl http://localhost:3000/working

# Resource usage
docker stats
```

---

## 🛠️ Development

### 🔨 **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Run with clustering
node server.js
```

### 🧪 **Testing**
```bash
# Test face detection
curl -X POST -F "image=@test.jpg" http://localhost:3000/detect

# Test base64 detection
curl -X POST -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}' \
  http://localhost:3000/detect-base64
```

---

## 📚 Tech Stack

<div align="center">

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) | Runtime | 18+ |
| ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?logo=tensorflow&logoColor=white) | AI/ML | Latest |
| ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) | Web Framework | 5+ |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) | Containerization | Latest |
| ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white) | Reverse Proxy | Alpine |

</div>

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### 📞 **Need Help?**
- 📧 **Email**: dushyantsharma891@gmail.com.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/facedetect/issues)

### 🔗 **Quick Links**
- [🐳 Docker Setup Guide](README-Docker.md)
- [🌐 Multi-Site Setup](multi-site-setup.md)
- [🔐 SSL Configuration](ssl-setup.sh)
- [📊 API Examples](examples/)

---

<div align="center">

**⭐ Star this repo if it helped you!**

Made with ❤️ by [Dushyant Sharma](https://github.com/dushyantsharma891)

</div>