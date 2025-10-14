/* --------------- Callback Version --------------- */
function fetchData(callback) {
  let err = null;
  setTimeout(() => {
    callback(err, "Data fetched");
  }, 1000);
}

fetchData((err, data) => {
  if (err) return console.error(err);
  console.log(data);
});

/* --------------- Promise Version --------------- */
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched");
      // if an error happens, we call reject instead of resolve
    }, 1000);
  });
}

fetchData()
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });

/* --------------- Async-Await Version --------------- */

function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched");
    }, 3000);
  });
}

(async () => {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();
