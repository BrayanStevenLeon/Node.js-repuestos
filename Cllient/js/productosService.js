async function getBicicletas(){
    const res = await fetch("http://nodejs-repuestos-production.up.railway.app/productos");
    const resJson = await res.json();
    return resJson;
   }
   