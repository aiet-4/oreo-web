export default function fetchAllFiles() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.E2E_TOKEN}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  return fetch("https://a274ba2959052.notebooks.jarvislabs.net/getAllFiles", requestOptions);
}