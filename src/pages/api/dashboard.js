export default function fetchAllFiles() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.E2E_TOKEN}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  return fetch("http://216.48.190.50:8080/getAllFiles", requestOptions);
}