export const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Everest Syndication Agent</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f5f5f5;
    color: #212121;
    min-height: 100vh;
  }
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  header {
    margin-bottom: 24px;
  }
  header h1 {
    font-size: 28px;
    font-weight: 600;
    color: #d32f2f;
  }
  .subtitle {
    font-size: 16px;
    color: #616161;
    margin-top: 4px;
  }
  .info-banner {
    background: #fff3e0;
    border-left: 4px solid #ff9800;
    padding: 14px 18px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    color: #4e342e;
    margin-bottom: 28px;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  .btn {
    background: #d32f2f;
    color: white;
    border: none;
    padding: 9px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn:hover { background: #b71c1c; }
  .btn:active { background: #9a0007; }
  .toolbar-status {
    font-size: 14px;
    color: #616161;
  }
  .load-error {
    background: #ffebee;
    border-left: 4px solid #d32f2f;
    padding: 14px 18px;
    border-radius: 6px;
    color: #b71c1c;
    margin-bottom: 20px;
    display: none;
  }
  .retry-btn {
    background: #d32f2f;
    color: white;
    border: none;
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 13px;
  }
  .vehicle-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .vehicle-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .thumbnail {
    width: 96px;
    height: 72px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: #eee;
  }
  .placeholder {
    background: #eeeeee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #9e9e9e;
  }
  .details {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-weight: 600;
    font-size: 16px;
    color: #212121;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 14px;
    color: #616161;
  }
  .status-pill {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }
  .status-available { background: #c8e6c9; color: #2e7d32; }
  .status-unavailable { background: #e0e0e0; color: #424242; }
  .status-pill.filling { background: #fff3e0; color: #e65100; }
  .status-pill.success { background: #c8e6c9; color: #2e7d32; }
  .status-pill.error { background: #ffebee; color: #c62828; }
  .status-pill.busy { background: #fff3e0; color: #e65100; }
  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .action-btn {
    background: #d32f2f;
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
  }
  .action-btn:hover { background: #b71c1c; }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #d32f2f;
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Everest Syndication Agent</h1>
    <p class="subtitle">Push vehicles to cars.co.za &amp; AutoTrader</p>
  </header>

  <div class="info-banner">
    Before you start: open Chrome via Start-Agent, log in to cars.co.za AND AutoTrader (solve any "Just a moment" check). Each button fills that car's listing and STOPS before submit — review it in the Chrome window and submit manually.
  </div>

  <div class="toolbar">
    <button id="refresh-btn" class="btn">Refresh</button>
    <span id="toolbar-status" class="toolbar-status"></span>
  </div>

  <div id="load-error" class="load-error"></div>
  <div id="vehicle-list" class="vehicle-list"></div>
</div>

<script>
(function() {
  var running = false;
  var vehicleList = document.getElementById('vehicle-list');
  var toolbarStatus = document.getElementById('toolbar-status');
  var loadErrorDiv = document.getElementById('load-error');

  function formatNum(num) {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ');
  }

  function renderVehicles(vehicles) {
    var html = '';
    for (var i = 0; i < vehicles.length; i++) {
      var v = vehicles[i];
      html += '<div class="vehicle-card" data-id="' + v.id + '">';

      if (v.image) {
        html += '<img class="thumbnail" src="' + v.image + '" alt="">';
      } else {
        html += '<div class="thumbnail placeholder"><span>No image</span></div>';
      }

      html += '<div class="details">';
      html += '<div class="title">' + v.year + ' ' + v.make + ' ' + v.model + '</div>';
      html += '<div class="sub-line">';

      var priceStr = v.price !== null && v.price !== undefined ? 'R ' + formatNum(v.price) : 'POA';
      html += '<span>' + priceStr + '</span>';

      if (v.mileage !== null && v.mileage !== undefined) {
        html += '<span>·</span><span>' + formatNum(v.mileage) + ' km</span>';
      }

      var statusClass = v.status === 'available' ? 'status-available' : 'status-unavailable';
      html += '<span class="status-pill ' + statusClass + '">' + v.status + '</span>';
      html += '</div></div>';

      html += '<div class="actions">';
      html += '<button class="action-btn" data-vehicle-id="' + v.id + '" data-portal="carscoza">cars.co.za</button>';
      html += '<button class="action-btn" data-vehicle-id="' + v.id + '" data-portal="autotrader">AutoTrader</button>';
      html += '</div>';

      html += '</div>';
    }
    vehicleList.innerHTML = html;
  }

  function loadVehicles() {
    loadErrorDiv.style.display = 'none';
    vehicleList.innerHTML = '';
    toolbarStatus.textContent = 'Loading…';

    fetch('/vehicles')
      .then(function(res) {
        if (!res.ok) throw new Error('Could not load vehicles');
        return res.json();
      })
      .then(function(data) {
        if (!data.ok || !Array.isArray(data.vehicles)) throw new Error('Invalid data');
        toolbarStatus.textContent = 'Loaded ' + data.vehicles.length + ' vehicle' + (data.vehicles.length !== 1 ? 's' : '');
        renderVehicles(data.vehicles);
      })
      .catch(function(err) {
        console.error(err);
        toolbarStatus.textContent = 'Error';
        loadErrorDiv.style.display = 'block';
        loadErrorDiv.innerHTML = '<p>Could not load vehicles from the agent.</p><button id="retry-btn" class="retry-btn">Retry</button>';
        document.getElementById('retry-btn').addEventListener('click', function() { loadVehicles(); });
      });
  }

  document.getElementById('refresh-btn').addEventListener('click', loadVehicles);

  vehicleList.addEventListener('click', function(e) {
    var btn = e.target.closest ? e.target.closest('.action-btn') : null;
    if (!btn) return;
    if (running) return;

    var vehicleId = btn.dataset.vehicleId;
    var portal = btn.dataset.portal;
    var card = document.querySelector('.vehicle-card[data-id="' + vehicleId + '"]');
    if (!card) return;
    var statusBadge = card.querySelector('.status-pill');
    var originalText = btn.innerText;

    running = true;
    var allButtons = document.querySelectorAll('.action-btn');
    allButtons.forEach(function(b) { b.disabled = true; });

    btn.innerText = portal === 'carscoza' ? 'cars.co.za …' : 'AutoTrader …';
    statusBadge.textContent = 'Filling… watch the Chrome window (30–90s)';
    statusBadge.className = 'status-pill filling';

    fetch('/create/' + portal, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: vehicleId })
    })
    .then(function(res) {
      if (res.status === 409) {
        statusBadge.textContent = 'Busy — another run is in progress. Try again shortly.';
        statusBadge.className = 'status-pill busy';
        return;
      }
      return res.json().then(function(data) {
        if (data.ok) {
          statusBadge.textContent = '✓ Filled — review the Chrome window and submit manually.';
          statusBadge.className = 'status-pill success';
        } else {
          var msg = data.error || (data.log ? data.log.slice(-300) : ('HTTP ' + res.status));
          statusBadge.textContent = 'Failed: ' + msg;
          statusBadge.className = 'status-pill error';
        }
      }).catch(function() {
        statusBadge.textContent = 'Failed: Could not parse response';
        statusBadge.className = 'status-pill error';
      });
    })
    .catch(function(err) {
      statusBadge.textContent = 'Cannot reach the agent. Is it running?';
      statusBadge.className = 'status-pill error';
    })
    .finally(function() {
      running = false;
      allButtons.forEach(function(b) { b.disabled = false; });
      btn.innerText = originalText;
    });
  });

  loadVehicles();
})();
</script>
</body>
</html>`;

