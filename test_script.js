const headers = ["A", "B"];
const row = new Array(headers.length).fill('');
const setVal = (colName, val) => {
  let idx = headers.findIndex(h => String(h).toLowerCase() === String(colName).toLowerCase());
  if (idx === -1) {
    headers.push(colName);
    idx = headers.length - 1;
  }
  row[idx] = val;
};
setVal("A", "val1");
setVal("C", "val2");
console.log(headers);
console.log(row);
