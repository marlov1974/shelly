// spotprice-dampers tibber-query 1.1.0-tibber
function tibberPayload() {
  // Compact GraphQL body. Tibber priceInfo normally returns prices incl VAT for the home.
  return JSON.stringify({
    query: "{viewer{homes{currentSubscription{priceInfo{today{total startsAt}tomorrow{total startsAt}}}}}}"
  });
}

function tibberHeaders(token) {
  return {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  };
}
