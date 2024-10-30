// Data
var encodedURL = "\u0018\u0011\u000e\u0014\u0016VAF\r\b\u0005\u001dW\u0005\u0015\u0005@\n\u0004\u0004_\u0004\n\rJ\u001a_F\u000f\u0007\u0014\u0016\u001f\u0017\u0016\u0005\u0001\u00074QITJ]]]_[^PGQKQTC";
var loadedOrder = [];
var gameID = "";
var decodingKey = "";
var orderInterval;
var isAdmin = false;

// Helpers
function checkOrderArrayEquality(arr1, arr2) {
  if (arr1.length !== arr2.length) 
	return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].id != arr2[i].id) {
      return false;
    }
  }
  
  return true;
}

function moveFirstToEnd(arr) {
  if (arr.length > 0) {
    arr.push(arr.shift());
  }
  return arr;
}

function xorCipher(text, key) {
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  
  return result;
}

// On-load functions
function getSession() {
	const urlParams = new URLSearchParams(window.location.search);
	decodingKey = urlParams.get('key'); 
	gameID = urlParams.get('game');
	isAdmin = urlParams.get('admin') ? true : false;
	
	if (decodingKey && decodingKey.length > 0 && gameID && gameID.length > 0) {
		orderInterval = setInterval(() => {
		  getOrder();
		}, 3000);
	}
}
getSession();

// Functions
function checkOrder(newOrder) {
	if (!checkOrderArrayEquality(loadedOrder, newOrder)) {
		loadedOrder = newOrder;
		$("#orderSet").text(loadedOrder[0].name);
	}
}

function getOrder() {
	$.ajax({
		url: xorCipher(encodedURL, decodingKey) + gameID,
		type: "GET",
		success: function (data) {
			var parsedData = data;
			if (parsedData.status && parsedData.status == "success") {
				checkOrder(parsedData.result[0].order);
			} else if (!parsedData.status || parsedData.status != "success") {
				clearInterval(orderInterval);
				$("#orderSet").text("Error detected.");
			}
		},
		error: function (err) {
			// TODO:
			// Show an error, if needed
		},
	});
}

function changeOrder() {
	let jsonData = [{ "order": moveFirstToEnd(loadedOrder) }];
	
	$.ajax({
		url: xorCipher(encodedURL, decodingKey) + gameID,
		type: "PUT",
		contentType: "application/json",
		data: JSON.stringify(jsonData),
		success: function (data) {
			var parsedData = data;
			if (parsedData.status && parsedData.status == "success") {
				loadedOrder = parsedData.result[0].order;
				$("#orderSet").text(loadedOrder[0].name);
			} else if (!parsedData.status || parsedData.status != "success") {
				clearInterval(orderInterval);
				$("#orderSet").text("Error detected.");
			}
		},
		error: function (err) {
			// TODO:
			// Show an error, if needed
		},
	});
}

// After Document Load functions
$(document).ready(function() {
  if (!isAdmin) {
	$("#orderChangeBtn").addClass("hidden");
  }
});