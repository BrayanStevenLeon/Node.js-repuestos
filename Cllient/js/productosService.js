async function getBicicletas(){
    const res = await fetch("https://nodejs-repuestos-production.up.railway.app/productos");
    const resJson = await res.json();
    return resJson;
   }
   