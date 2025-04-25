export default function fetchAllFiles() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.E2E_TOKEN}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  return fetch("https://notebooks.e2enetworks.com/tensorboard/notebook/p-4220/n-afb2afa8-c44f-4c9d-a41c-1f7a43954342/getAllFiles", requestOptions);
}