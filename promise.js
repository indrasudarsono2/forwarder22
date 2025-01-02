// function asyncOperation() {
//   return new Promise((resolve, reject) => {
//     // Simulating an asynchronous operation (e.g., API call, database query)
//     setTimeout(() => {
//       const success = true; // Modify this based on your logic
//       if (success) {
//         resolve('Operation completed successfully.');
//       } else {
//         reject(new Error('Operation failed.'));
//       }
//     }, 2000); // Simulating a delay of 2 seconds
//   });
// }

// // Using the promise
// asyncOperation()
//   .then(result => {
//     console.log(result);
//     // Handle the successful result here
//   })
//   .catch(error => {
//     console.error(error);
//     // Handle the error case here
//   });

function getData(){
  return new Promise((resolve, reject) => {
    const success = false; // Modify this based on your logic
      if (success) {
        resolve('Operation completed successfully.');
      } else {
        reject(new Error('Operation failed.'));
      }
  })
}

getData()
.then(result => {
  console.log(result)
})
.catch(error => {
  console.log(error)
})
