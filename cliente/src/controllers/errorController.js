function showError(message) {
    console.log(message);
    var errorBox = $('#errorBox');
    errorBox.append(message);
}

function cleanError() {
    $('#errorBox').empty();
}