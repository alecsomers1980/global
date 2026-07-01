export const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Everest Syndication Agent</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    background: #f5f5f5;
    color: #333;
    padding: 16px;
  }
  .dashboard {
    max-width: 1000px;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 32px;
  }
  .header h1 {
    font-size: 24px;
    color: #333;
    margin-bottom: 6px;
  }
  .header p {
    font-size: 15px;
    color: #666;
    margin-bottom: 18px;
  }
  .info-banner {
    background: #fff3cd;
    border-left: 4px solid #ffeeba;
    padding: 12px 16px;
    border-radius: 4px;
    color: #856404;
    font-size: 14px;
    margin-bottom: 24px;
    line-height: 1.4;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .toolbar button {
    padding: 6px 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .toolbar button:hover {
    border-color: #d32f2f;
    color: #d32f2f;
  }
  .toolbar button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .status-message {
    font-size: 14px;
    color: #666;
    margin-left: auto;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #vehicle-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .vehicle-card {
    display: flex;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #eee;
  }
  .vehicle-card:last-child {
    border-bottom: none;
  }
  .vehicle-img-wrapper {
    flex-shrink: 0;
    margin-right: 16px;
  }
  .vehicle-img {
    width: 96px;
    height: 72px;
    border-radius: 6px;
    object-fit: cover;
    background: #e0e0e0;
    display: block;
  }
  .vehicle-img-placeholder {
    width: 96px;
    height: 72px;
    border-radius: 6px;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-size: 12px;
  }
  .vehicle-info {
    flex: 1;
    min-width: 0;
    padding-right: 16px;
  }
  .vehicle-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vehicle-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
  }
  .status-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 1.4;
  }
  .status-pill.available {
    background: #e8f5e9;
    color: #2e7d32;
  }
  .status-pill.default {
    background: #f5f5f5;
    color: #757575;
  }
  .portal-controls {
    display: flex;
    gap: 24px;
    flex-shrink: 0;
  }
  .portal-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .portal-btn {
    font-size: 12px;
    padding: 2px 8px;
    border: 1px solid #ccc;
    border-radius: 12px;
    background: #fff;
    color: #444;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
  }
  .portal-btn:hover {
    border-color: #d32f2f;
    color: #d32f2f;
  }
  .portal-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .caption {
    font-size: 11px;
    color: #888;
    cursor: default;
  }
  .caption a {
    color: #888;
    text-decoration: underline;
    cursor: pointer;
  }
  .caption a:hover {
    color: #555;
  }
  .row-status {
    font-size: 13px;
    margin-top: 2px;
  }
</style>
</head>
<body>
<div class="dashboard">
  <div class="header">
    <h1>Everest Syndication Agent</h1>
    <p>Push vehicles to cars.co.za &amp; AutoTrader</p>
  </div>
  <div class="info-banner">
    Before you start: open Chrome via Start-Agent, log in to cars.co.za AND AutoTrader (solve any 'Just a moment' check). Each button fills that car's listing and STOPS before submit — review it in the Chrome window and submit manually.
  </div>
  <div class="toolbar">
    <button id="refresh-button">Refresh</button>
    <button id="check-button">Check listings</button>
    <span class="status-message" id="status-message"></span>
  </div>
  <div id="vehicle-list"></div>
</div>
<script>
  var vehicles = [];
  var autoDetected = { carscoza: {}, autotrader: {} };
  var running = false;
  var vehicleStatuses = {};

  var vehicleList;
  var refreshButton;
  var checkButton;
  var statusMessage;

  function formatNumber(num) {
    return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ');
  }

  function disableAllRunBtns() {
    var btns = document.querySelectorAll('.run-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
    }
  }

  function updateRowStatus(id, text, color) {
    var el = document.getElementById('status-' + id);
    if (el) {
      el.textContent = text;
      el.style.color = color;
    }
  }

  async function runFill(id, portal, btn) {
    if (running) return;
    running = true;
    disableAllRunBtns();
    if (btn) {
      btn.innerText = btn.innerText + ' \\u2026';
    }
    updateRowStatus(id, 'Filling\\u2026 watch the Chrome window (30\\u201390s)', '#555');
    try {
      var res = await fetch('/create/' + portal, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      if (res.status === 409) {
        vehicleStatuses[id] = { text: 'Busy \\u2014 another run is in progress.', color: '#c62828' };
      } else if (!res.ok) {
        var msg;
        try {
          var d = await res.json();
          msg = d.error || (d.log && d.log.slice(-300)) || ('HTTP ' + res.status);
        } catch (e) {
          msg = 'HTTP ' + res.status;
        }
        vehicleStatuses[id] = { text: 'Failed: ' + msg, color: '#c62828' };
      } else {
        var data = await res.json();
        if (data.ok) {
          vehicleStatuses[id] = { text: '\\u2713 Filled \\u2014 review the Chrome window and submit manually.', color: '#2e7d32' };
        } else {
          var errMsg = data.error || (data.log && data.log.slice(-300)) || 'Unknown error';
          vehicleStatuses[id] = { text: 'Failed: ' + errMsg, color: '#c62828' };
        }
      }
    } catch (err) {
      vehicleStatuses[id] = { text: 'Cannot reach the agent. Is it running?', color: '#c62828' };
    } finally {
      running = false;
      render();
    }
  }

  async function markListed(id, portal, listed) {
    try {
      var res = await fetch('/mark-listed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, portal: portal, listed: listed })
      });
      if (res.ok) {
        for (var i = 0; i < vehicles.length; i++) {
          if (vehicles[i].id === id) {
            vehicles[i][portal + '_listed'] = listed;
            break;
          }
        }
        render();
      } else {
        var msg = 'Failed to update listing status.';
        try {
          var data = await res.json();
          if (data.error) msg = data.error;
        } catch (e) {}
        alert(msg);
      }
    } catch (err) {
      alert('Cannot reach the agent.');
    }
  }

  async function checkListings() {
    if (checkButton.disabled) return;
    checkButton.disabled = true;
    statusMessage.textContent = 'Checking portals\\u2026 (make sure you are logged in) \\u2014 this can take ~30s';
    try {
      var res = await fetch('/listed');
      if (res.status === 409) {
        statusMessage.textContent = 'Busy, try again shortly.';
      } else if (!res.ok) {
        var msg = 'HTTP error ' + res.status;
        try {
          var d = await res.json();
          msg = d.error || msg;
        } catch (e) {}
        statusMessage.textContent = msg;
      } else {
        var data = await res.json();
        if (data.ok) {
          autoDetected.carscoza = {};
          (data.carscoza || []).forEach(function(id) { autoDetected.carscoza[id] = true; });
          autoDetected.autotrader = {};
          (data.autotrader || []).forEach(function(id) { autoDetected.autotrader[id] = true; });
          var cCount = data.carscoza ? data.carscoza.length : 0;
          var aCount = data.autotrader ? data.autotrader.length : 0;
          statusMessage.textContent = 'Checked: ' + cCount + ' on cars.co.za, ' + aCount + ' on AutoTrader.';
          render();
        } else {
          statusMessage.textContent = data.error || 'Check listings failed.';
        }
      }
    } catch (err) {
      statusMessage.textContent = 'Cannot reach the agent.';
    } finally {
      checkButton.disabled = false;
    }
  }

  function loadVehicles() {
    fetch('/vehicles')
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data.ok) {
          vehicles = data.vehicles;
          render();
        } else {
          showError('Could not load vehicles from the agent.');
        }
      })
      .catch(function(err) {
        showError('Could not load vehicles from the agent.');
      });
  }

  function showError(msg) {
    vehicleList.innerHTML = '<div style="color:#d32f2f; padding:20px; text-align:center;">' + msg + ' <button id="retry-btn" style="margin-left:8px; padding:4px 12px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer;">Retry</button></div>';
    var retry = document.getElementById('retry-btn');
    if (retry) retry.addEventListener('click', loadVehicles);
  }

  function render() {
    var html = '';
    for (var i = 0; i < vehicles.length; i++) {
      var v = vehicles[i];
      var imgHtml;
      if (v.image) {
        imgHtml = '<img src="' + v.image + '" class="vehicle-img" alt="car">';
      } else {
        imgHtml = '<div class="vehicle-img-placeholder">No image</div>';
      }
      var title = [v.year, v.make, v.model].filter(Boolean).join(' ');
      var priceStr = v.price != null ? ('R ' + formatNumber(v.price)) : 'POA';
      var mileageStr = v.mileage != null ? (formatNumber(v.mileage) + ' km') : '';
      var pillClass = v.status === 'available' ? 'available' : 'default';
      var pillHtml = '<span class="status-pill ' + pillClass + '">' + v.status + '</span>';
      var subHtml = priceStr;
      if (mileageStr) subHtml += ' \\u00b7 ' + mileageStr;
      subHtml += ' ' + pillHtml;

      var controlsHtml = '';
      var portals = ['carscoza', 'autotrader'];
      for (var p = 0; p < portals.length; p++) {
        var portal = portals[p];
        var portalLabel = portal === 'carscoza' ? 'cars.co.za' : 'AutoTrader';
        var isListed = (v[portal + '_listed'] === true) || (autoDetected[portal] && autoDetected[portal][v.id] === true);
        controlsHtml += '<div class="portal-group">';
        if (isListed) {
          controlsHtml += '<button class="portal-btn" disabled style="opacity:.5; cursor:not-allowed;">' + portalLabel + ' \\u2713</button>';
          if (v[portal + '_listed'] === true) {
            controlsHtml += '<div class="caption"><a href="#" class="unmark-link" data-vehicle-id="' + v.id + '" data-portal="' + portal + '">unmark</a></div>';
          } else {
            controlsHtml += '<div class="caption" style="color:#888;">on portal</div>';
          }
        } else {
          controlsHtml += '<button class="portal-btn run-btn" data-vehicle-id="' + v.id + '" data-portal="' + portal + '"' + (running ? ' disabled' : '') + '>' + portalLabel + '</button>';
          controlsHtml += '<div class="caption"><a href="#" class="mark-link" data-vehicle-id="' + v.id + '" data-portal="' + portal + '">mark listed</a></div>';
        }
        controlsHtml += '</div>';
      }

      var statusContent = '';
      if (vehicleStatuses[v.id]) {
        statusContent = '<span style="color:' + vehicleStatuses[v.id].color + '">' + vehicleStatuses[v.id].text + '</span>';
      }

      html += '<div class="vehicle-card">' +
        '<div class="vehicle-img-wrapper">' + imgHtml + '</div>' +
        '<div class="vehicle-info">' +
          '<div class="vehicle-title">' + title + '</div>' +
          '<div class="vehicle-sub">' + subHtml + '</div>' +
          '<div class="row-status" id="status-' + v.id + '">' + statusContent + '</div>' +
        '</div>' +
        '<div class="portal-controls">' + controlsHtml + '</div>' +
      '</div>';
    }
    vehicleList.innerHTML = html;
  }

  function delegationHandler(e) {
    var target = e.target;
    if (target.classList.contains('run-btn')) {
      e.preventDefault();
      var vehicleId = parseInt(target.dataset.vehicleId);
      var portal = target.dataset.portal;
      runFill(vehicleId, portal, target);
      return;
    }
    if (target.classList.contains('unmark-link')) {
      e.preventDefault();
      var vehicleId = parseInt(target.dataset.vehicleId);
      var portal = target.dataset.portal;
      markListed(vehicleId, portal, false);
      return;
    }
    if (target.classList.contains('mark-link')) {
      e.preventDefault();
      var vehicleId = parseInt(target.dataset.vehicleId);
      var portal = target.dataset.portal;
      markListed(vehicleId, portal, true);
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    vehicleList = document.getElementById('vehicle-list');
    refreshButton = document.getElementById('refresh-button');
    checkButton = document.getElementById('check-button');
    statusMessage = document.getElementById('status-message');

    refreshButton.addEventListener('click', loadVehicles);
    checkButton.addEventListener('click', checkListings);
    vehicleList.addEventListener('click', delegationHandler);

    loadVehicles();
  });
</script>
</body>
</html>`;

