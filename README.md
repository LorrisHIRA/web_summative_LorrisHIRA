# HiraJobs

HiraJobs is a job search web app that pulls real-time listings from the JSearch API. You can search by job title and location, filter by job type, and sort results however you want. Clicking on a job opens more details and a direct link to apply.

I built this because job searching across multiple platforms is frustrating. Having everything in one clean interface makes it easier.

---

## What it does

- Search jobs by title or keyword
- Filter by Full-time, Part-time, Contract, or Internship
- Sort by date posted, salary, or title
- View job details and apply directly from the listing
- Works on mobile and desktop

---

## How to run it locally

You need a local server to run it — opening the HTML file directly won't work because of CORS restrictions.

Clone the repo first:

```bash
git clone https://github.com/LorrisHIRA/web_summative_LorrisHIRA.git
cd web_summative_LorrisHIRA
```

Create a `config.js` file in the root folder with your API key:

```javascript
var API_KEY = 'your_api_key_here';
var API_HOST = 'jsearch.p.rapidapi.com';
```

Then start a local server:

```bash
python3 -m http.server 8000
```

Open your browser and go to `http://localhost:8000`.

---

## Project structure

```
web_summative_LorrisHIRA/
├── index.html       - HTML structure
├── css/
│   └── style.css    - Styling
├── js/
│   └── app.js       - JavaScript and API logic
├── config.js        - API key (not committed to repo)
├── .gitignore
└── README.md
```

---

## Deployment

The app is deployed on two Ubuntu servers with Nginx, and a load balancer (HAProxy) distributes traffic between them.

**Servers:**
- web-01: `44.211.163.139`
- web-02: `54.152.42.164`
- Load balancer: `54.211.223.13`

**To deploy on each web server:**

```bash
sudo apt update
sudo apt install nginx -y
sudo mkdir -p /var/www/hirajobs
cd /var/www/hirajobs
sudo git clone https://github.com/LorrisHIRA/web_summative_LorrisHIRA.git .
sudo nano config.js  # add your API key here
```

Create the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/hirajobs
```

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

```bash
sudo ln -s /etc/nginx/sites-available/hirajobs /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**To configure HAProxy on lb-01:**

```bash
sudo apt install haproxy -y
sudo nano /etc/haproxy/haproxy.cfg
```

Add to the config:

```
frontend http_front
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web01 44.211.163.139:80 check
    server web02 54.152.42.164:80 check
```

```bash
sudo systemctl restart haproxy
```

---

## API

This project uses the [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) by letscrape, available on RapidAPI. All job data comes from this API.

---

## Challenges

The main challenge was handling CORS when calling the API directly from the browser. Running the app through a local server instead of opening the HTML file directly fixed this. On the server side, making sure config.js was created manually after cloning (since it's gitignored) was easy to forget.

---

## Author

Hira Lorris — l.hira@alustudent.com
## Demo Video

[Watch the demo here](https://drive.google.com/file/d/1Ln02fhsZS-S8IodwPs7bohrgOHf-2SAI/view?usp=sharing)
