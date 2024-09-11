function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '../agent/agent.html';
        } else {
            alert('Login failed. Check your credentials.');
        }
    });
}

function register() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    fetch('register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name, email: email, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'login.html';
        } else {
            alert('Registration failed. Try again.');
        }
    });
}
