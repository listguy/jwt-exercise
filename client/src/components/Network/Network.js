import Cookies from "js-cookie";

async function Network(endPoint, { body, ...config }) {
  const headers = {
    "Content-Type": "application/json;charset=utf-8'",
    Authorization: `Berear ${Cookies.get("accessToken")}`,
  };

  const url = `${endPoint}`;

  const customConfig = {
    method: body ? "POST" : "GET",
    ...config,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  console.log(customConfig);

  const request = new Request(url, customConfig);

  try {
    const response = await fetch(request);
    const data = await response.json();

    if (response.status === 200) {
      console.log(`Got response ${response.status}`, data);
      return data;
    } else {
      if (response.status === 403) {
        const refreshToken = Cookies.get("refreshToken");
        const { accessToken } = await Network.post("/users/token", {
          token: refreshToken,
        });

        Cookies.set("accessToken", accessToken);

        const data2 = await Network(request.url, request);
        return data2;
      }
      console.error(`${response.status} : '${data}'`);
      throw data;
    }
  } catch (error) {
    if (error.status === 500) {
      alert("Internal error");
    }
    console.log(error);
    throw error;
  }
}

Network.get = (endPoint) => Network(endPoint, { method: "GET" });
Network.post = (endPoint, body) => Network(endPoint, { method: "POST", body });
Network.put = (endPoint, body) => Network(endPoint, { method: "PUT", body });
Network.delete = (endPoint) => Network(endPoint, { method: "DELETE" });
Network.options = (endPoint) => Network(endPoint, { method: "OPTIONS" });

export default Network;
