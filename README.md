# web_summative_LorrisHIRA
# HiraJobs

A real-time job search web application built with HTML, CSS, and JavaScript. It fetches live job listings using the JSearch API and lets users search, filter, and sort results by job type, location, and salary.

## Features

- Search jobs by title or keyword and location
- Filter results by job type: Full-time, Part-time, Contract, Internship
- Sort results by date posted, salary, or title
- View full job details in a modal popup
- Direct link to apply on the company's website
- Responsive design that works on mobile and desktop

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) via RapidAPI

## Project Structure

```
HiraJobs/
├── index.html        - Main HTML structure
├── css/
│   └── style.css     - All styles and theming
├── js/
│   └── app.js        - All JavaScript logic and API calls
├── .gitignore
└── README.md
```

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/HiraJobs.git
   cd HiraJobs
   ```

2. Open the project in VS Code and use the Live Server extension to run it, or use Python:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and go to `http://localhost:8000`

> Note: Opening `index.html` directly via `file://` will cause CORS errors. Always run it through a local server.

## Deployment

The application is deployed on two web servers (web-01 and web-02) with a load balancer (lb-01) distributing traffic between them.

### Steps to deploy on web-01 and web-02

1. SSH into each server:
   ```bash
   ssh ubuntu@WEB_01_IP
   ssh ubuntu@WEB_02_IP
   ```

2. Install Nginx if not already installed:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

3. Copy the project files to the web root:
   ```bash
   sudo mkdir -p /var/www/hirajobs
   sudo cp -r * /var/www/hirajobs/
   ```

4. Configure Nginx to serve the app:
   ```bash
   sudo nano /etc/nginx/sites-available/hirajobs
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name _;

       root /var/www/hirajobs;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

5. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/hirajobs /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Load Balancer Configuration (lb-01)

On lb-01, configure HAProxy to balance traffic between web-01 and web-02:

```bash
sudo nano /etc/haproxy/haproxy.cfg
```

Add:
```
frontend http_front
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web01 WEB_01_IP:80 check
    server web02 WEB_02_IP:80 check
```

Restart HAProxy:
```bash
sudo systemctl restart haproxy
```

## API Credit

Job data is provided by the [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) available on RapidAPI. Built and maintained by letscrape.

## Author

Hira &mdash; l.hira@alustudent.com