export function uploadReceipt(base_64_string, employeeId) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.E2E_TOKEN}`);

  const formdata = new FormData();
  formdata.append("receipt_base_64", base_64_string);
  formdata.append("employee_id", employeeId);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow"
  };

  return fetch("https://notebooks.e2enetworks.com/tensorboard/notebook/p-4220/n-afb2afa8-c44f-4c9d-a41c-1f7a43954342/processReceipt", requestOptions);
}
