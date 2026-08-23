const e = new TypeError("Converting circular structure to JSON");
if (e.message === 'Failed to fetch' || e instanceof TypeError) {
  console.log('Caught as network error!');
}
