document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://127.0.0.1:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, contraseña: password }) 
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (response.ok) {
        
        localStorage.setItem('usuario', JSON.stringify(data.user));

        window.location.href = 'dashboard.html'; 
    } else {
        mostrarToast(data.message || data.error);
    }
});


function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.innerText = mensaje; 
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000); 
}
