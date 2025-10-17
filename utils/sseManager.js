// sseManager.js

// Maintain maps of SSE connections
const sseVendorClients = {};  // vendorId => [res, res, ...]
const sseBuyerClients = {};   // buyerId => [res, res, ...]

// Add vendor SSE client
function addVendorClient(vendorId, res) {
  if (!sseVendorClients[vendorId]) {
    sseVendorClients[vendorId] = [];
  }
  sseVendorClients[vendorId].push(res);
}

// Remove vendor SSE client (on disconnect)
function removeVendorClient(vendorId, res) {
  if (sseVendorClients[vendorId]) {
    sseVendorClients[vendorId] = sseVendorClients[vendorId].filter(r => r !== res);
  }
}

// Send a message to a vendor
function notifyVendor(vendorId, data) {
  if (sseVendorClients[vendorId]) {
    sseVendorClients[vendorId].forEach(res => {
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        console.error('Error writing SSE to vendor', vendorId, e);
      }
    });
  }
}

// Similarly for buyers if needed
function addBuyerClient(buyerId, res) {
  if (!sseBuyerClients[buyerId]) {
    sseBuyerClients[buyerId] = [];
  }
  sseBuyerClients[buyerId].push(res);
}

function removeBuyerClient(buyerId, res) {
  if (sseBuyerClients[buyerId]) {
    sseBuyerClients[buyerId] = sseBuyerClients[buyerId].filter(r => r !== res);
  }
}

function notifyBuyer(buyerId, data) {
  if (sseBuyerClients[buyerId]) {
    sseBuyerClients[buyerId].forEach(res => {
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        console.error('Error writing SSE to buyer', buyerId, e);
      }
    });
  }
}

module.exports = {
  addVendorClient,
  removeVendorClient,
  notifyVendor,
  addBuyerClient,
  removeBuyerClient,
  notifyBuyer,
};
