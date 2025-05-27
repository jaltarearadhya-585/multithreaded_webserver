# 🧠 Multithreaded Web Server

A simple multithreaded HTTP server built in Python. This server handles multiple clients concurrently using Python’s `threading` module. It supports basic login authentication, serves static files (HTML, CSS, JS), and displays student data dynamically from a JSON file after successful login.

## 🚀 Features

- ✅ Multi-threaded client handling  
- ✅ GET & POST request support  
- ✅ Static file serving (`.html`, `.css`, `.js`)  
- ✅ Login authentication using a `user.txt` file  
- ✅ Student dashboard with data from `data.json`  
- ✅ Simulated loading delay for realism  
- ✅ Clean UI using HTML + CSS (with optional glassmorphism)

---

## 🛠️ Technologies Used

- Python 3
- Socket programming
- HTML, CSS, JavaScript
- Multithreading
- JSON for student data

---

## 📁 Folder Structure

multithreaded_web/
│
├── public/ 
│ ├── index.html
│ ├── pngegg.png
│ ├── styles.css
| ├── scripts.js
│ └── user.png
├── server.py
├── students.json
├── user.txt
├── data.json
---

## ⚙️ How to Run

1. **Clone the repo:**

bash:-
git clone https://github.com/your-username/multithreaded-web-server.git
cd multithreaded-web-server

2. Run the server:
   ->python server.py

3. Access in browser:
   ->http://localhost:8086/

📌 Notes
This server is for educational/demo purposes only and should not be used in production.

🤝 Contributors
Aradhya Abhay Jaltare
Deepesh Singh Kharkwal
Kamal Joshi
Dhruv Gahtori

📄 License
MIT License – free to use, modify, and distribute.





