
var jobData = [];
var currentType = '';

document.getElementById('inputQuery').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});

document.getElementById('inputLocation').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
    closeContact();
  }
});

function showToast(msg, isError) {
  var el = document.getElementById('toastBox');
  el.textContent = msg;
  el.className = 'toast visible' + (isError ? ' is-error' : '');
  setTimeout(function() { el.className = 'toast'; }, 3500);
}

function pickFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  currentType = btn.getAttribute('data-type');
  renderList();
}

function getSorted() {
  var list = jobData.slice();

  if (currentType) {
    list = list.filter(function(j) {
      return (j.job_employment_type || '').toUpperCase() === currentType;
    });
  }

  var sort = document.getElementById('sortBy').value;

  if (sort === 'date') {
    list.sort(function(a, b) {
      return (b.job_posted_at_timestamp || 0) - (a.job_posted_at_timestamp || 0);
    });
  } else if (sort === 'salary') {
    list.sort(function(a, b) {
      return (b.job_max_salary || b.job_min_salary || 0) - (a.job_max_salary || a.job_min_salary || 0);
    });
  } else if (sort === 'title') {
    list.sort(function(a, b) {
      return (a.job_title || '').localeCompare(b.job_title || '');
    });
  }

  return list;
}

async function doSearch() {
  var query = document.getElementById('inputQuery').value.trim();
  var location = document.getElementById('inputLocation').value.trim();

  if (!query) {
    showToast('Please enter a job title or keyword.', true);
    return;
  }

  var btn = document.getElementById('btnSearch');
  btn.disabled = true;
  btn.textContent = 'Searching...';
  document.getElementById('resultsMeta').style.display = 'none';
  document.getElementById('resultArea').innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

  var q = location ? query + ' in ' + location : query;

  try {
    var response = await fetch(
      'https://jsearch.p.rapidapi.com/search?query=' + encodeURIComponent(q) + '&num_pages=3&page=1',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST
        }
      }
    );

    if (!response.ok) {
      throw new Error('Server returned status ' + response.status);
    }

    var data = await response.json();

    if (!data.data || data.data.length === 0) {
      document.getElementById('resultArea').innerHTML =
        '<div class="placeholder"><h3>No results found</h3><p>Try different keywords or a broader location.</p></div>';
      return;
    }

    jobData = data.data;
    renderList();

  } catch (err) {
    console.error(err);
    document.getElementById('resultArea').innerHTML =
      '<div class="placeholder"><h3>Something went wrong</h3><p>' + err.message + '</p></div>';
    showToast('Could not load jobs. Check your connection.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Search Jobs';
  }
}

function renderList() {
  var list = getSorted();

  var meta = document.getElementById('resultsMeta');
  meta.style.display = 'block';
  meta.innerHTML = 'Showing <strong>' + list.length + '</strong> of <strong>' + jobData.length + '</strong> results';

  if (list.length === 0) {
    document.getElementById('resultArea').innerHTML =
      '<div class="placeholder"><h3>No matches</h3><p>Try a different filter.</p></div>';
    return;
  }

  var html = '<div class="job-list">';
  for (var i = 0; i < list.length; i++) {
    html += buildCard(list[i], i);
  }
  html += '</div>';
  document.getElementById('resultArea').innerHTML = html;
}

function buildCard(job, index) {
  var initial = (job.employer_name || '?').charAt(0).toUpperCase();
  var logoHtml = job.employer_logo
    ? '<img src="' + job.employer_logo + '" alt="" onerror="this.style.display=\'none\';this.parentElement.textContent=\'' + initial + '\'">'
    : initial;

  var location = [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Location not listed';
  var type = (job.job_employment_type || '').replace(/_/g, ' ');
  var salary = job.job_min_salary
    ? '$' + Math.round(job.job_min_salary / 1000) + 'k - $' + Math.round(job.job_max_salary / 1000) + 'k'
    : '';
  var posted = job.job_posted_at_datetime_utc ? timeAgo(new Date(job.job_posted_at_datetime_utc)) : '';

  return '<div class="job-card" onclick="openModal(' + index + ')">' +
    '<div class="logo-box">' + logoHtml + '</div>' +
    '<div>' +
      '<div class="job-title">' + (job.job_title || 'Untitled Position') + '</div>' +
      '<div class="job-company">' + (job.employer_name || 'Unknown') + (salary ? ' &middot; ' + salary : '') + '</div>' +
      '<div class="tag-row">' +
        (job.job_is_remote ? '<span class="tag tag-green">Remote</span>' : '') +
        (type ? '<span class="tag tag-navy">' + type + '</span>' : '') +
        '<span class="tag tag-plain">' + location + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="job-side">' +
      '<span class="job-date">' + posted + '</span>' +
      '<button class="btn-view">View</button>' +
    '</div>' +
  '</div>';
}

function openModal(index) {
  var job = getSorted()[index];
  if (!job) return;

  var location = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Not specified';
  var type = (job.job_employment_type || '').replace(/_/g, ' ');
  var salary = job.job_min_salary
    ? '$' + Math.round(job.job_min_salary / 1000) + 'k - $' + Math.round(job.job_max_salary / 1000) + 'k per year'
    : 'Not disclosed';
  var description = (job.job_description || 'No description available.').substring(0, 700) + '...';
  var skills = job.job_required_skills && job.job_required_skills.length
    ? '<div class="modal-section"><h4>Required Skills</h4><p>' + job.job_required_skills.join(', ') + '</p></div>'
    : '';

  document.getElementById('modalInner').innerHTML =
    '<div class="modal-title">' + (job.job_title || 'Untitled') + '</div>' +
    '<div class="modal-company">' + (job.employer_name || 'Unknown') + ' &middot; ' + location + '</div>' +
    '<div class="modal-tags">' +
      (job.job_is_remote ? '<span class="tag tag-green">Remote</span>' : '') +
      (type ? '<span class="tag tag-navy">' + type + '</span>' : '') +
      '<span class="tag tag-gold">Salary: ' + salary + '</span>' +
    '</div>' +
    '<div class="modal-section"><h4>About the role</h4><p>' + description.replace(/\n/g, '<br>') + '</p></div>' +
    skills +
    '<a href="' + (job.job_apply_link || '#') + '" target="_blank" class="btn-apply">Apply now</a>';

  document.getElementById('modalBg').classList.add('open');
}

function handleOverlay(e) {
  if (e.target === document.getElementById('modalBg')) closeModal();
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
}

function openContact() {
  document.getElementById('contactModalBg').classList.add('open');
}

function closeContact() {
  document.getElementById('contactModalBg').classList.remove('open');
}

function timeAgo(date) {
  var diff = (Date.now() - date) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return Math.floor(diff / 604800) + 'w ago';
}
