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

  return fetch("https://a274ba2959052.notebooks.jarvislabs.net/processReceipt", requestOptions);
}
