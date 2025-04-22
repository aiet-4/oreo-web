export function uploadReceipt(fileInput, employeeId) {
    // Create FormData instance
    const formData = new FormData();
    
    // Append file and employee ID
    formData.append("receipt", fileInput.files[0]);
    formData.append("employee_id", employeeId);
    
    // Configure request options
    const requestOptions = {
      method: "POST",
      body: formData,
      redirect: "follow"
    };
    
    // Send request to the API endpoint
    return fetch("http://0.0.0.0:8086/processReceipt", requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return "Receipt Sent for Processing!";
      });
  }