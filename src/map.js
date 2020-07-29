export function MP(ak) {
  return new Promise((resolve, reject) => {
    window.onload = function () {
      resolve(BMap)
    }
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://api.map.baidu.com/api?v=2.0&ak=" + ak + "&callback=init";
    script.onerror = reject;
    document.head.appendChild(script);
  })
}
